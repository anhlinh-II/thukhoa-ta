import { Module } from '@nestjs/common';
import { ApiHandlerService, ZenStackModule } from '@zenstackhq/server/nestjs';
import { PrismaService } from '../prisma.service';
import { ZenstackController } from './zenstack.controller';

type EnhanceFn = (prisma: PrismaService) => unknown;

function loadEnhance(): EnhanceFn {
  try {
    const loaded = require('../../node_modules/.zenstack/enhance') as {
      enhance?: EnhanceFn;
    };

    if (typeof loaded.enhance === 'function') {
      return loaded.enhance;
    }
  } catch {
    // fallback below
  }

  return (prisma: PrismaService) => prisma;
}

@Module({
  imports: [
    ZenStackModule.registerAsync({
      useFactory: (...args: unknown[]) => {
        const prisma = args[0] as PrismaService;
        const enhance = loadEnhance();

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
