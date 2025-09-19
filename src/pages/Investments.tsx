import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Navbar } from '@/components/layout/Navbar';
import { investmentsAPI } from '@/lib/api';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { 
  PieChart as PieIcon,
  BarChart3,
  TrendingUp,
  Calendar,
  DollarSign,
  Activity,
  Plus
} from 'lucide-react';
import type { Investment } from '@/types';

export default function Investments() {
  const navigate = useNavigate();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);

  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        const response = await investmentsAPI.getPortfolio();
        setInvestments(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch investments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvestments();
  }, []);

  // Chart data preparation
  const typeDistribution = investments.reduce((acc, inv) => {
    const type = inv.product?.investment_type || 'other';
    acc[type] = (acc[type] || 0) + inv.amount;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(typeDistribution).map(([type, amount]) => ({
    name: type.toUpperCase(),
    value: amount,
    color: getTypeColor(type),
  }));

  const monthlyData = investments.reduce((acc, inv) => {
    const month = new Date(inv.invested_at).toLocaleString('default', { month: 'short' });
    const existingMonth = acc.find(item => item.month === month);
    if (existingMonth) {
      existingMonth.amount += inv.amount;
    } else {
      acc.push({ month, amount: inv.amount });
    }
    return acc;
  }, [] as Array<{ month: string; amount: number }>);

  function getTypeColor(type: string) {
    const colors: Record<string, string> = {
      bond: '#fbbf24',
      fd: '#10b981',
      mf: '#8b5cf6',
      etf: '#3b82f6',
      other: '#ec4899',
    };
    return colors[type] || '#6b7280';
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success text-success-foreground';
      case 'matured': return 'bg-primary text-primary-foreground';
      case 'cancelled': return 'bg-error text-error-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-success text-success-foreground';
      case 'moderate': return 'bg-warning text-warning-foreground';
      case 'high': return 'bg-error text-error-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const totalInvestment = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalExpectedReturn = investments.reduce((sum, inv) => sum + (inv.expected_return || 0), 0);
  const profitLoss = totalExpectedReturn - totalInvestment;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid gap-4 md:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Investments</h1>
            <p className="text-muted-foreground">
              Track your portfolio performance and investment details.
            </p>
          </div>
          <Button variant="hero" onClick={() => navigate('/products')}>
            <Plus className="mr-2 h-4 w-4" />
            New Investment
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalInvestment.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {investments.length} active investments
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expected Returns</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalExpectedReturn.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                At maturity
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projected Profit</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${profitLoss >= 0 ? 'text-success' : 'text-error'}`}>
                {profitLoss >= 0 ? '+' : ''}${profitLoss.toLocaleString()}
              </div>
              <p className={`text-xs ${profitLoss >= 0 ? 'text-success' : 'text-error'}`}>
                {totalInvestment > 0 ? `${((profitLoss / totalInvestment) * 100).toFixed(2)}%` : '0%'} return
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="portfolio" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="portfolio">Portfolio View</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="history">Investment History</TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio" className="space-y-6">
            {investments.length === 0 ? (
              <Card className="shadow-card">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="text-4xl mb-4">📊</div>
                  <h3 className="text-lg font-semibold mb-2">No investments yet</h3>
                  <p className="text-muted-foreground text-center max-w-md mb-4">
                    Start your investment journey by exploring our products and making your first investment.
                  </p>
                  <Button variant="hero" onClick={() => navigate('/products')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Make First Investment
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {investments.map((investment) => (
                  <Card key={investment.id} className="shadow-card">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {investment.product?.name || 'Unknown Product'}
                          </CardTitle>
                          <CardDescription className="capitalize">
                            {investment.product?.investment_type?.replace('_', ' ')}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(investment.status)}>
                          {investment.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Invested</div>
                          <div className="text-lg font-semibold">
                            ${investment.amount.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Expected</div>
                          <div className="text-lg font-semibold text-success">
                            ${investment.expected_return?.toLocaleString() || 'N/A'}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Yield:</span>
                          <span className="font-medium">{investment.product?.annual_yield || 'N/A'}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Invested on:</span>
                          <span className="font-medium">
                            {new Date(investment.invested_at).toLocaleDateString()}
                          </span>
                        </div>
                        {investment.maturity_date && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Maturity:</span>
                            <span className="font-medium">
                              {new Date(investment.maturity_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => setSelectedInvestment(investment)}
                            >
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Investment Details</DialogTitle>
                              <DialogDescription>
                                Complete information about your investment
                              </DialogDescription>
                            </DialogHeader>

                            {selectedInvestment && (
                              <div className="space-y-4">
                                <div className="bg-muted/50 p-4 rounded-lg">
                                  <h3 className="font-semibold text-lg mb-3">
                                    {selectedInvestment.product?.name || 'Unknown Product'}
                                  </h3>

                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">Investment Amount</span>
                                      <div className="font-semibold">${selectedInvestment.amount.toLocaleString()}</div>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Expected Return</span>
                                      <div className="font-semibold">
                                        ${selectedInvestment.expected_return?.toLocaleString() || 'N/A'}
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Annual Yield</span>
                                      <div className="font-semibold">
                                        {selectedInvestment.product?.annual_yield || 'N/A'}%
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Tenure</span>
                                      <div className="font-semibold">
                                        {selectedInvestment.product?.tenure_months || 'N/A'} months
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Risk Level</span>
                                      <Badge className={getRiskColor(selectedInvestment.product?.risk_level || 'moderate')}>
                                        {selectedInvestment.product?.risk_level || 'N/A'}
                                      </Badge>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Status</span>
                                      <Badge variant={selectedInvestment.status === 'active' ? 'default' : 'secondary'}>
                                        {selectedInvestment.status}
                                      </Badge>
                                    </div>
                                  </div>

                                  {selectedInvestment.product?.description && (
                                    <div className="mt-4">
                                      <span className="text-muted-foreground text-sm">Description</span>
                                      <p className="text-sm mt-1">{selectedInvestment.product.description}</p>
                                    </div>
                                  )}

                                  <div className="mt-4 pt-4 border-t">
                                    <div className="text-xs text-muted-foreground">
                                      Investment Date: {new Date(selectedInvestment.created_at).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        {investment.status === 'active' && (
                          <Button variant="ghost" size="sm" onClick={() => {
                            // Add manage functionality here - for now just show an alert
                            alert('Manage functionality coming soon! You can cancel investments from the transaction history.');
                          }}>
                            Manage
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Investment Type Distribution */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieIcon className="h-5 w-5" />
                    Investment Distribution
                  </CardTitle>
                  <CardDescription>
                    Breakdown by investment type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Amount']} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-muted-foreground">
                      No data available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Monthly Investment Trend */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Investment Timeline
                  </CardTitle>
                  <CardDescription>
                    Monthly investment amounts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {monthlyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Amount']} />
                        <Bar dataKey="amount" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-muted-foreground">
                      No data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Investment History
                </CardTitle>
                <CardDescription>
                  Complete record of your investment transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {investments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No investment history available
                  </div>
                ) : (
                  <div className="space-y-4">
                    {investments.map((investment) => (
                      <div key={investment.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                          <div>
                            <div className="font-medium">{investment.product?.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(investment.invested_at).toLocaleDateString()} • 
                              {investment.product?.investment_type?.toUpperCase()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${investment.amount.toLocaleString()}</div>
                          <Badge className={getStatusColor(investment.status)} variant="secondary">
                            {investment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}