import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfirmEmailDto, SignInDto, SignUpDto } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() body: SignUpDto) {
    return this.authService.signup(body);
  }

  @Post('signin')
  signin(@Body() body: SignInDto) {
    return this.authService.signin(body);
  }

  @Post('confirm-email')
  confirmEmail(@Body() body: ConfirmEmailDto) {
    return this.authService.confirmEmail({
      email: body.email,
      otp: Number(body.otp),
    });
  }

  @Post('refresh')
  refresh(@Headers('authorization') authorization?: string) {
    return this.authService.refreshToken(authorization ?? '');
  }

  @Get('profile')
  profile(@Headers('authorization') authorization?: string) {
    return this.authService.profile(authorization ?? '');
  }
}
