# 🚀 IntelliInvest Hub

A full-stack investment platform enabling users to browse, invest in, and manage their portfolio of investment products including bonds, FDs, mutual funds, and ETFs.

## ✨ Features

- **User Authentication** - Secure JWT-based signup/login with password validation
- **Investment Products** - Browse bonds, FDs, mutual funds, and ETFs
- **Portfolio Management** - Track investments, view performance, and get insights
- **AI Integration** - Password analysis and investment recommendations using Google AI
- **Responsive UI** - Modern design with shadcn/ui components and dark mode
- **Real-time Updates** - Live portfolio tracking and transaction logging

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript and Vite
- **Tailwind CSS** + shadcn/ui components
- **Zustand** for state management
- **TanStack React Query** for data fetching
- **React Router v6** for navigation

### Backend
- **Node.js** + Express.js
- **MySQL/SQLite** with Sequelize ORM
- **JWT** authentication with bcrypt
- **Google AI (Gemini)** for AI features
- **Winston** logging

## 🌐 Live Demo

- **Frontend**: [https://gripinvest-winter-internship-backen-one.vercel.app/](https://gripinvest-winter-internship-backen-one.vercel.app/)
- **Backend API**: [https://gripinvest-winter-internship-backend.onrender.com](https://gripinvest-winter-internship-backend.onrender.com)
- **API Documentation**: Import `IntelliInvest-Hub-API.postman_collection.json` in Postman

<img width="1919" height="914" alt="Screenshot 2025-09-30 174842" src="https://github.com/user-attachments/assets/34c06070-df65-47ee-ab59-4a69283429f5" />

<img width="1919" height="916" alt="Screenshot 2025-09-30 175233" src="https://github.com/user-attachments/assets/fccf148a-77b8-4692-8702-d143398f75d8" />

<img width="1917" height="908" alt="Screenshot 2025-09-30 175239" src="https://github.com/user-attachments/assets/8045bf95-f9bf-42ef-b11d-e32929504efa" />

<img width="1368" height="450" alt="Screenshot 2025-09-30 175258" src="https://github.com/user-attachments/assets/726d6d7a-3923-47a1-a43a-47c2f80fed1e" />

<img width="1919" height="910" alt="Screenshot 2025-09-30 175246" src="https://github.com/user-attachments/assets/cae0a9f1-6d8d-48f3-810a-a08eeca81d2d" />


## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8.0+ (or SQLite for development)

### 1. Backend Setup
```bash
cd backend
npm install

# Environment setup
cp .env.example .env
# Edit .env with your database credentials

# Database setup
npm run db:seed

# Start development server
npm run dev
```

### 2. Frontend Setup
```bash
npm install
npm run dev
```

Visit `http://localhost:8080` for frontend and `http://localhost:3001` for backend API.

## 📁 Project Structure

```
intellinvest-hub-main/
├── 📁 backend/                          # Node.js API Server
│   ├── src/
│   │   ├── controllers/                 # API route handlers
│   │   │   ├── authController.js        # Authentication logic
│   │   │   ├── investmentController.js  # Investment operations
│   │   │   ├── productController.js     # Product management
│   │   │   ├── userController.js        # User profile management
│   │   │   └── logController.js         # Transaction logging
│   │   ├── models/                      # Database models (Sequelize)
│   │   │   ├── User.js                  # User model with auth
│   │   │   ├── InvestmentProduct.js     # Investment products
│   │   │   ├── Investment.js            # User investments
│   │   │   ├── TransactionLog.js        # Audit logs
│   │   │   └── index.js                 # Model associations
│   │   ├── routes/                      # API routes
│   │   │   ├── auth.js                  # Auth endpoints
│   │   │   ├── products.js              # Product endpoints
│   │   │   ├── investments.js           # Investment endpoints
│   │   │   ├── users.js                 # User endpoints
│   │   │   └── logs.js                  # Logging endpoints
│   │   ├── middleware/                  # Express middleware
│   │   │   ├── auth.js                  # JWT verification
│   │   │   └── logging.js               # Request logging
│   │   ├── services/                    # Business logic
│   │   │   ├── aiService.js             # Google AI integration
│   │   │   └── emailService.js          # Email functionality
│   │   ├── config/                      # Configuration
│   │   │   └── database.js              # DB connection & config
│   │   ├── utils/                       # Utility functions
│   │   │   └── validation.js            # Input validation
│   │   └── app.js                       # Express app setup
│   ├── scripts/                         # Database scripts
│   │   └── seed.js                      # Database seeding
│   ├── package.json                     # Backend dependencies
│   └── .env.example                     # Environment template
├── 📁 src/                              # React Frontend
│   ├── components/                      # React components
│   │   ├── ui/                          # shadcn/ui components
│   │   ├── auth/                        # Authentication components
│   │   ├── dashboard/                   # Dashboard components
│   │   └── layout/                      # Layout components
│   ├── pages/                           # Route pages
│   │   ├── Auth.tsx                     # Login/Signup page
│   │   ├── Dashboard.tsx                # Main dashboard
│   │   ├── Products.tsx                 # Investment products
│   │   ├── Investments.tsx              # Portfolio page
│   │   ├── Transactions.tsx             # Transaction history
│   │   ├── Profile.tsx                  # User profile
│   │   ├── Index.tsx                    # Landing page
│   │   └── NotFound.tsx                 # 404 page
│   ├── store/                           # State management
│   │   └── authStore.ts                 # Zustand auth store
│   ├── hooks/                           # Custom React hooks
│   │   ├── use-toast.ts                 # Toast notifications
│   │   └── use-mobile.tsx               # Mobile detection
│   ├── lib/                             # Utility libraries
│   │   ├── api.ts                       # API client setup
│   │   ├── ai.ts                        # AI integration
│   │   └── utils.ts                     # Helper functions
│   ├── types/                           # TypeScript types
│   │   └── index.ts                     # Type definitions
│   ├── App.tsx                          # Main App component
│   └── main.tsx                         # React entry point
├── 📁 public/                           # Static assets
├── 📁 dist/                             # Build output
├── 📄 package.json                      # Frontend dependencies
├── 📄 tailwind.config.ts                # Tailwind configuration
├── 📄 vite.config.ts                    # Vite configuration
├── 📄 components.json                   # shadcn/ui config
├── 📄 IntelliInvest-Hub-API.postman_collection.json  # API collection
├── 📄 CLAUDE.md                         # AI assistant guidance
└── 📄 README.md                         # Project documentation
```

## 🔌 API Documentation

### Base URL
- **Production**: `https://gripinvest-winter-internship-backend.onrender.com`
- **Development**: `http://localhost:3001`

### 🔐 Authentication Endpoints

| Method | Endpoint | Description | Body Parameters |
|--------|----------|-------------|-----------------|
| `POST` | `/api/auth/signup` | Register new user | `first_name, last_name, email, password, risk_appetite` |
| `POST` | `/api/auth/login` | User login | `email, password` |
| `GET` | `/api/auth/me` | Get current user | **Requires Auth** |
| `POST` | `/api/auth/forgot-password` | Request password reset | `email` |
| `POST` | `/api/auth/reset-password` | Reset password | `token, password` |
| `POST` | `/api/auth/analyze-password` | AI password analysis | `password` |

### 📦 Investment Products Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|-----------
----|
| `GET` | `/api/products` | Get all investment products | ❌ |
| `GET` | `/api/products/:id` | Get product by ID | ❌ |
| `GET` | `/api/products/ai/recommendations` | Get AI recommendations | ✅ |
| `POST` | `/api/products` | Create product (Admin) | ✅ |
| `PUT` | `/api/products/:id` | Update product (Admin) | ✅ |
| `DELETE` | `/api/products/:id` | Delete product (Admin) | ✅ |

### 💰 Investment Management Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/investments/portfolio` | Get user portfolio | ✅ |
| `GET` | `/api/investments/portfolio/summary` | Get portfolio summary | ✅ |
| `GET` | `/api/investments/portfolio/insights` | Get AI portfolio insights | ✅ |
| `POST` | `/api/investments` | Create new investment | ✅ |
| `GET` | `/api/investments/:id` | Get investment details | ✅ |
| `PUT` | `/api/investments/:id/cancel` | Cancel investment | ✅ |

### 👤 User Profile Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/user/profile` | Get user profile | ✅ |
| `PUT` | `/api/user/profile` | Update profile | ✅ |
| `PUT` | `/api/user/risk-appetite` | Update risk appetite | ✅ |

### 📊 Transaction Logs Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/logs` | Get transaction logs | ✅ |
| `GET` | `/api/logs/error-summary` | Get error summary | ✅ |

### 🏥 Health Check Endpoints

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| `GET` | `/api/health` | API & DB status | `{status: 'healthy', database: 'connected'}` |
| `GET` | `/` | API information | `{message: 'Investment Platform API', version: '1.0.0'}` |

### 🔑 Authentication Headers
For protected endpoints, include JWT token in request header:
```
Authorization: Bearer <your-jwt-token>
```

### 📝 Request/Response Examples

#### Signup Request
```json
POST /api/auth/signup
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "risk_appetite": "moderate"
}
```

#### Create Investment Request
```json
POST /api/investments
{
  "product_id": "uuid-here",
  "amount": 50000
}
```

#### Portfolio Response
```json
{
  "success": true,
  "data": {
    "investments": [...],
    "total_value": 150000,
    "total_returns": 15000
  }
}
```

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=3001
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=intelliinvest
JWT_SECRET=your_jwt_secret
GOOGLE_AI_API_KEY=your_gemini_api_key
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
