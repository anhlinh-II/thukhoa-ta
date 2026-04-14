import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { AuthService } from './auth.service';
import {
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ResponseMessage('Login success')
  async login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('account')
  @ResponseMessage('Get account success')
  async account(@Req() req: Request & { user?: { sub?: string } }) {
    const result = await this.authService.getAccount(req.user!.sub!);
    return { user: result };
  }

  @UseGuards(JwtAuthGuard)
  @Get('refresh')
  @ResponseMessage('Refresh success')
  async refresh(@Req() req: Request & { user?: { sub?: string } }) {
    return this.authService.refresh(req.user!.sub!);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ResponseMessage('Logout success')
  async logout(@Req() req: Request & { user?: { sub?: string } }) {
    await this.authService.logout(req.user!.sub!);
    return null;
  }

  @Post('register')
  @ResponseMessage('Register success')
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post('verify-otp')
  @ResponseMessage('OTP verified')
  async verifyOtp(@Query('email') email: string, @Query('otp') otp: string) {
    await this.authService.verifyOtp(email, otp);
    return null;
  }

  @Post('regenerate-otp')
  @ResponseMessage('OTP regenerated')
  async regenerateOtp(@Query('email') email: string) {
    return this.authService.regenerateOtp(email);
  }

  @Get('check-email')
  @ResponseMessage('Check email success')
  async checkEmail(@Query('email') email: string) {
    return this.authService.checkEmail(email);
  }

  @Get('oauth2-url')
  @ResponseMessage('Get oauth2 url success')
  async oauth2Url() {
    return {
      googleAuthUrl: '',
      instruction: 'OAuth2 is not configured yet.',
    };
  }

  @Post('forgot-password')
  @ResponseMessage('Forgot password request success')
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  @ResponseMessage('Reset password success')
  async resetPassword(@Body() body: ResetPasswordDto) {
    await this.authService.resetPassword(body);
    return null;
  }
}
