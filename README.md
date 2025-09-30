# Marketing Dashboard - Next.js Migration

A comprehensive marketing dashboard application built with Next.js App Router, featuring omnichannel analytics, client management, and OAuth integrations with major advertising platforms.

## 🚀 Features

- **Multi-platform Analytics**: Google Ads, Meta Ads, LinkedIn Ads, Google Analytics
- **Client Management**: Comprehensive client onboarding and management system
- **OAuth Integrations**: Secure OAuth flows for all major advertising platforms
- **Real-time Dashboard**: Interactive charts and metrics visualization
- **Report Generation**: Automated report creation and export
- **Authentication**: NextAuth.js with OAuth and credential providers
- **Type Safety**: Full TypeScript implementation with Prisma ORM

## 🛠 Technology Stack

- **Frontend**: Next.js 15+ (App Router), React 18+, TypeScript
- **Backend**: Next.js API Routes, Prisma ORM, PostgreSQL
- **Authentication**: NextAuth.js with OAuth providers
- **Styling**: Tailwind CSS, shadcn/ui components
- **Charts**: Recharts for data visualization
- **Testing**: Jest, Playwright for visual regression
- **Development**: Docker Compose, ESLint, Prettier

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.0 or higher ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- **Yarn**: Package manager ([install Yarn](https://yarnpkg.com/getting-started/install))
- **Docker**: For local database ([install Docker](https://docs.docker.com/get-docker/))
- **Git**: Version control

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

### 2. Install Dependencies

```bash
yarn install
```

### 3. Environment Setup

Copy the example environment file and configure your variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/marketing_dashboard"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
FACEBOOK_CLIENT_ID="your-facebook-client-id"
FACEBOOK_CLIENT_SECRET="your-facebook-client-secret"
LINKEDIN_CLIENT_ID="your-linkedin-client-id"
LINKEDIN_CLIENT_SECRET="your-linkedin-client-secret"

# API Keys
GOOGLE_ADS_CLIENT_ID="your-google-ads-client-id"
GOOGLE_ADS_CLIENT_SECRET="your-google-ads-client-secret"
GOOGLE_ADS_DEVELOPER_TOKEN="your-google-ads-developer-token"
META_APP_ID="your-meta-app-id"
META_APP_SECRET="your-meta-app-secret"
LINKEDIN_CLIENT_ID="your-linkedin-client-id"
LINKEDIN_CLIENT_SECRET="your-linkedin-client-secret"
```

### 4. Database Setup

Start the PostgreSQL database using Docker Compose:

```bash
yarn db:start
```

Generate Prisma client and run migrations:

```bash
yarn db:generate
yarn db:migrate
yarn db:seed
```

### 5. Start Development Server

```bash
yarn dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## 📁 Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (dashboard)/       # Dashboard pages
│   │   └── api/               # API routes
│   ├── components/            # React components
│   │   ├── auth/              # Authentication components
│   │   ├── dashboard/         # Dashboard components
│   │   ├── layout/            # Layout components
│   │   └── ui/                # shadcn/ui components
│   ├── hooks/                 # Custom React hooks
│   └── lib/                   # Utility libraries
├── lib/                       # Server-side libraries
│   ├── controllers/           # API controllers
│   ├── services/              # Business logic services
│   ├── validation/            # Zod validation schemas
│   └── utils/                 # Utility functions
├── prisma/                    # Database schema and migrations
├── __tests__/                 # Test files
├── docs/                      # Documentation
└── scripts/                   # Utility scripts
```

## 🔧 Available Scripts

### Development
- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn lint` - Run ESLint
- `yarn lint:fix` - Fix ESLint issues

### Database
- `yarn db:start` - Start PostgreSQL with Docker
- `yarn db:stop` - Stop PostgreSQL container
- `yarn db:generate` - Generate Prisma client
- `yarn db:migrate` - Run database migrations
- `yarn db:seed` - Seed database with sample data
- `yarn db:reset` - Reset database and reseed
- `yarn db:studio` - Open Prisma Studio

### Testing
- `yarn test` - Run unit tests
- `yarn test:watch` - Run tests in watch mode
- `yarn test:coverage` - Run tests with coverage
- `yarn test:integration` - Run integration tests
- `yarn test:visual` - Run visual regression tests

### Migration & Data
- `yarn migrate:export` - Export data from Supabase
- `yarn migrate:transform` - Transform exported data
- `yarn migrate:import` - Import transformed data
- `yarn migrate:verify` - Verify migration integrity

## 🔐 Authentication Setup

### OAuth Provider Configuration

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

#### Facebook OAuth
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Configure OAuth redirect URI: `http://localhost:3000/api/auth/callback/facebook`

#### LinkedIn OAuth
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Create a new app
3. Add Sign In with LinkedIn product
4. Configure OAuth redirect URI: `http://localhost:3000/api/auth/callback/linkedin`

## 🗄️ Database Management

### Schema Changes

When making schema changes:

1. Update `prisma/schema.prisma`
2. Generate migration: `yarn db:migrate:dev --name your-migration-name`
3. Apply migration: `yarn db:migrate`
4. Generate client: `yarn db:generate`

### Data Migration

For migrating from Supabase:

1. Export data: `yarn migrate:export`
2. Transform data: `yarn migrate:transform`
3. Import data: `yarn migrate:import`
4. Verify migration: `yarn migrate:verify`

## 🧪 Testing

### Unit Tests
```bash
yarn test                    # Run all unit tests
yarn test:watch             # Run tests in watch mode
yarn test:coverage          # Run with coverage report
```

### Integration Tests
```bash
yarn test:integration       # Run API integration tests
```

### Visual Regression Tests
```bash
yarn test:visual            # Run Playwright visual tests
yarn test:visual:update     # Update visual baselines
```

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/signin` - Sign in with credentials
- `POST /api/auth/signup` - Create new account
- `GET /api/auth/session` - Get current session
- `POST /api/auth/signout` - Sign out

### Dashboard Endpoints
- `GET /api/dashboard/metrics` - Get dashboard metrics
- `GET /api/dashboard/alerts` - Get active alerts

### Client Management
- `GET /api/clients` - List clients
- `POST /api/clients` - Create client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### OAuth Integrations
- `POST /api/integrations/oauth/start` - Start OAuth flow
- `GET /api/integrations/oauth/callback` - OAuth callback
- `POST /api/integrations/oauth/disconnect` - Disconnect integration
- `GET /api/integrations/status` - Get integration status

### Reports
- `GET /api/reports` - List reports
- `POST /api/reports` - Generate report
- `GET /api/reports/:id` - Get specific report

## 🚀 Deployment

### Environment Variables

Ensure all required environment variables are set in your production environment. See `.env.example` for the complete list.

### Docker Deployment

Build and run with Docker:

```bash
# Build the application
docker build -t marketing-dashboard .

# Run with Docker Compose
docker-compose up -d
```

### Vercel Deployment

1. Connect your repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Database Migration in Production

```bash
# Run migrations
yarn db:migrate

# Seed production data (if needed)
yarn db:seed:prod
```

## 🔍 Troubleshooting

### Common Issues

**Database Connection Issues**
- Ensure PostgreSQL is running: `yarn db:start`
- Check DATABASE_URL in `.env.local`
- Verify database exists and is accessible

**OAuth Authentication Issues**
- Verify OAuth provider credentials
- Check redirect URIs match exactly
- Ensure OAuth apps are configured correctly

**Build Issues**
- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && yarn install`
- Check TypeScript errors: `yarn type-check`

**Migration Issues**
- Reset database: `yarn db:reset`
- Check Prisma schema syntax
- Verify migration files

### Getting Help

1. Check the [troubleshooting guide](./docs/TROUBLESHOOTING.md)
2. Review error logs in the console
3. Check database logs: `docker logs marketing-dashboard-db`
4. Verify environment variables are set correctly

## 📚 Additional Documentation

- [API Documentation](./docs/API.md)
- [Authentication Guide](./docs/AUTHENTICATION.md)
- [Data Migration Guide](./docs/DATA_MIGRATION_GUIDE.md)
- [Security Guide](./docs/SECURITY.md)
- [Error Handling](./docs/ERROR_HANDLING.md)
- [OAuth Integration System](./docs/oauth-integration-system.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Run tests: `yarn test`
5. Commit your changes: `git commit -m 'Add some feature'`
6. Push to the branch: `git push origin feature/your-feature`
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
