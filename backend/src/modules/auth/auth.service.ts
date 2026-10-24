import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TokenEnum } from 'src/common/enums/token.enum';
import { RoleEnum } from 'src/common/enums/user.enum';
import { EmailService } from 'src/common/services/email.services';
import { RedisService } from 'src/common/services/redis.service';
import { UserRepo } from 'src/repo/user.repo';
import { SecurityService } from '../../common/security/securityServive';
import { TokenService } from '../../common/services/token.services';
import { SignInDto, SignUpDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly ConfigService: ConfigService,
    private readonly TokenService: TokenService,
    private readonly SecurityService: SecurityService,
    private readonly UserRepo: UserRepo,
    private readonly RedisService: RedisService,
    private readonly EmailService: EmailService,
  ) {}
  async signup(body: SignUpDto) {
    const email = body.email.toLowerCase();
    const { password, fullName } = body;
    if (await this.UserRepo.findOne({ filter: { email } })) {
      throw new ConflictException('Email already exists');
    }
    const hashedPassword = await this.SecurityService.hashOperation({
      data: password,
      saltOrRounds: Number(
        this.ConfigService.getOrThrow<string>('SALT_OR_ROUNDS'),
      ),
    });
    const createdUser = await this.UserRepo.create({
      data: {
        userName: fullName,
        email,
        password: hashedPassword,
        role: RoleEnum.CUSTOMER,
        confirmEmail: false,
        isActive: true,
      },
    });
    const otp = this.SecurityService.generateOtp();
    const hashedOtp = await this.SecurityService.hashOperation({
      data: otp,
      saltOrRounds: Number(
        this.ConfigService.getOrThrow<string>('SALT_OR_ROUNDS'),
      ),
    });
    // One code per email, so a second signup does not erase the first.
    await this.RedisService.set({ key: `otp:${email}`, value: hashedOtp });
    await this.EmailService.sendEmail({
      to: email,
      subject: 'confirm email otp',
      text: otp,
    });
    return {
      id: createdUser._id,
      userName: createdUser.userName,
      email: createdUser.email,
    };
  }

  async confirmEmail({ email, otp }: { email: string; otp: number }) {
    const normalizedEmail = email.toLowerCase();
    const user = await this.UserRepo.findOne({
      filter: { email: normalizedEmail },
    });
    if (!user) {
      throw new NotFoundException('email does not exist');
    }
    const storedOtp = await this.RedisService.get({
      key: `otp:${normalizedEmail}`,
    });
    const compareResult = storedOtp
      ? await this.SecurityService.compareOperation({
          data: String(otp),
          encrypted: storedOtp,
        })
      : false;
    if (!storedOtp || !compareResult) {
      throw new BadRequestException(
        'the otp does not exist or it does not match',
      );
    }
    await this.RedisService.delete({ key: `otp:${normalizedEmail}` });
    const confirmedUser = await this.UserRepo.findOneAndUpdate({
      filter: { email: normalizedEmail },
      update: { confirmEmail: true },
      options: { new: true },
    });
    return {
      id: confirmedUser?._id,
      userName: confirmedUser?.userName,
      email: confirmedUser?.email,
    };
  }

  async signin(body: SignInDto) {
    const email = body.email.toLowerCase();
    const { password } = body;
    // password is stored with select: false, so the query has to ask for it.
    const user = await this.UserRepo.findOne({
      filter: { email },
      projection: {
        password: 1,
        userName: 1,
        email: 1,
        role: 1,
        isActive: 1,
        confirmEmail: 1,
      },
    });
    if (!user) {
      throw new NotFoundException('email does not exist');
    }
    if (!user.isActive) {
      throw new BadRequestException('account is not active');
    }
    if (!user.confirmEmail) {
      throw new BadRequestException('Email not confirmed');
    }
    const passwordMatches = await this.SecurityService.compareOperation({
      data: password,
      encrypted: user.password,
    });
    if (!passwordMatches) {
      throw new BadRequestException('password does not match');
    }
    const tokens = this.TokenService.generateAccessAndRefreshTokens(
      user.role,
      user,
    );
    return {
      id: user._id,
      userName: user.userName,
      email: user.email,
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    const authorization = refreshToken.startsWith('Bearer ')
      ? refreshToken
      : `Bearer ${refreshToken}`;
    const { user, verifiedToken } = await this.TokenService.checkToken({
      authorization,
      tokenType: TokenEnum.REFRESH,
    });
    // The old access and refresh tokens share this id, so both stop working.
    if (verifiedToken.jti) {
      const revokedKey = `revoked:${verifiedToken.jti}`;
      await this.RedisService.set({ key: revokedKey, value: '1' });
      await this.RedisService.expire({
        key: revokedKey,
        seconds: 60 * 60 * 24 * 365,
      });
    }
    return this.TokenService.generateAccessAndRefreshTokens(user.role, user);
  }

  async profile(accessToken: string) {
    const authorization = accessToken.startsWith('Bearer ')
      ? accessToken
      : `Bearer ${accessToken}`;
    const { user } = await this.TokenService.checkToken({
      authorization,
      tokenType: TokenEnum.ACCESS,
    });
    return {
      id: user._id,
      userName: user.userName,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      confirmEmail: user.confirmEmail,
    };
  }
}
