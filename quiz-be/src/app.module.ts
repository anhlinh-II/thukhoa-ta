import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { RolePermissionModule } from './role-permissions/role-permission.module';
import { ZenstackApiModule } from './zenstack/zenstack.module';

@Module({
  imports: [AuthModule, RolePermissionModule, ZenstackApiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
