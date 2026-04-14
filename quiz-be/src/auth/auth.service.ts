import {
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomInt, randomUUID } from 'crypto';
import { AUTH_ERRORS } from '../common/business-errors/auth-errors';
import { BusinessException } from '../common/exceptions/business.exception';
import { PrismaService } from '../prisma.service';
import { LoginDto, RegisterDto, ResetPasswordDto } from './dto/auth.dto';
import { ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL } from './auth.constants';
import { JwtPayload } from './auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private async buildAuthorities(userId: string): Promise<string[]> {
    const rows = await this.prisma.userRole.findMany({
      where: { user_id: userId },
      include: { role: true },
    });
    return rows.map((r) => r.role.authority);
  }

  private async signTokens(userId: string, email: string, username: string) {
    const authorities = await this.buildAuthorities(userId);
    const payload: JwtPayload = {
      sub: userId,
      email,
      username,
      authorities,
    };

    const access_token = await this.jwtService.signAsync(payload, {
      secret:
        process.env.JWT_ACCESS_SECRET ||
        process.env.JWT_SECRET ||
        'dev-access-secret',
      expiresIn: ACCESS_TOKEN_TTL,
    });

    const refresh_token = await this.jwtService.signAsync(payload, {
      secret:
        process.env.JWT_REFRESH_SECRET ||
        process.env.JWT_SECRET ||
        'dev-refresh-secret',
      expiresIn: REFRESH_TOKEN_TTL,
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { refresh_token },
    });

    return { access_token, refresh_token, authorities };
  }

  private mapPublicUser(user: {
    id: string;
    email: string;
    username: string;
    full_name: string | null;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    current_streak: number;
    longest_streak: number;
    ranking_points: number;
    total_quizzes_completed: number;
  }) {
    const fullName =
      user.full_name ||
      [user.first_name, user.last_name].filter(Boolean).join(' ') ||
      undefined;

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      name: fullName,
      avatar: user.avatar_url ?? undefined,
      currentStreak: user.current_streak,
      longestStreak: user.longest_streak,
      rankingPoints: user.ranking_points,
      totalQuizzesCompleted: user.total_quizzes_completed,
    };
  }

  async register(data: RegisterDto) {
    const existed = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          data.username ? { username: data.username } : undefined,
          data.phone ? { phone: data.phone } : undefined,
        ].filter(Boolean) as any,
      },
    });

    if (existed) {
      throw new BusinessException(AUTH_ERRORS.USER_ALREADY_EXISTS);
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const username = data.username || data.email.split('@')[0];
    const full_name = [data.firstName, data.lastName].filter(Boolean).join(' ');

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        username,
        password: passwordHash,
        first_name: data.firstName,
        last_name: data.lastName,
        full_name: full_name || null,
        phone: data.phone,
        gender: data.gender,
        dob: data.dob ? new Date(data.dob) : null,
        is_active: false,
      },
    });

    const userRole =
      (await this.prisma.role.findUnique({ where: { authority: 'USER' } })) ||
      (await this.prisma.role.create({ data: { authority: 'USER' } }));

    await this.prisma.userRole.create({
      data: {
        user_id: user.id,
        role_id: userRole.id,
      },
    });

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.full_name || undefined,
    };
  }

  async login(data: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: data.username }, { username: data.username }],
      },
    });

    if (!user || user.is_delete || !user.is_active) {
      throw new BusinessException(AUTH_ERRORS.INVALID_CREDENTIALS);
    }

    const matched = await bcrypt.compare(data.password, user.password);
    if (!matched) {
      throw new BusinessException(AUTH_ERRORS.INVALID_CREDENTIALS);
    }

    const tokens = await this.signTokens(user.id, user.email, user.username);

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.full_name || undefined,
        authorities: tokens.authorities.map((authority) => ({ authority })),
      },
    };
  }

  async getAccount(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        full_name: true,
        first_name: true,
        last_name: true,
        avatar_url: true,
        current_streak: true,
        longest_streak: true,
        ranking_points: true,
        total_quizzes_completed: true,
      },
    });

    if (!user) {
      throw new BusinessException(AUTH_ERRORS.USER_NOT_FOUND);
    }

    const authorities = await this.buildAuthorities(user.id);
    return {
      ...this.mapPublicUser(user),
      authorities: authorities.map((authority) => ({ authority })),
    };
  }

  async refresh(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.is_active || user.is_delete) {
      throw new BusinessException(AUTH_ERRORS.INVALID_USER);
    }

    const tokens = await this.signTokens(user.id, user.email, user.username);
    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.full_name || undefined,
      },
    };
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refresh_token: null },
    });
  }

  async verifyOtp(email: string, otp: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new BusinessException(AUTH_ERRORS.USER_NOT_FOUND);
    }
    if (!user.otp || user.otp !== otp) {
      throw new BusinessException(AUTH_ERRORS.OTP_INVALID);
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        otp: null,
        otp_generated_time: null,
        is_active: true,
      },
    });
  }

  async regenerateOtp(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new BusinessException(AUTH_ERRORS.USER_NOT_FOUND);
    }

    const otp = randomInt(100000, 999999).toString();
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        otp,
        otp_generated_time: new Date(),
      },
    });
    return otp;
  }

  async checkEmail(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return {
      exists: !!user,
      isOAuth2User: !!user?.google_id,
      provider: user?.google_id ? 'GOOGLE' : undefined,
      message: user ? 'Email already exists' : 'Email is available',
    };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return 'If account exists, reset link has been created';
    }
    const token = randomUUID();
    const expiry = new Date(Date.now() + 30 * 60 * 1000);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        reset_password_token: token,
        reset_password_token_expiry: expiry,
      },
    });
    return token;
  }

  async resetPassword(data: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: { reset_password_token: data.token },
    });
    if (!user || !user.reset_password_token_expiry) {
      throw new BusinessException(AUTH_ERRORS.RESET_TOKEN_INVALID);
    }
    if (user.reset_password_token_expiry.getTime() < Date.now()) {
      throw new BusinessException(AUTH_ERRORS.RESET_TOKEN_EXPIRED);
    }

    const passwordHash = await bcrypt.hash(data.newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: passwordHash,
        reset_password_token: null,
        reset_password_token_expiry: null,
      },
    });
  }
}
