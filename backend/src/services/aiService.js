// Complete AI Service - All specification features
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || 'demo-key');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const hasValidApiKey = () => {
  return process.env.GOOGLE_AI_API_KEY && process.env.GOOGLE_AI_API_KEY !== 'demo-key';
};

// 1. Password Strength Analysis (already implemented)
const analyzePasswordStrength = async (password) => {
  try {
    if (!hasValidApiKey()) {
      return basicPasswordAnalysis(password);
    }

    const prompt = `Analyze password strength: "${password}". Return JSON with score (0-100), feedback array, suggestions array.`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return JSON.parse(text);
  } catch (error) {
    return basicPasswordAnalysis(password);
  }
};

// 2. Auto-generate Product Descriptions
const generateProductDescription = async (productData) => {
  try {
    if (!hasValidApiKey()) {
      return generateBasicDescription(productData);
    }

    const prompt = `Generate a compelling investment product description for:
    Name: ${productData.name}
    Type: ${productData.investment_type}
    Annual Yield: ${productData.annual_yield}%
    Risk Level: ${productData.risk_level}
    Tenure: ${productData.tenure_months} months
    Min Investment: $${productData.min_investment}

    Create a 2-3 sentence professional description highlighting benefits and suitability.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('AI description generation failed:', error);
    return generateBasicDescription(productData);
  }
};

// 3. Investment Recommendations based on user risk appetite
const generateInvestmentRecommendations = async (userRiskAppetite, products, currentInvestments = []) => {
  try {
    if (!hasValidApiKey()) {
      return generateBasicRecommendations(userRiskAppetite, products, currentInvestments);
    }

    const existingTypes = currentInvestments.map(inv => inv.product?.investment_type || '').join(', ');

    const prompt = `Recommend 3-5 investment products for a user with "${userRiskAppetite}" risk appetite.

    Available Products:
    ${products.map(p => `- ${p.name}: ${p.investment_type}, ${p.annual_yield}% yield, ${p.risk_level} risk`).join('\n')}

    Current Investments: ${existingTypes || 'None'}

    Return product IDs as JSON array, prioritizing diversification and risk alignment.
    Format: ["product-id-1", "product-id-2", ...]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    try {
      const recommendedIds = JSON.parse(text);
      return products.filter(p => recommendedIds.includes(p.id));
    } catch (parseError) {
      return generateBasicRecommendations(userRiskAppetite, products, currentInvestments);
    }
  } catch (error) {
    console.error('AI recommendations failed:', error);
    return generateBasicRecommendations(userRiskAppetite, products, currentInvestments);
  }
};

// 4. Portfolio Insights Generation
const generatePortfolioInsights = async (investments, userRiskAppetite) => {
  try {
    if (!hasValidApiKey()) {
      return generateBasicInsights(investments, userRiskAppetite);
    }

    const totalInvestment = investments.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
    const portfolioData = {
      totalInvestment,
      investmentCount: investments.length,
      userRiskAppetite,
      investments: investments.map(inv => ({
        type: inv.product?.investment_type,
        risk: inv.product?.risk_level,
        amount: inv.amount,
        yield: inv.product?.annual_yield
      }))
    };

    const prompt = `Analyze this investment portfolio and provide 3-4 key insights:

    Portfolio Data: ${JSON.stringify(portfolioData, null, 2)}

    Generate insights as JSON array with format:
    [{
      "type": "portfolio|recommendation|risk|performance",
      "title": "Insight Title",
      "content": "Detailed insight content",
      "priority": "low|medium|high"
    }]

    Focus on risk distribution, diversification, performance potential, and recommendations.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    try {
      return JSON.parse(text);
    } catch (parseError) {
      return generateBasicInsights(investments, userRiskAppetite);
    }
  } catch (error) {
    console.error('AI portfolio insights failed:', error);
    return generateBasicInsights(investments, userRiskAppetite);
  }
};

// 5. Error Summarization for Users
const summarizeUserErrors = async (errorLogs) => {
  try {
    if (!hasValidApiKey() || errorLogs.length === 0) {
      return generateBasicErrorSummary(errorLogs);
    }

    const errorData = errorLogs.map(log => ({
      endpoint: log.endpoint,
      method: log.http_method,
      status: log.status_code,
      error: log.error_message?.substring(0, 100) || 'No message'
    }));

    const prompt = `Analyze these API errors and provide a user-friendly summary:

    Error Data: ${JSON.stringify(errorData, null, 2)}

    Provide a concise, helpful summary explaining:
    1. Most common issues
    2. Potential causes
    3. Suggested actions for the user

    Keep it simple and actionable for non-technical users.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('AI error summarization failed:', error);
    return generateBasicErrorSummary(errorLogs);
  }
};

