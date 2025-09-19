# Investment Platform - Complete Setup Guide

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- Git

### 1. Clone & Setup
```bash
# Already cloned, navigate to project
cd intellinvest-hub-main
```

### 2. Backend Setup
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your MySQL credentials

# Start MySQL and create database
mysql -u root -p
CREATE DATABASE investment_platform;
EXIT;

# Seed database with test data
npm run db:seed

# Start backend server
npm run dev
```
Backend will run on: http://localhost:3001

### 3. Frontend Setup
```bash
# Navigate back to root (open new terminal)
cd intellinvest-hub-main

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Start frontend server
npm run dev
```
Frontend will run on: http://localhost:8080

## 🐳 Docker Setup (Recommended)

### Simple Docker Compose
```bash
# From project root
docker-compose up --build
```

This starts:
- **MySQL**: Port 3306
- **Backend**: Port 3001
- **Frontend**: Port 3000

## 📋 Test the Application

### 1. Check Backend Health
```bash
curl http://localhost:3001/api/health
```

### 2. Test Authentication
```bash
# Register new user
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "email": "test@example.com",
    "password": "password123"
  }'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Access Frontend
Visit: http://localhost:8080 (local) or http://localhost:3000 (docker)

## 🔧 Available Test Accounts

After database seeding:
- **Admin**: admin@example.com / admin123
- **User**: john@example.com / password123

## 📊 API Endpoints

### Core Features Working:
- ✅ User registration/login
- ✅ Investment products CRUD
- ✅ Portfolio management
- ✅ Transaction logging
- ✅ Basic AI integration
- ✅ Health monitoring

### Frontend Features:
- ✅ Authentication pages
- ✅ Dashboard with portfolio
- ✅ Product listings
- ✅ Investment management
- ✅ Transaction logs
- ✅ User profile

## 🗂️ Project Structure

```
intellinvest-hub-main/
├── backend/                 # Express.js API
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth & logging
│   │   └── services/        # Business logic
│   └── scripts/             # Database scripts
├── src/                     # React frontend
├── docker-compose.yml       # Complete setup
└── README.md
```

## ⚙️ Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_NAME=investment_platform
DB_USER=root
DB_PASSWORD=root
JWT_SECRET=your-secret-key
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_GEMINI_API_KEY=your-ai-key (optional)
```

## 🧪 Development Commands

```bash
# Backend
cd backend
npm run dev        # Development server
npm run db:seed    # Seed database
npm start          # Production server

# Frontend
npm run dev        # Development server
npm run build      # Build for production
npm run preview    # Preview build
```

## 🚨 Troubleshooting

### Common Issues:
1. **MySQL Connection Error**: Ensure MySQL is running and credentials are correct
2. **Port Already In Use**: Change ports in .env files
3. **CORS Issues**: Check CORS_ORIGINS in backend .env
4. **Frontend API Errors**: Verify VITE_API_BASE_URL points to backend

### Reset Database:
```bash
cd backend
mysql -u root -p -e "DROP DATABASE IF EXISTS investment_platform; CREATE DATABASE investment_platform;"
npm run db:seed
```

That's it! You now have a fully functional investment platform with both frontend and backend running. 🎉