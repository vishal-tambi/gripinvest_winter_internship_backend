import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useAuthStore } from '@/store/authStore';
import { aiService } from '@/lib/ai';
import { Eye, EyeOff, Loader2, Shield } from 'lucide-react';
import type { LoginCredentials, SignupData } from '@/types';

interface PasswordStrength {
  score: number;
  feedback: string[];
  suggestions: string[];
}

export function AuthForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = searchParams.get('mode') || 'login';
  const isSignup = mode === 'signup';

  const { login, signup, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength | null>(null);
  const [analyzingPassword, setAnalyzingPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SignupData>();

  const watchedPassword = watch('password');

  // AI Password Strength Analysis
  const analyzePassword = async (password: string) => {
    if (!password || password.length < 4) {
      setPasswordStrength(null);
      return;
    }

    setAnalyzingPassword(true);
    try {
      const analysis = await aiService.analyzePasswordStrength(password);
      setPasswordStrength(analysis);
    } catch (error) {
      console.error('Password analysis failed:', error);
    } finally {
      setAnalyzingPassword(false);
    }
  };

  // Debounced password analysis
  useState(() => {
    const timeoutId = setTimeout(() => {
      if (watchedPassword && isSignup) {
        analyzePassword(watchedPassword);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  });

  const onSubmit = async (data: SignupData) => {
    clearError();
    try {
      if (isSignup) {
        await signup(data);
        navigate('/dashboard');
      } else {
        await login(data as LoginCredentials);
        navigate('/dashboard');
      }
    } catch (error) {
      // Error handled by store
      console.error('Authentication error:', error);
    }
  };

  const getPasswordStrengthColor = (score: number) => {
    if (score < 30) return 'bg-error';
    if (score < 60) return 'bg-warning';
    if (score < 80) return 'bg-warning';
    return 'bg-success';
  };

  const getPasswordStrengthText = (score: number) => {
    if (score < 30) return 'Weak';
    if (score < 60) return 'Fair';
    if (score < 80) return 'Good';
    return 'Strong';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md shadow-elegant">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gradient">
            {isSignup ? 'Create Account' : 'Welcome Back'}
          </CardTitle>
          <CardDescription>
            {isSignup 
              ? 'Start your investment journey with AI-powered insights'
              : 'Sign in to access your investment portfolio'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {isSignup && (
              <div className="grid grid-cols-2 gap-3">
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
            )}

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

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  placeholder="••••••••"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-xs text-error">{errors.password.message}</p>
              )}

              {/* AI Password Strength Indicator */}
              {isSignup && watchedPassword && passwordStrength && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">Password Strength</span>
                    <span className={`text-xs font-medium ${
                      passwordStrength.score < 60 ? 'text-error' : 'text-success'
                    }`}>
                      {getPasswordStrengthText(passwordStrength.score)}
                    </span>
                  </div>
                  <Progress
                    value={passwordStrength.score}
                    className={`h-2 ${getPasswordStrengthColor(passwordStrength.score)}`}
                  />
                  {passwordStrength.suggestions.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      <Shield className="h-3 w-3 inline mr-1" />
                      {passwordStrength.suggestions.join(', ')}
                    </div>
                  )}
                </div>
              )}

              {isSignup && analyzingPassword && (
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Analyzing password strength...</span>
                </div>
              )}
            </div>

            {isSignup && (
              <div className="space-y-2">
                <Label htmlFor="risk_appetite">Risk Appetite</Label>
                <Select onValueChange={(value) => setValue('risk_appetite', value as any)}>
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
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              variant="hero"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isSignup ? 'Creating Account...' : 'Signing In...'}
                </>
              ) : (
                isSignup ? 'Create Account' : 'Sign In'
              )}
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                {isSignup ? 'Already have an account?' : "Don't have an account?"}
              </span>{' '}
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto font-medium"
                onClick={() => {
                  const newMode = isSignup ? 'login' : 'signup';
                  navigate(`/auth?mode=${newMode}`);
                }}
              >
                {isSignup ? 'Sign In' : 'Sign Up'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}