// FALLBACK FUNCTIONS (when AI is unavailable)

const basicPasswordAnalysis = (password) => {
  let score = Math.min(100, password.length * 8);
  const feedback = [];
  const suggestions = [];

  if (password.length < 8) feedback.push("Too short");
  if (!/[A-Z]/.test(password)) suggestions.push("Add uppercase letters");
  if (!/[a-z]/.test(password)) suggestions.push("Add lowercase letters");
  if (!/\d/.test(password)) suggestions.push("Add numbers");
  if (!/[^A-Za-z0-9]/.test(password)) suggestions.push("Add special characters");

  if (/[A-Z]/.test(password)) score += 15;
  if (/[a-z]/.test(password)) score += 15;
  if (/\d/.test(password)) score += 15;
  if (/[^A-Za-z0-9]/.test(password)) score += 20;

  return { score, feedback, suggestions };
};

const generateBasicDescription = (productData) => {
  const typeNames = {
    bond: 'bond investment',
    fd: 'fixed deposit',
    mf: 'mutual fund',
    etf: 'exchange-traded fund',
    other: 'investment product'
  };

  const riskDescriptions = {
    low: 'safe and steady',
    moderate: 'balanced risk-reward',
    high: 'growth-focused'
  };

  return `A ${riskDescriptions[productData.risk_level]} ${typeNames[productData.investment_type]} offering ${productData.annual_yield}% annual returns over ${productData.tenure_months} months. Minimum investment of $${productData.min_investment?.toLocaleString()} makes this suitable for ${productData.risk_level === 'low' ? 'conservative' : productData.risk_level === 'high' ? 'aggressive' : 'moderate'} investors.`;
};

const generateBasicRecommendations = (riskAppetite, products, currentInvestments) => {
  const existingTypes = new Set(currentInvestments.map(inv => inv.product?.investment_type));

  return products
    .filter(product => {
      // Match risk appetite
      if (riskAppetite === 'low' && product.risk_level === 'high') return false;
      if (riskAppetite === 'high' && product.risk_level === 'low') return false;

      // Prefer diversification
      return !existingTypes.has(product.investment_type);
    })
    .sort((a, b) => parseFloat(b.annual_yield) - parseFloat(a.annual_yield))
    .slice(0, 3);
};

const generateBasicInsights = (investments, userRiskAppetite) => {
  const insights = [];
  const totalInvestment = investments.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);

  if (investments.length === 0) {
    return [{
      type: 'portfolio',
      title: 'Start Your Investment Journey',
      content: 'Begin building wealth by exploring our investment products tailored to your risk appetite.',
      priority: 'high'
    }];
  }

  const riskDistribution = investments.reduce((acc, inv) => {
    const risk = inv.product?.risk_level || 'moderate';
    acc[risk] = (acc[risk] || 0) + 1;
    return acc;
  }, {});

  const highRiskCount = riskDistribution.high || 0;
  const totalCount = investments.length;

  if (highRiskCount / totalCount > 0.7) {
    insights.push({
      type: 'risk',
      title: 'High Risk Concentration',
      content: 'Your portfolio has significant exposure to high-risk investments. Consider adding some stable, low-risk options for balance.',
      priority: 'high'
    });
  }

  if (totalInvestment < 10000) {
    insights.push({
      type: 'portfolio',
      title: 'Growing Your Portfolio',
      content: 'Great start! Consider regular monthly investments to build wealth systematically over time.',
      priority: 'medium'
    });
  }

  insights.push({
    type: 'performance',
    title: 'Portfolio Status',
    content: `You have ${investments.length} active investments totaling $${totalInvestment.toLocaleString()}. Your ${userRiskAppetite} risk approach aligns well with your investment choices.`,
    priority: 'low'
  });

  return insights;
};

const generateBasicErrorSummary = (errorLogs) => {
  if (errorLogs.length === 0) {
    return "No recent errors found. Your account activity looks healthy!";
  }

  const errorCount = errorLogs.length;
  const recentErrors = errorLogs.slice(0, 3);
  const commonIssues = recentErrors.map(log => {
    if (log.status_code === 401) return "Authentication issues";
    if (log.status_code === 400) return "Invalid requests";
    if (log.status_code >= 500) return "Server problems";
    return "Request errors";
  });

  return `Found ${errorCount} recent errors. Common issues: ${[...new Set(commonIssues)].join(', ')}. If problems persist, try logging out and back in, or contact support.`;
};

module.exports = {
  analyzePasswordStrength,
  generateProductDescription,
  generateInvestmentRecommendations,
  generatePortfolioInsights,
  summarizeUserErrors
};