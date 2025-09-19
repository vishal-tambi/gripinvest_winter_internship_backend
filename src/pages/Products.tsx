import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Navbar } from '@/components/layout/Navbar';
import { productsAPI, investmentsAPI } from '@/lib/api';
import { aiService } from '@/lib/ai';
import { useAuthStore } from '@/store/authStore';
import {
  Search,
  Filter,
  TrendingUp,
  Shield,
  Clock,
  DollarSign,
  Sparkles,
  Brain,
  Loader2,
  Star
} from 'lucide-react';
import type { InvestmentProduct } from '@/types';

export default function Products() {
  const { user } = useAuthStore();
  const [products, setProducts] = useState<InvestmentProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<InvestmentProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<InvestmentProduct | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState<string>('');
  const [investing, setInvesting] = useState(false);
  const [investmentError, setInvestmentError] = useState<string>('');
  const [investmentSuccess, setInvestmentSuccess] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState<InvestmentProduct[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productsAPI.getAll();
        setProducts(response.data.data || []);
        setFilteredProducts(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = products;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(product => product.investment_type === typeFilter);
    }

    // Risk filter
    if (riskFilter !== 'all') {
      filtered = filtered.filter(product => product.risk_level === riskFilter);
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, typeFilter, riskFilter]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bond': return '🏛️';
      case 'fd': return '🏦';
      case 'mf': return '📊';
      case 'etf': return '📈';
      default: return '💼';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'bond': return 'bg-investment-bond';
      case 'fd': return 'bg-investment-fd';
      case 'mf': return 'bg-investment-mf';
      case 'etf': return 'bg-investment-etf';
      default: return 'bg-investment-other';
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

  const handleViewRecommendations = async () => {
    if (!user) return;

    setLoadingRecommendations(true);
    try {
      // Fetch current investments to provide context for recommendations
      const investmentsResponse = await investmentsAPI.getPortfolio();
      const currentInvestments = investmentsResponse.data.data || [];

      const recommendations = await aiService.generateProductRecommendations(user, products, currentInvestments);
      setRecommendedProducts(recommendations);
      setShowRecommendations(true);
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleInvestment = async () => {
    if (!selectedProduct) return;

    const amount = parseFloat(investmentAmount);

    // Validation
    if (isNaN(amount) || amount <= 0) {
      setInvestmentError('Please enter a valid amount');
      return;
    }

    if (amount < selectedProduct.min_investment) {
      setInvestmentError(`Minimum investment is $${selectedProduct.min_investment.toLocaleString()}`);
      return;
    }

    if (selectedProduct.max_investment && amount > selectedProduct.max_investment) {
      setInvestmentError(`Maximum investment is $${selectedProduct.max_investment.toLocaleString()}`);
      return;
    }

    setInvesting(true);
    setInvestmentError('');

    try {
      await investmentsAPI.create({
        product_id: selectedProduct.id,
        amount: amount
      });

      setInvestmentSuccess(true);
      setInvestmentAmount('');
      setSelectedProduct(null);

      // Hide success message after 3 seconds
      setTimeout(() => setInvestmentSuccess(false), 3000);
    } catch (error: any) {
      setInvestmentError(error.response?.data?.message || 'Investment failed. Please try again.');
    } finally {
      setInvesting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Success Notification */}
      {investmentSuccess && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-success/10 border border-success/20 text-success p-4 rounded-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            <span className="font-medium">Investment successful! You can view your portfolio in the Investments page.</span>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Investment Products</h1>
          <p className="text-muted-foreground">
            Discover investment opportunities tailored to your goals and risk appetite.
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Investment Type</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="bond">Bonds</SelectItem>
                    <SelectItem value="fd">Fixed Deposits</SelectItem>
                    <SelectItem value="mf">Mutual Funds</SelectItem>
                    <SelectItem value="etf">ETFs</SelectItem>
                    <SelectItem value="other">Others</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Risk Level</label>
                <Select value={riskFilter} onValueChange={setRiskFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All risk levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risk Levels</SelectItem>
                    <SelectItem value="low">Low Risk</SelectItem>
                    <SelectItem value="moderate">Moderate Risk</SelectItem>
                    <SelectItem value="high">High Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Recommendations Banner */}
        <Card className="mb-8 shadow-card bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">AI Recommendations Available</h3>
                <p className="text-sm text-muted-foreground">
                  Get personalized product suggestions based on your risk profile and investment history.
                </p>
              </div>
              <Button
                variant="premium"
                className="ml-auto"
                onClick={handleViewRecommendations}
                disabled={loadingRecommendations}
              >
                {loadingRecommendations ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    View Recommendations
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recommended Products Section */}
        {showRecommendations && recommendedProducts.length > 0 && (
          <Card className="mb-8 shadow-card bg-gradient-to-r from-success/10 to-success/5 border-success/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-success" />
                AI Recommended Products
                <Badge variant="secondary" className="ml-auto">
                  {recommendedProducts.length} recommendations
                </Badge>
              </CardTitle>
              <CardDescription>
                Based on your {user?.risk_appetite} risk profile and investment preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recommendedProducts.slice(0, 3).map((product) => (
                  <Card key={product.id} className="bg-white border-success/30 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{getTypeIcon(product.investment_type)}</span>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{product.name}</h4>
                          <p className="text-xs text-muted-foreground capitalize">
                            {product.investment_type.replace('_', ' ')}
                          </p>
                        </div>
                        <Badge className={getRiskColor(product.risk_level)} variant="outline">
                          {product.risk_level}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-xs mb-3">
                        <span className="text-success font-medium">{product.annual_yield}% yield</span>
                        <span className="text-muted-foreground">{product.tenure_months}m</span>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="success"
                            className="w-full"
                            onClick={() => setSelectedProduct(product)}
                          >
                            Invest Now
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Invest in {product.name}</DialogTitle>
                            <DialogDescription>
                              Enter the amount you want to invest in this product.
                            </DialogDescription>
                          </DialogHeader>

                          <div className="space-y-4">
                            {/* Product Summary */}
                            <div className="bg-muted/50 p-4 rounded-lg">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Expected Return</span>
                                  <div className="font-semibold">{product.annual_yield}% annually</div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Tenure</span>
                                  <div className="font-semibold">{product.tenure_months} months</div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Min Investment</span>
                                  <div className="font-semibold">${product.min_investment.toLocaleString()}</div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Risk Level</span>
                                  <Badge className={getRiskColor(product.risk_level)}>
                                    {product.risk_level}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            {/* Investment Amount Input */}
                            <div className="space-y-2">
                              <Label htmlFor="amount">Investment Amount ($)</Label>
                              <Input
                                id="amount"
                                type="number"
                                value={investmentAmount}
                                onChange={(e) => setInvestmentAmount(e.target.value)}
                                placeholder={`Min: ${product.min_investment}`}
                                min={product.min_investment}
                                max={product.max_investment || undefined}
                              />
                              <div className="text-xs text-muted-foreground">
                                Range: ${product.min_investment.toLocaleString()} - {
                                  product.max_investment
                                    ? `$${product.max_investment.toLocaleString()}`
                                    : 'No limit'
                                }
                              </div>
                            </div>

                            {/* Error Message */}
                            {investmentError && (
                              <div className="text-sm text-error bg-error/10 p-3 rounded">
                                {investmentError}
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              <Button
                                onClick={handleInvestment}
                                disabled={investing || !investmentAmount}
                                className="flex-1"
                              >
                                {investing ? 'Processing...' : 'Confirm Investment'}
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setInvestmentAmount('');
                                  setInvestmentError('');
                                  setSelectedProduct(null);
                                }}
                                disabled={investing}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {recommendedProducts.length > 3 && (
                <div className="mt-4 text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRecommendations(false)}
                  >
                    View All Products Below
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Products Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => {
            const isRecommended = recommendedProducts.some(rec => rec.id === product.id);
            return (
            <Card key={product.id} className={`shadow-card hover:shadow-elegant transition-shadow ${
              isRecommended ? 'ring-2 ring-success/50 bg-success/5' : ''
            }`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getTypeIcon(product.investment_type)}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        {isRecommended && (
                          <Star className="h-4 w-4 fill-success text-success" title="AI Recommended" />
                        )}
                      </div>
                      <CardDescription className="capitalize">
                        {product.investment_type.replace('_', ' ')}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={getRiskColor(product.risk_level)}>
                    {product.risk_level}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <TrendingUp className="h-4 w-4 text-success" />
                      <span className="text-sm font-medium">Yield</span>
                    </div>
                    <div className="text-lg font-bold text-success">
                      {product.annual_yield}%
                    </div>
                  </div>
                  
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Tenure</span>
                    </div>
                    <div className="text-lg font-bold">
                      {product.tenure_months}m
                    </div>
                  </div>
                </div>

                {/* Investment Range */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Investment Range</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ${product.min_investment.toLocaleString()} - {
                      product.max_investment 
                        ? `$${product.max_investment.toLocaleString()}`
                        : 'No limit'
                    }
                  </div>
                </div>

                {/* Description */}
                {product.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="investment"
                        className="flex-1"
                        onClick={() => setSelectedProduct(product)}
                      >
                        Invest Now
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Invest in {product.name}</DialogTitle>
                        <DialogDescription>
                          Enter the amount you want to invest in this product.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        {/* Product Summary */}
                        <div className="bg-muted/50 p-4 rounded-lg">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Expected Return</span>
                              <div className="font-semibold">{product.annual_yield}% annually</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Tenure</span>
                              <div className="font-semibold">{product.tenure_months} months</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Min Investment</span>
                              <div className="font-semibold">${product.min_investment.toLocaleString()}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Risk Level</span>
                              <Badge className={getRiskColor(product.risk_level)}>
                                {product.risk_level}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Investment Amount Input */}
                        <div className="space-y-2">
                          <Label htmlFor="amount">Investment Amount ($)</Label>
                          <Input
                            id="amount"
                            type="number"
                            value={investmentAmount}
                            onChange={(e) => setInvestmentAmount(e.target.value)}
                            placeholder={`Min: ${product.min_investment}`}
                            min={product.min_investment}
                            max={product.max_investment || undefined}
                          />
                          <div className="text-xs text-muted-foreground">
                            Range: ${product.min_investment.toLocaleString()} - {
                              product.max_investment
                                ? `$${product.max_investment.toLocaleString()}`
                                : 'No limit'
                            }
                          </div>
                        </div>

                        {/* Error Message */}
                        {investmentError && (
                          <div className="text-sm text-error bg-error/10 p-3 rounded">
                            {investmentError}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button
                            onClick={handleInvestment}
                            disabled={investing || !investmentAmount}
                            className="flex-1"
                          >
                            {investing ? 'Processing...' : 'Confirm Investment'}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setInvestmentAmount('');
                              setInvestmentError('');
                              setSelectedProduct(null);
                            }}
                            disabled={investing}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" size="sm">
                    Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
          })}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && !loading && (
          <Card className="shadow-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Try adjusting your filters or search terms to find investment products that match your criteria.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}