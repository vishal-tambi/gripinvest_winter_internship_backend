import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Navbar } from '@/components/layout/Navbar';
import { PortfolioSummaryCard } from '@/components/dashboard/PortfolioSummary';
import { useAuthStore } from '@/store/authStore';
import { investmentsAPI } from '@/lib/api';
import { aiService } from '@/lib/ai';
import { 
  TrendingUp, 
  PieChart, 
  Sparkles, 
  Brain,
  ChevronRight,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import type { Investment, AIInsight } from '@/types';

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [investmentsResponse] = await Promise.all([
          investmentsAPI.getPortfolio(),
        ]);
        
        setInvestments(investmentsResponse.data.data || []);

        // Generate AI insights
        if (investmentsResponse.data.data && user) {
          setInsightsLoading(true);
          try {
            const insights = await aiService.generatePortfolioInsights(
              investmentsResponse.data.data,
              user
            );
            setAiInsights(insights);
          } catch (error) {
            console.error('Failed to generate AI insights:', error);
          } finally {
            setInsightsLoading(false);
          }
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'portfolio': return PieChart;
      case 'recommendation': return TrendingUp;
      case 'risk': return AlertTriangle;
      case 'performance': return CheckCircle;
      default: return Info;
    }
  };

  const getInsightVariant = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Welcome back, {user?.first_name}! 👋
          </h1>
          <p className="text-muted-foreground mt-2">
            Here's an overview of your investment portfolio and AI-powered insights.
          </p>
        </div>

        {/* Portfolio Summary */}
        <div className="mb-8">
          <PortfolioSummaryCard />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* AI Insights */}
          <div className="lg:col-span-2">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  AI Insights
                  {insightsLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                </CardTitle>
                <CardDescription>
                  Personalized recommendations and analysis for your portfolio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {insightsLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : aiInsights.length > 0 ? (
                  aiInsights.map((insight, index) => {
                    const Icon = getInsightIcon(insight.type);
                    return (
                      <Alert key={index} variant={getInsightVariant(insight.priority) as any}>
                        <Icon className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{insight.title}</div>
                          <AlertDescription>{insight.content}</AlertDescription>
                          {insight.action && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-2"
                            >
                              {insight.action}
                            </Button>
                          )}
                        </div>
                      </Alert>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      {investments.length === 0 
                        ? "Start investing to get AI-powered insights!"
                        : "AI insights will appear here once your portfolio grows."
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks to manage your investments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="investment"
                  className="w-full justify-between"
                  onClick={() => navigate('/products')}
                >
                  Explore Products
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => navigate('/products')}
                >
                  Make Investment
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-between"
                  onClick={() => navigate('/investments')}
                >
                  View Portfolio
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-between"
                  onClick={() => navigate('/transactions')}
                >
                  Transaction History
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Risk Profile */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Risk Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">Current Setting</span>
                  <Badge variant="secondary" className="capitalize">
                    {user?.risk_appetite || 'Not Set'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Your risk tolerance helps us recommend suitable investments.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate('/profile')}
                >
                  Update Risk Profile
                </Button>
              </CardContent>
            </Card>

            {/* Performance */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">New Investments</span>
                    <span className="text-sm font-medium">
                      {investments.filter(inv => {
                        const investDate = new Date(inv.invested_at);
                        const now = new Date();
                        return investDate.getMonth() === now.getMonth() && 
                               investDate.getFullYear() === now.getFullYear();
                      }).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Active Products</span>
                    <span className="text-sm font-medium">
                      {new Set(investments.map(inv => inv.product_id)).size}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Portfolio Health</span>
                    <Badge variant="secondary" className="text-xs">
                      Good
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}