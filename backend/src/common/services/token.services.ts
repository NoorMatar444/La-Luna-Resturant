import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { RoleEnum } from '../enums/user.enum.js';
import { HydratedUser } from '../../models/user.model.js';
import { TokenEnum } from '../enums/token.enum.js';
import { RedisService } from './redis.service.js';
import { UserRepo } from '../../repo/user.repo.js';

@Injectable()
export class TokenService {
  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly userRepo: UserRepo,
  ) {}

  getSignature(role: RoleEnum = RoleEnum.ADMIN) {
    switch (role) {
      case RoleEnum.ADMIN:
        return {
          accessSignature: this.configService.getOrThrow<string>(
            'ACCESS_TOKEN_SIGNATURE_ADMIN',
          ),
          refreshSignature: this.configService.getOrThrow<string>(
            'REFRESH_TOKEN_SIGNATURE_ADMIN',
          ),
        };
      case RoleEnum.CUSTOMER:
        return {
          accessSignature:
            this.configService.get<string>('ACCESS_TOKEN_SIGNATURE_CUSTOMER') ??
            this.configService.getOrThrow<string>(
              'ACCESS_TOKEN_SIGNATURE_CANDIDATE',
            ),
          refreshSignature:
            this.configService.get<string>(
              'REFRESH_TOKEN_SIGNATURE_CUSTOMER',
            ) ??
            this.configService.getOrThrow<string>(
              'REFRESH_TOKEN_SIGNATURE_CANDIDATE',
            ),
        };
      case RoleEnum.CANDIDATE:
        return {
          accessSignature: this.configService.getOrThrow<string>(
            'ACCESS_TOKEN_SIGNATURE_CANDIDATE',
          ),
          refreshSignature: this.configService.getOrThrow<string>(
            'REFRESH_TOKEN_SIGNATURE_CANDIDATE',
          ),
        };
      case RoleEnum.EMPLOYER:
        return {
          accessSignature: this.configService.getOrThrow<string>(
            'ACCESS_TOKEN_SIGNATURE_EMPLOYER',
          ),
          refreshSignature: this.configService.getOrThrow<string>(
            'REFRESH_TOKEN_SIGNATURE_EMPLOYER',
          ),
        };
      default:
        throw new UnauthorizedException('token not valid');
    }
  }

  generateToken({
    payload,
    signature,
    options,
  }: {
    payload: string | jwt.JwtPayload | Buffer;
    signature: string;
    options?: jwt.SignOptions;
  }) {
    return jwt.sign(payload, signature, options);
  }

  decodedToken({
    token,
    options,
  }: {
    token: string;
    options?: jwt.DecodeOptions;
  }) {
    return jwt.decode(token, options);
  }

  verifyToken({
    token,
    signature,
    options,
  }: {
    token: string;
    signature: string;
    options?: jwt.VerifyOptions;
  }): jwt.JwtPayload {
    try {
      const verified = jwt.verify(token, signature, options);
      if (typeof verified === 'string') {
        throw new UnauthorizedException('token not valid');
      }
      return verified;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('Token expired');
      }
      throw new UnauthorizedException('token not valid');
    }
  }

  generateAccessAndRefreshTokens(role: RoleEnum, user: HydratedUser) {
    const { accessSignature, refreshSignature } = this.getSignature(role);
    const generateJwtId = randomUUID();
    const access_token = this.generateToken({
      payload: { sub: user._id.toString(), role: user.role },
      signature: accessSignature,
      options: {
        audience: [String(user.role), TokenEnum.ACCESS],
        expiresIn: '1d',
        jwtid: generateJwtId,
      },
    });
    const refresh_token = this.generateToken({
      payload: { sub: user._id.toString(), role: user.role },
      signature: refreshSignature,
      options: {
        audience: [String(user.role), TokenEnum.REFRESH],
        expiresIn: '1y',
        jwtid: generateJwtId,
      },
    });
    return { access_token, refresh_token };
  }

  async checkToken({
    authorization,
    tokenType,
  }: {
    authorization?: string;
    tokenType: TokenEnum;
  }) {
    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('token not valid');
    }

    const token = authorization.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('token not valid');
    }

    const decodedToken = this.decodedToken({ token }) as jwt.JwtPayload | null;
    if (!decodedToken?.sub || !decodedToken?.role) {
      throw new UnauthorizedException('token not valid');
    }

    const { accessSignature, refreshSignature } = this.getSignature(
      decodedToken.role as RoleEnum,
    );
    const signature =
      tokenType === TokenEnum.ACCESS ? accessSignature : refreshSignature;

    const verifiedToken = this.verifyToken({
      token,
      signature,
      options: {
        audience: [String(decodedToken.role), tokenType],
      },
    });

    if (
      verifiedToken.jti &&
      (await this.redisService.exists({ key: `revoked:${verifiedToken.jti}` }))
    ) {
      throw new UnauthorizedException('Token revoked');
    }

    if (!verifiedToken.sub) {
      throw new UnauthorizedException('token not valid');
    }
    const user = await this.userRepo.findById({ id: verifiedToken.sub });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found');
    }
    if (!user.confirmEmail) {
      throw new UnauthorizedException('Email not confirmed');
    }
    if (
      user.changeCreditTime &&
      verifiedToken.iat! * 1000 < user.changeCreditTime.getTime()
    ) {
      throw new UnauthorizedException('Token expired after credential change');
    }

    return { user, verifiedToken };
  }
}
