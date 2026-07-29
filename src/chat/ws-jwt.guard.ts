import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

interface JwtPayload {
  userId: number;
}

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient();
      const token = client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        throw new WsException('Couldnt found token!');
      }

      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: process.env.JWT_SECRET || 'super_secret_key',
      });

      client['user'] = payload;
      return true;
    } catch {
      throw new WsException('Unauthorized!');
    }
  }
}
