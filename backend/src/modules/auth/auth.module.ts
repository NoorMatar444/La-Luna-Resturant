import { Module } from '@nestjs/common';
import { EmailService } from '../../common/services/email.services';
import { RedisModule } from '../../common/services/reids.module';
import { TokenService } from '../../common/services/token.services';
import { SecurityService } from '../../common/security/securityServive';
import { UserRepo as TokenUserRepo } from '../../common/repo/user.repo';
import UserModel from '../../models/user.model';
import { UserRepo } from '../../repo/user.repo';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [UserModel, RedisModule],
  controllers: [AuthController],
  exports: [AuthService],
  providers: [
    AuthService,
    TokenService,
    SecurityService,
    EmailService,
    UserRepo,
    TokenUserRepo,
  ],
})
export class AuthModule {}
