# Investment Platform API Documentation

## 🚀 Complete API Reference with AI Features

Base URL: `http://localhost:3001/api`

---

## 🔐 Authentication Endpoints

### POST `/auth/signup`
Register a new user
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "risk_appetite": "moderate"
}
```

### POST `/auth/login`
User login
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### GET `/auth/me`
Get current user (requires token)

### POST `/auth/forgot-password`
Request password reset
```json
{
  "email": "john@example.com"
}
```

### POST `/auth/reset-password`
Reset password with token
```json
{
  "token": "reset-token-here",
  "password": "newpassword123"
}
```

### 🤖 POST `/auth/analyze-password`
**AI Feature**: Analyze password strength
```json
{
  "password": "mypassword123"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "score": 75,
    "feedback": ["Add special characters"],
    "suggestions": ["Use symbols like !@#$%"]
  }
}
```

---

## 📦 Product Endpoints

### GET `/products`
Get all investment products

### GET `/products/:id`
Get specific product

### 🤖 GET `/products/ai/recommendations`
**AI Feature**: Get personalized product recommendations (requires token)
```json
{
  "success": true,
  "data": [
    {
      "id": "product-id",
      "name": "Equity Growth Fund",
      "investment_type": "mf",
      "annual_yield": 12.8,
      "risk_level": "high"
    }
  ]
}
```

### POST `/products`
Create new product (admin, requires token)
```json
{
  "name": "New Bond Fund",
  "investment_type": "bond",
  "tenure_months": 24,
  "annual_yield": 5.5,
  "risk_level": "low",
  "min_investment": 1000,
  "max_investment": 50000
}
```
**AI Enhancement**: If no description provided, AI will auto-generate one!

### PUT `/products/:id`
Update product (admin, requires token)

### DELETE `/products/:id`
Delete product (admin, requires token)

---

## 💰 Investment Endpoints

All require authentication token.

### GET `/investments/portfolio`
Get user's investment portfolio

### GET `/investments/portfolio/summary`
Get portfolio summary with analytics

### 🤖 GET `/investments/portfolio/insights`
**AI Feature**: Get AI-powered portfolio insights
```json
{
  "success": true,
  "data": [
    {
      "type": "risk",
      "title": "High Risk Concentration",
      "content": "Your portfolio has significant exposure to high-risk investments...",
      "priority": "high"
    },
    {
      "type": "portfolio",
      "title": "Diversification Opportunity",
      "content": "Consider adding bonds to balance your equity-heavy portfolio...",
      "priority": "medium"
    }
  ]
}
```

### POST `/investments`
Create new investment
```json
{
  "product_id": "uuid-here",
  "amount": 5000
}
```

### GET `/investments/:id`
Get specific investment

### PUT `/investments/:id/cancel`
Cancel investment

---

## 👤 User Profile Endpoints

All require authentication token.

### GET `/user/profile`
Get user profile

### PUT `/user/profile`
Update profile
```json
{
  "first_name": "John",
  "last_name": "Smith",
  "risk_appetite": "high"
}
```

### PUT `/user/risk-appetite`
Update risk appetite only
```json
{
  "risk_appetite": "moderate"
}
```

---

## 📊 Transaction Logs Endpoints

All require authentication token.

### GET `/logs`
Get user's transaction logs

### 🤖 GET `/logs/error-summary`
**AI Feature**: Get AI-powered error analysis
```json
{
  "success": true,
  "data": {
    "summary": "Found 3 recent errors. Common issues: Authentication problems, Invalid requests. If problems persist, try logging out and back in, or contact support.",
    "error_count": 3,
    "recent_errors": [
      {
        "endpoint": "/api/investments",
        "method": "POST",
        "status": 400,
        "time": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

---

## 🏥 Health Check

### GET `/health`
System health status
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "database": "connected",
    "timestamp": "2024-01-15T12:00:00Z"
  }
}
```

---

## 🤖 AI Features Summary

| Feature | Endpoint | Description |
|---------|----------|-------------|
| **Password Analysis** | `POST /auth/analyze-password` | Real-time password strength analysis |
| **Product Descriptions** | `POST /products` | Auto-generate compelling product descriptions |
| **Investment Recommendations** | `GET /products/ai/recommendations` | Personalized product suggestions based on risk appetite |
| **Portfolio Insights** | `GET /investments/portfolio/insights` | AI analysis of portfolio risk, diversification, performance |
| **Error Summarization** | `GET /logs/error-summary` | User-friendly error analysis and suggestions |

---

## 🔑 Authentication

Most endpoints require Bearer token authentication:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## 📝 Response Format

All responses follow this structure:
```json
{
  "success": true|false,
  "data": {...},
  "message": "Optional message"
}
```

## 🚨 Error Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate email, etc.)
- `500` - Internal Server Error

---

## 🧪 Testing the AI Features

### 1. Test Password Analysis
```bash
curl -X POST http://localhost:3001/api/auth/analyze-password \
  -H "Content-Type: application/json" \
  -d '{"password": "mypassword123"}'
```

### 2. Test Product Recommendations
```bash
curl -X GET http://localhost:3001/api/products/ai/recommendations \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Test Portfolio Insights
```bash
curl -X GET http://localhost:3001/api/investments/portfolio/insights \
  -H "Authorization: Bearer YOUR_TOKEN"
```

All AI features include intelligent fallbacks when the AI service is unavailable!