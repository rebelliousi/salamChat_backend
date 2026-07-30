import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthenticatedRequest {
  user: {
    userId: number;
  };
}

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('messages/:receiverId')
  getMessages(
    @Request() req: AuthenticatedRequest,
    @Param('receiverId') receiverId: string,
  ) {
    return this.chatService.getChatHistory(req.user.userId, Number(receiverId));
  }
}
