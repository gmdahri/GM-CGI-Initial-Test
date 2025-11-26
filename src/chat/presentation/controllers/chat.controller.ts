import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from '../../../users/domain/entities/user.entity';
import { ChatService, ChatResponse } from '../../application/services/chat.service';
import { ChatRequestDto } from '../../application/dto/chat-request.dto';
import { ApiResponse, successResponse } from '../../../common/responses/api-response';
import { ChatMessage } from '../../domain/entities/chat-message.entity';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async chat(
    @CurrentUser() user: User,
    @Body() dto: ChatRequestDto,
  ): Promise<ApiResponse<ChatResponse>> {
    const result = await this.chatService.processChat(user, dto);
    return successResponse(result, 'Chat processed successfully');
  }

  @Get('history')
  async getHistory(@CurrentUser() user: User): Promise<ApiResponse<ChatMessage[]>> {
    const history = await this.chatService.getHistory(user.id);
    return successResponse(history, 'Chat history retrieved successfully');
  }

  @Get('usage')
  async getUsage(
    @CurrentUser() user: User,
  ): Promise<ApiResponse<{ monthlyMessages: number; totalTokens: number }>> {
    const stats = await this.chatService.getUsageStats(user.id);
    return successResponse(stats, 'Usage stats retrieved successfully');
  }
}
