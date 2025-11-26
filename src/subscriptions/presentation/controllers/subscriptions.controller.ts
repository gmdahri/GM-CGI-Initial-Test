import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from '../../../users/domain/entities/user.entity';
import { SubscriptionsService } from '../../application/services/subscriptions.service';
import { CreateSubscriptionDto } from '../../application/dto/create-subscription.dto';
import { ApiResponse, successResponse } from '../../../common/responses/api-response';
import { SubscriptionBundle } from '../../domain/entities/subscription-bundle.entity';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreateSubscriptionDto,
  ): Promise<ApiResponse<SubscriptionBundle>> {
    const bundle = await this.subscriptionsService.create(user.id, dto);
    return successResponse(bundle, 'Subscription bundle created successfully');
  }

  @Get()
  async findAll(@CurrentUser() user: User): Promise<ApiResponse<SubscriptionBundle[]>> {
    const bundles = await this.subscriptionsService.findAllByUser(user.id);
    return successResponse(bundles, 'Subscription bundles retrieved successfully');
  }

  @Get('active')
  async findActive(@CurrentUser() user: User): Promise<ApiResponse<SubscriptionBundle[]>> {
    const bundles = await this.subscriptionsService.findActiveByUser(user.id);
    return successResponse(bundles, 'Active subscription bundles retrieved successfully');
  }

  @Get(':id')
  async findOne(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<SubscriptionBundle>> {
    const bundle = await this.subscriptionsService.findById(id, user.id);
    return successResponse(bundle, 'Subscription bundle retrieved successfully');
  }

  @Delete(':id')
  async cancel(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<SubscriptionBundle>> {
    const bundle = await this.subscriptionsService.cancel(id, user.id);
    return successResponse(bundle, 'Subscription bundle cancelled successfully');
  }
}
