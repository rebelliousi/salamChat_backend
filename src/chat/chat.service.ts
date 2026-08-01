import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async saveMessage(
    senderId: number,
    receiverId: number,
    content: string,
    parentId?: number,
  ) {
    return this.prisma.message.create({
      data: {
        senderId,
        receiverId,
        content,
        parentId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        parentMessage: true,
      },
    });
  }

  async getChatHistory(userId: number, friendId: number) {
    return this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: friendId },
          { senderId: friendId, receiverId: userId },
        ],
      },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        parentMessage: true,
      },
    });
  }

  private async findMessageOrThrow(messageId: number, userId: number) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userId && message.receiverId !== userId) {
      throw new ForbiddenException('You are not part of this conversation');
    }

    return message;
  }

  async pinMessage(messageId: number, userId: number) {
    const message = await this.findMessageOrThrow(messageId, userId);

    return this.prisma.message.update({
      where: { id: messageId },
      data: { isPinned: !message.isPinned },
    });
  }

  async correctMessage(messageId: number, userId: number, correction: string) {
    const message = await this.findMessageOrThrow(messageId, userId);

    if (message.senderId === userId) {
      throw new ForbiddenException('You cannot correct your own message');
    }

    return this.prisma.message.update({
      where: { id: messageId },
      data: {
        correction,
        correctedById: userId,
      },
      include: {
        correctedBy: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async markAsDelivered(messageId: number) {
    return this.prisma.message.update({
      where: { id: messageId },
      data: { deliveredAt: new Date() },
    });
  }

  async markAsRead(messageId: number) {
    return this.prisma.message.update({
      where: { id: messageId },
      data: { readAt: new Date() },
    });
  }
}
