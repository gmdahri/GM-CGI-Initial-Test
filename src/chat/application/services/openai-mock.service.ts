import { Injectable } from '@nestjs/common';
import { MockedOpenAIResponse } from '../../domain/interfaces/openai-response.interface';

@Injectable()
export class OpenAIMockService {
  private readonly responses = [
    'Based on my analysis, I believe the answer involves considering multiple factors.',
    'That is an interesting question. Let me provide a comprehensive response.',
    'Here is what I found regarding your query after careful consideration.',
    'The solution to your question requires understanding several key concepts.',
    'I would recommend approaching this problem from a different perspective.',
    'After analyzing your question, here are my thoughts and recommendations.',
  ];

  async generateResponse(question: string): Promise<MockedOpenAIResponse> {
    // Simulate OpenAI API delay (1-3 seconds)
    const delay = 1000 + Math.random() * 2000;
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Generate mocked response
    const randomResponse = this.responses[Math.floor(Math.random() * this.responses.length)];
    const answer = `${randomResponse} Your question was: "${question.substring(0, 50)}${question.length > 50 ? '...' : ''}"`;

    // Simulate token usage (10-150 tokens)
    const tokens = Math.floor(Math.random() * 140) + 10;

    return {
      answer,
      tokens,
    };
  }
}
