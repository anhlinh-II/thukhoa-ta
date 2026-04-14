import { Module } from '@nestjs/common';
import { ApiHandlerService, ZenStackModule } from '@zenstackhq/server/nestjs';
import { enhance } from '../../node_modules/.zenstack/enhance';
import { PrismaService } from '../prisma.service';
import { ZenstackController } from './zenstack.controller';

@Module({
  imports: [
    ZenStackModule.registerAsync({
      useFactory: (...args: unknown[]) => {
        const prisma = args[0] as PrismaService;

        return {
          getEnhancedPrisma: () => enhance(prisma),
        };
      },
      inject: [PrismaService],
      extraProviders: [PrismaService],
    }),
  ],
  controllers: [ZenstackController],
  providers: [PrismaService, ApiHandlerService],
  exports: [PrismaService],
})
export class ZenstackApiModule {}
