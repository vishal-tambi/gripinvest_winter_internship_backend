import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { investmentsAPI } from '@/lib/api';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  Target,
  Sparkles
} from 'lucide-react';
import type { PortfolioSummary } from '@/types';

export function PortfolioSummaryCard() {
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await investmentsAPI.getPortfolioSummary();
        setSummary(response.data.data);
      } catch (error) {
        console.error('Failed to fetch portfolio summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-4 w-4 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!summary) {
    return (
      <Card className="col-span-full">
        <CardContent className="flex items-center justify-center h-40">
          <p className="text-muted-foreground">Failed to load portfolio data</p>
        </CardContent>
      </Card>
    );
  }

  const totalInvestment = summary.total_investment || 0;
  const totalExpectedReturn = summary.total_expected_return || 0;
  const profitLoss = totalExpectedReturn - totalInvestment;
  const profitLossPercentage = totalInvestment > 0
    ? ((profitLoss / totalInvestment) * 100)
    : 0;

  const investmentTypes = [
    { key: 'bond', label: 'Bonds', color: 'bg-investment-bond' },
    { key: 'fd', label: 'Fixed Deposits', color: 'bg-investment-fd' },
    { key: 'mf', label: 'Mutual Funds', color: 'bg-investment-mf' },
    { key: 'etf', label: 'ETFs', color: 'bg-investment-etf' },
    { key: 'other', label: 'Others', color: 'bg-investment-other' },
  ] as const;

  const riskLevels = [
    { key: 'low', label: 'Low Risk', color: 'bg-success' },
    { key: 'moderate', label: 'Moderate Risk', color: 'bg-warning' },
    { key: 'high', label: 'High Risk', color: 'bg-error' },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalInvestment.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {summary.investment_count || 0} investments
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expected Returns</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalExpectedReturn.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Projected at maturity
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit/Loss</CardTitle>
            {profitLoss >= 0 ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-error" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              profitLoss >= 0 ? 'text-success' : 'text-error'
            }`}>
              {profitLoss >= 0 ? '+' : ''}${profitLoss.toLocaleString()}
            </div>
            <p className={`text-xs ${
              profitLoss >= 0 ? 'text-success' : 'text-error'
            }`}>
              {profitLoss >= 0 ? '+' : ''}{profitLossPercentage.toFixed(2)}% return
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.investment_count || 0}</div>
            <p className="text-xs text-muted-foreground">
              Portfolio holdings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Investment Type Distribution */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Investment Types
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {investmentTypes.map((type) => {
              const percentage = (summary.type_distribution[type.key] || 0) * 100;
              return (
                <div key={type.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{type.label}</span>
                    <Badge variant="secondary">{percentage.toFixed(1)}%</Badge>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Risk Distribution */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Risk Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {riskLevels.map((risk) => {
              const percentage = (summary.risk_distribution[risk.key] || 0) * 100;
              return (
                <div key={risk.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{risk.label}</span>
                    <Badge variant="secondary">{percentage.toFixed(1)}%</Badge>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}