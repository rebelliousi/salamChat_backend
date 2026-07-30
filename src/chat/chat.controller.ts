import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CorrectMessageDto } from 'src/dto/correct-message.dto';

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

  @Patch('message/:id/pin')
  pinMessage(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.chatService.pinMessage(Number(id), req.user.userId);
  }

  @Patch('message/:id/correct')
  correctMessage(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: CorrectMessageDto,
  ) {
    return this.chatService.correctMessage(
      Number(id),
      req.user.userId,
      dto.correction,
    );
  }
}
