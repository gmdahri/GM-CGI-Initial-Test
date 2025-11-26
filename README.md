# AI Chat & Subscription POC

A NestJS-based proof of concept implementing AI Chat and Subscription Bundle modules with Clean Architecture (DDD-style).

## Tech Stack

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT (passport-jwt)
- **Containerization**: Docker + docker-compose
- **Linting**: ESLint + Prettier

## Project Structure

```
src/
├── common/              # Shared utilities, decorators, guards, scheduled tasks
├── config/              # Configuration (TypeORM)
├── auth/                # JWT authentication module
├── users/               # User module
├── chat/                # AI Chat module (DDD)
│   ├── domain/          # Entities, interfaces
│   ├── application/     # Services, DTOs
│   ├── infrastructure/  # Repositories
│   └── presentation/    # Controllers
├── subscriptions/       # Subscription module (DDD)
│   ├── domain/
│   ├── application/
│   ├── infrastructure/
│   └── presentation/
└── main.ts
```

## Features

### Module 1: AI Chat
- Accepts user questions
- Returns mocked OpenAI response (1-3s simulated delay)
- Stores question, answer, and tokens in database
- **Quota Management**:
  - 3 free messages per user per month
  - Auto-resets on the 1st of each month
  - Deducts from subscription bundles after free quota exhausted
  - Structured error responses when quota exceeded

### Module 2: Subscription Bundles
- **Tiers**:
  - Basic: 10 messages - $9.99/month
  - Pro: 100 messages - $29.99/month
  - Enterprise: Unlimited - $99.99/month
- **Billing Cycles**: Monthly or Yearly (20% discount)
- Cancellation preserves usage until billing cycle ends

## Quick Start

### Using Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app
```

### Local Development

```bash
# Install dependencies
npm install

# Start PostgreSQL (using Docker)
docker-compose up -d postgres

# Create .env file
cp .env.example .env

# Run in development mode
npm run start:dev
```

## Environment Variables

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=ai_chat_poc
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRATION=1d
PORT=3000
NODE_ENV=development
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |

### Chat (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Send a chat message |
| GET | `/api/chat/history` | Get chat history |
| GET | `/api/chat/usage` | Get usage statistics |

### Subscriptions (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/subscriptions` | Create subscription |
| GET | `/api/subscriptions` | List all subscriptions |
| GET | `/api/subscriptions/active` | List active subscriptions |
| GET | `/api/subscriptions/:id` | Get subscription by ID |
| DELETE | `/api/subscriptions/:id` | Cancel subscription |

## API Examples

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

### Chat
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{"question": "What is the meaning of life?"}'
```

### Create Subscription
```bash
curl -X POST http://localhost:3000/api/subscriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{"tier": "PRO", "billingCycle": "MONTHLY"}'
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Success message",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field_name": ["Specific error details"]
  },
  "errorCode": "SPECIFIC_ERROR_CODE"
}
```

## Quota Exceeded Error
```json
{
  "success": false,
  "message": "Message quota exceeded. Please purchase a subscription bundle.",
  "errors": {
    "quota": ["No remaining messages in free tier or active bundles"]
  },
  "errorCode": "QUOTA_EXCEEDED"
}
```

## Scheduled Tasks

- **Monthly Quota Reset**: Runs on 1st of each month at midnight

## Scripts

```bash
npm run start:dev    # Development mode
npm run start:prod   # Production mode
npm run build        # Build project
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

## License

MIT
