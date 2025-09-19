# Investment Platform Backend

Simple backend API for the Investment Platform project.

## Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8.0+

### Setup

1. **Install dependencies**
```bash
cd backend
npm install
```

2. **Setup MySQL Database**
```sql
CREATE DATABASE investment_platform;
```

3. **Environment Setup**
```bash
cp .env.example .env
# Update .env with your MySQL credentials
```

4. **Initialize Database**
```bash
npm run db:seed
```

5. **Start Development Server**
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Products
- `GET /api/products` - Get all investment products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (auth required)
- `PUT /api/products/:id` - Update product (auth required)
- `DELETE /api/products/:id` - Delete product (auth required)

### Investments
- `GET /api/investments/portfolio` - Get user's investments
- `GET /api/investments/portfolio/summary` - Get portfolio summary
- `POST /api/investments` - Create new investment
- `GET /api/investments/:id` - Get investment by ID
- `PUT /api/investments/:id/cancel` - Cancel investment

### User Profile
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `PUT /api/user/risk-appetite` - Update risk appetite

### Logs
- `GET /api/logs` - Get transaction logs
- `GET /api/logs/error-summary` - Get error summary

### Health Check
- `GET /api/health` - System health status

## Test Users

After seeding, you can use these test accounts:

- **Admin**: admin@example.com / admin123
- **User**: john@example.com / password123

## Environment Variables

```env
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_NAME=investment_platform
DB_USER=root
DB_PASSWORD=root
JWT_SECRET=your-jwt-secret
GOOGLE_AI_API_KEY=your-gemini-key (optional)
```

## Development Commands

```bash
npm start          # Start production server
npm run dev        # Start development server
npm run db:seed    # Seed database with test data
```

## Docker Setup (Optional)

```bash
# Build image
docker build -t investment-backend .

# Run with MySQL
docker-compose up
```