import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('protected')
export class ProtectedController {
  @UseGuards(AuthGuard('jwt'))
  @Get()
  getProtectedResource(@Request() req) {
    return { message: '这是一个受保护的路由', user: req.user };
  }
}
