import { HttpException, HttpStatus } from '@nestjs/common';

export class QuotaExceededException extends HttpException {
  constructor(message = 'Message quota exceeded. Please purchase a subscription bundle.') {
    super(
      {
        success: false,
        message,
        errorCode: 'QUOTA_EXCEEDED',
        errors: {
          quota: ['No remaining messages in free tier or active bundles'],
        },
      },
      HttpStatus.PAYMENT_REQUIRED,
    );
  }
}
