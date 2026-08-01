import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import './socket.types';

interface JwtPayload {
  userId: number;
}

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private chatService: ChatService,
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private async getUserIdFromSocket(client: Socket): Promise<number | null> {
    const token = client.handshake.auth?.token as string | undefined;

    if (!token) {
      return null;
    }

    const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
      secret: process.env.JWT_SECRET || 'super_secret_key',
    });

    return payload.userId;
  }

  async handleConnection(client: Socket) {
    try {
      const userId = await this.getUserIdFromSocket(client);

      if (!userId) {
        client.emit('auth_error', { message: 'No token provided' });
        client.disconnect();
        return;
      }

      client.user = { userId };
      await client.join(`user_${userId}`);

      await this.prisma.user.update({
        where: { id: userId },
        data: { isOnline: true },
      });
    } catch (err) {
      if (err instanceof Error && err.name === 'TokenExpiredError') {
        client.emit('token_expired', {
          message: 'Access token expired, please refresh',
        });
      } else {
        client.emit('auth_error', { message: 'Invalid token' });
      }
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.user?.userId;

    if (userId) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { isOnline: false, lastSeen: new Date() },
      });
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { receiverId: number; content: string; parentId?: number },
  ) {
    if (!client.user) {
      client.emit('auth_error', { message: 'Not authenticated' });
      return;
    }

    const senderId = client.user.userId;

    const message = await this.chatService.saveMessage(
      senderId,
      data.receiverId,
      data.content,
      data.parentId,
    );

    const isBlocked = await this.prisma.block.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId: data.receiverId,
          blockedId: senderId,
        },
      },
    });

    if (!isBlocked) {
      this.server.to(`user_${data.receiverId}`).emit('newMessage', message);
    }

    return message;
  }
}
