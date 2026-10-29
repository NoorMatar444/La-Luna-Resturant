import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { OrderService } from './order.service';
import { CheckoutDto } from './order.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  list() {
    return this.orderService.listProducts();
  }
}

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('checkout')
  checkout(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: CheckoutDto,
  ) {
    return this.orderService.checkout(authorization ?? '', body);
  }

  @Get(':id')
  getOne(
    @Headers('authorization') authorization: string | undefined,
    @Param('id') id: string,
  ) {
    return this.orderService.getForUser(authorization ?? '', id);
  }

  @Post('webhook')
  @HttpCode(200)
  webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string | undefined,
  ) {
    return this.orderService.handleWebhook(req.rawBody, signature ?? '');
  }
}
