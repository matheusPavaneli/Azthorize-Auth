import {
  Body,
  Controller,
  Header,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserDto } from './user.dto';
import { UserService } from './user.service';
import type { User } from './user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Request } from 'express';
import type IPayload from 'src/common/interfaces/IPayload';
import { UserUpdateDto } from './user-update.dto';
import { UserUpdatePasswordDto } from './user-update-password.dto';
import { TwoFactorGuard } from '../two-factor/two-factor.guard';
import { Throttle } from '@nestjs/throttler';
import { CookieInterceptor } from 'src/common/interceptors/cookie.interceptor';

@UseInterceptors(CookieInterceptor)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Throttle({ default: { ttl: 600000, limit: 5 } })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  @Header('Content-Type', 'application/json')
  async create(@Body() user: UserDto): Promise<User> {
    return this.userService.create(user);
  }

  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @HttpCode(HttpStatus.OK)
  @Put('/update')
  @UseGuards(JwtAuthGuard, TwoFactorGuard)
  @Header('Content-Type', 'application/json')
  async update(
    @Body() user: UserUpdateDto,
    @Req() req: Request,
  ): Promise<{ user: User; accessToken: string }> {
    const { sub: userId } = req.user as IPayload;
    const { user: updatedUser, accessToken } =
      await this.userService.updateUser(userId, user);
    return { user: updatedUser, accessToken };
  }

  @Throttle({ default: { ttl: 300000, limit: 5 } })
  @HttpCode(HttpStatus.OK)
  @Patch('/change-password')
  @UseGuards(JwtAuthGuard, TwoFactorGuard)
  @Header('Content-Type', 'application/json')
  async changePassword(
    @Body() { oldPassword, newPassword }: UserUpdatePasswordDto,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    const { sub: userId } = req.user as IPayload;
    await this.userService.changePassword(userId, oldPassword, newPassword);
    return { message: 'Password changed' };
  }
}
