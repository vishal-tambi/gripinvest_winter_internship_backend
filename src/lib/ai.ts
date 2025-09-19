import { GoogleGenerativeAI } from '@google/generative-ai';
import type { InvestmentProduct, Investment, User, AIInsight } from '@/types';

// Get API key from environment variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

// Only initialize if we have a valid API key
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export class AIService {
  private model = genAI?.getGenerativeModel({ model: 'gemini-1.5-flash' }) || null;

  async analyzePasswordStrength(password: string): Promise<{
    score: number;
    feedback: string[];
    suggestions: string[];
  }> {
    try {
      if (!this.model) {
        return this.basicPasswordAnalysis(password);
      }
      const prompt = `Analyze this password strength: "${password}"
      
      Provide a JSON response with:
      - score (0-100)
      - feedback (array of issues found)
      - suggestions (array of improvements)
      
      Consider: length, complexity, common patterns, dictionary words.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        return JSON.parse(text);
      } catch {
        // Fallback basic analysis
        return this.basicPasswordAnalysis(password);
      }
    } catch (error) {
      console.error('AI password analysis failed:', error);
      return this.basicPasswordAnalysis(password);
    }
  }

  async generateProductRecommendations(
    user: User,
    products: InvestmentProduct[],
    currentInvestments: Investment[]
  ): Promise<InvestmentProduct[]> {
    try {
      if (!this.model) {
        return this.ruleBasedRecommendations(user, products, currentInvestments);
      }
      const userContext = `
        User Risk Appetite: ${user.risk_appetite}
        Current Investments: ${(currentInvestments || []).length}
        Portfolio Types: ${(currentInvestments || [])
          .map(inv => inv.product?.investment_type)
          .filter(type => type != null)
          .join(', ') || 'None'}
      `;

      const productsList = products.map(p => `
        ID: ${p.id}
        Name: ${p.name}
        Type: ${p.investment_type}
        Risk: ${p.risk_level}
        Yield: ${p.annual_yield}%
        Min Investment: ${p.min_investment}
      `).join('\n');

      const prompt = `Based on this user profile and available products, recommend 3-5 products:

      User Profile:
      ${userContext}

      Available Products:
      ${productsList}

      Return only product IDs as JSON array, considering risk tolerance and diversification.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        const recommendedIds: string[] = JSON.parse(text);
        return products.filter(p => recommendedIds.includes(p.id));
      } catch {
        // Fallback to rule-based recommendations
        return this.ruleBasedRecommendations(user, products, currentInvestments);
      }
    } catch (error) {
      console.error('AI recommendations failed:', error);
      return this.ruleBasedRecommendations(user, products, currentInvestments);
    }
  }

  async generatePortfolioInsights(
    investments: Investment[],
    user: User
  ): Promise<AIInsight[]> {
    // Ensure investments is an array (move outside try block for scope)
    const investmentArray = Array.isArray(investments) ? investments : [];

    try {
      if (!this.model) {
        return this.generateBasicInsights(investmentArray, user);
      }

      const portfolioData = {
        totalInvestment: investmentArray.reduce((sum, inv) => sum + inv.amount, 0),
        riskDistribution: this.calculateRiskDistribution(investmentArray),
        typeDistribution: this.calculateTypeDistribution(investmentArray),
        averageYield: this.calculateAverageYield(investmentArray),
        userRiskAppetite: user.risk_appetite,
      };

      const prompt = `Analyze this investment portfolio and provide insights:

      Portfolio Data: ${JSON.stringify(portfolioData, null, 2)}

      Generate 3-5 insights as JSON array with format:
      {
        "type": "portfolio|recommendation|risk|performance",
        "title": "Insight Title",
        "content": "Detailed insight content",
        "action": "Suggested action (optional)",
        "priority": "low|medium|high"
      }`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        return JSON.parse(text);
      } catch {
        return this.generateBasicInsights(investmentArray, user);
      }
    } catch (error) {
      console.error('AI portfolio insights failed:', error);
      return this.generateBasicInsights(investmentArray, user);
    }
  }

  async summarizeErrors(logs: any[]): Promise<string> {
    try {
      if (!this.model) {
        const errorCount = logs.filter(log => log.status_code >= 400).length;
        return `Found ${errorCount} errors in recent activity. Please check the detailed logs for more information.`;
      }
      const errorLogs = logs.filter(log => log.status_code >= 400);
      
      if (errorLogs.length === 0) {
        return "No errors found in recent activity.";
      }

      const errorSummary = errorLogs.map(log => `
        ${log.http_method} ${log.endpoint} - ${log.status_code}
        Error: ${log.error_message || 'Unknown error'}
      `).join('\n');

      const prompt = `Summarize these API errors in a user-friendly way:

      ${errorSummary}

      Provide a concise summary with:
      1. Most common error types
      2. Potential causes
      3. Suggested actions`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('AI error summarization failed:', error);
      return `Found ${logs.filter(log => log.status_code >= 400).length} errors in recent activity. Please check the detailed logs for more information.`;
    }
  }

  // Fallback methods for when AI fails

  private basicPasswordAnalysis(password: string) {
    const score = Math.min(100, password.length * 8 + 
      ((/[A-Z]/.test(password) ? 10 : 0)) +
      ((/[a-z]/.test(password) ? 10 : 0)) +
      ((/\d/.test(password) ? 10 : 0)) +
      ((/[^A-Za-z0-9]/.test(password) ? 15 : 0)));

    const feedback = [];
    const suggestions = [];

    if (password.length < 8) feedback.push("Password too short");
    if (!/[A-Z]/.test(password)) suggestions.push("Add uppercase letters");
    if (!/[a-z]/.test(password)) suggestions.push("Add lowercase letters");
    if (!/\d/.test(password)) suggestions.push("Add numbers");
    if (!/[^A-Za-z0-9]/.test(password)) suggestions.push("Add special characters");

    return { score, feedback, suggestions };
  }

  private ruleBasedRecommendations(
    user: User,
    products: InvestmentProduct[],
    currentInvestments: Investment[]
  ): InvestmentProduct[] {
    const userRiskLevel = user.risk_appetite;
    const existingTypes = new Set(
      (currentInvestments || [])
        .map(inv => inv.product?.investment_type)
        .filter(type => type != null)
    );

    return products
      .filter(product => {
        // Match risk appetite
        if (userRiskLevel === 'low' && product.risk_level === 'high') return false;
        if (userRiskLevel === 'high' && product.risk_level === 'low') return false;
        
        // Diversification - prefer different types
        return !existingTypes.has(product.investment_type);
      })
      .sort((a, b) => b.annual_yield - a.annual_yield)
      .slice(0, 3);
  }

  private generateBasicInsights(investments: Investment[], user: User): AIInsight[] {
    const insights: AIInsight[] = [];
    // Ensure investments is an array
    const investmentArray = Array.isArray(investments) ? investments : [];

    const totalInvestment = investmentArray.reduce((sum, inv) => sum + inv.amount, 0);
    const riskDist = this.calculateRiskDistribution(investmentArray);

    // Risk distribution insight
    if (riskDist.high > 0.7) {
      insights.push({
        type: 'risk',
        title: 'High Risk Concentration',
        content: 'Your portfolio has high exposure to risky investments. Consider diversifying with some low-risk options.',
        action: 'Add bonds or fixed deposits',
        priority: 'high'
      });
    }

    // Portfolio size insight
    if (totalInvestment < 10000) {
      insights.push({
        type: 'portfolio',
        title: 'Growing Portfolio',
        content: 'Your investment journey is just beginning. Consider regular investments to build wealth over time.',
        action: 'Set up systematic investments',
        priority: 'medium'
      });
    }

    return insights;
  }

  private calculateRiskDistribution(investments: Investment[]) {
    const total = investments.length;
    if (total === 0) return { low: 0, moderate: 0, high: 0 };

    const counts = investments.reduce((acc, inv) => {
      const risk = inv.product?.risk_level || 'moderate';
      acc[risk] = (acc[risk] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      low: (counts.low || 0) / total,
      moderate: (counts.moderate || 0) / total,
      high: (counts.high || 0) / total,
    };
  }

  private calculateTypeDistribution(investments: Investment[]) {
    const total = investments.length;
    if (total === 0) return { bond: 0, fd: 0, mf: 0, etf: 0, other: 0 };

    const counts = investments.reduce((acc, inv) => {
      const type = inv.product?.investment_type || 'other';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      bond: (counts.bond || 0) / total,
      fd: (counts.fd || 0) / total,
      mf: (counts.mf || 0) / total,
      etf: (counts.etf || 0) / total,
      other: (counts.other || 0) / total,
    };
  }

  private calculateAverageYield(investments: Investment[]) {
    if (investments.length === 0) return 0;
    const totalYield = investments.reduce((sum, inv) => 
      sum + (inv.product?.annual_yield || 0), 0);
    return totalYield / investments.length;
  }
}

export const aiService = new AIService();