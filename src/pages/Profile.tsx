import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Navbar } from '@/components/layout/Navbar';
import { useAuthStore } from '@/store/authStore';
import { userAPI } from '@/lib/api';
import { 
  User,
  Settings,
  Shield,
  Brain,
  Save,
  Loader2,
  Check,
  TrendingUp
} from 'lucide-react';
import type { User as UserType } from '@/types';

export default function Profile() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<Partial<UserType>>({
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      risk_appetite: user?.risk_appetite || 'moderate',
    },
  });

  const watchedRiskAppetite = watch('risk_appetite');

  useEffect(() => {
    if (user) {
      setValue('first_name', user.first_name);
      setValue('last_name', user.last_name || '');
      setValue('email', user.email);
      setValue('risk_appetite', user.risk_appetite);
    }
  }, [user, setValue]);

  const onSubmit = async (data: Partial<UserType>) => {
    setLoading(true);
    setError(null);
    setUpdateSuccess(false);

    try {
      const response = await userAPI.updateProfile(data);
      setUser(response.data.data);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const getRiskDescription = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'Conservative approach focusing on capital preservation with steady, low-risk returns.';
      case 'moderate':
        return 'Balanced strategy combining growth and stability with moderate risk tolerance.';
      case 'high':
        return 'Aggressive approach seeking high returns with acceptance of significant risk.';
      default:
        return '';
    }
  };

  const getRiskRecommendations = (risk: string) => {
    switch (risk) {
      case 'low':
        return ['Government Bonds', 'Fixed Deposits', 'AAA-rated Corporate Bonds'];
      case 'moderate':
        return ['Balanced Mutual Funds', 'Blue-chip Stocks', 'Index ETFs'];
      case 'high':
        return ['Growth Stocks', 'Emerging Market Funds', 'Cryptocurrency'];
      default:
        return [];
    }
  };

  const joinDate = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) : 'Unknown';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your account information and investment preferences.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Profile Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Update your basic account details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        {...register('first_name', { required: 'First name is required' })}
                        placeholder="John"
                      />
                      {errors.first_name && (
                        <p className="text-xs text-error">{errors.first_name.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        {...register('last_name')}
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email', { 
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      })}
                      placeholder="john@example.com"
                    />
                    {errors.email && (
                      <p className="text-xs text-error">{errors.email.message}</p>
                    )}
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {updateSuccess && (
                    <Alert className="border-success text-success">
                      <Check className="h-4 w-4" />
                      <AlertDescription>Profile updated successfully!</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    disabled={loading || !isDirty}
                    className="w-full"
                    variant="hero"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Risk Appetite Settings */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Risk Appetite
                </CardTitle>
                <CardDescription>
                  Configure your investment risk tolerance for personalized recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="risk_appetite">Risk Tolerance</Label>
                  <Select 
                    value={watchedRiskAppetite} 
                    onValueChange={(value) => setValue('risk_appetite', value as any, { shouldDirty: true })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your risk tolerance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Conservative (Low Risk)</SelectItem>
                      <SelectItem value="moderate">Balanced (Moderate Risk)</SelectItem>
                      <SelectItem value="high">Aggressive (High Risk)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {watchedRiskAppetite && (
                  <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                    <h4 className="font-medium">About this risk level:</h4>
                    <p className="text-sm text-muted-foreground">
                      {getRiskDescription(watchedRiskAppetite)}
                    </p>
                    
                    <div>
                      <h5 className="text-sm font-medium mb-2">Recommended investments:</h5>
                      <div className="flex flex-wrap gap-2">
                        {getRiskRecommendations(watchedRiskAppetite).map((rec, index) => (
                          <Badge key={index} variant="secondary">
                            {rec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Summary */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Account Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Member since:</span>
                    <span className="font-medium">{joinDate}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Risk Profile:</span>
                    <Badge variant="secondary" className="capitalize">
                      {user?.risk_appetite}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Account Status:</span>
                    <Badge className="bg-success text-success-foreground">
                      Active
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Recommendations */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  AI Insights
                </CardTitle>
                <CardDescription>
                  Personalized recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Portfolio Tip</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Based on your {user?.risk_appetite} risk profile, consider diversifying 
                    into {getRiskRecommendations(user?.risk_appetite || 'moderate')[0]?.toLowerCase()} 
                    for optimal returns.
                  </p>
                </div>

                <Button
                  variant="investment"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate('/products')}
                >
                  View All Recommendations
                </Button>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" size="sm" className="w-full">
                  Change Password
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  Two-Factor Auth
                </Button>
                <Button variant="ghost" size="sm" className="w-full text-error">
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}