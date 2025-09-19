import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  Shield,
  Zap,
  PieChart,
  DollarSign,
  Users,
  Award,
  ChevronRight,
  Sparkles,
  Star,
  Quote,
  Check,
  Plus,
  Minus,
  Mail,
  Phone,
  MapPin,
  Github,
  Twitter,
  Linkedin
} from 'lucide-react';

const Index = () => {
  const [animateHero, setAnimateHero] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [animateStats, setAnimateStats] = useState(false);
  const [countedStats, setCountedStats] = useState({
    investors: 0,
    invested: 0,
    returns: 0,
    products: 0
  });

  useEffect(() => {
    setAnimateHero(true);
  }, []);

  // Intersection Observer for stats animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !animateStats) {
            setAnimateStats(true);
            // Animate counters
            animateCounter('investors', 10000, 1500);
            animateCounter('invested', 50, 1200);
            animateCounter('returns', 12.5, 1000);
            animateCounter('products', 200, 1800);
          }
        });
      },
      { threshold: 0.3 }
    );

    const statsSection = document.getElementById('stats-section');
    if (statsSection) {
      observer.observe(statsSection);
    }

    return () => observer.disconnect();
  }, [animateStats]);

  const animateCounter = (key: keyof typeof countedStats, target: number, duration: number) => {
    let start = 0;
    const increment = target / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCountedStats(prev => ({ ...prev, [key]: target }));
        clearInterval(timer);
      } else {
        setCountedStats(prev => ({ ...prev, [key]: Math.floor(start * 10) / 10 }));
      }
    }, 16);
  };

  const formatStatValue = (key: keyof typeof countedStats, value: number) => {
    switch (key) {
      case 'investors':
        return `${(value / 1000).toFixed(0)}K+`;
      case 'invested':
        return `$${value}M+`;
      case 'returns':
        return `${value}%`;
      case 'products':
        return `${value}+`;
      default:
        return value.toString();
    }
  };

  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Insights',
      description: 'Get personalized investment recommendations and portfolio analysis powered by advanced AI.',
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Bank-grade security with encrypted transactions and secure data storage.',
    },
    {
      icon: PieChart,
      title: 'Portfolio Management',
      description: 'Track your investments, analyze performance, and manage risk distribution.',
    },
    {
      icon: TrendingUp,
      title: 'Smart Recommendations',
      description: 'AI analyzes your risk appetite and suggests optimal investment opportunities.',
    },
  ];

  const stats = [
    { label: 'Active Investors', value: '10,000+', icon: Users },
    { label: 'Total Invested', value: '$50M+', icon: DollarSign },
    { label: 'Average Returns', value: '12.5%', icon: TrendingUp },
    { label: 'Investment Products', value: '200+', icon: Award },
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Software Engineer',
      avatar: '👩‍💻',
      content: 'The AI recommendations helped me diversify my portfolio perfectly. I\'ve seen 15% returns in just 6 months!',
      rating: 5
    },
    {
      name: 'Michael Rodriguez',
      role: 'Business Owner',
      avatar: '👨‍💼',
      content: 'InvestPro\'s risk management tools gave me confidence to invest more. The interface is incredibly user-friendly.',
      rating: 5
    },
    {
      name: 'Emily Johnson',
      role: 'Marketing Director',
      avatar: '👩‍🎨',
      content: 'Finally, an investment platform that explains everything clearly. The AI insights are game-changing.',
      rating: 5
    }
  ];

  const plans = [
    {
      name: 'Starter',
      price: 'Free',
      period: 'forever',
      description: 'Perfect for beginners',
      features: [
        'Basic portfolio tracking',
        'AI recommendations',
        'Investment products access',
        'Mobile app access'
      ],
      popular: false
    },
    {
      name: 'Professional',
      price: '$9.99',
      period: '/month',
      description: 'For serious investors',
      features: [
        'Everything in Starter',
        'Advanced analytics',
        'Priority customer support',
        'Tax optimization tools',
        'Real-time alerts'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: '$29.99',
      period: '/month',
      description: 'For investment professionals',
      features: [
        'Everything in Professional',
        'White-label solutions',
        'API access',
        'Dedicated account manager',
        'Custom integrations'
      ],
      popular: false
    }
  ];

  const faqs = [
    {
      question: 'How does the AI-powered investment recommendation work?',
      answer: 'Our AI analyzes your risk profile, investment history, and market trends to suggest personalized investment opportunities that align with your financial goals.'
    },
    {
      question: 'Is my money and data secure with InvestPro?',
      answer: 'Yes, we use bank-grade encryption and security measures. Your investments are protected by FDIC insurance and we never store sensitive financial information.'
    },
    {
      question: 'What\'s the minimum amount needed to start investing?',
      answer: 'You can start investing with as little as $1. We believe investing should be accessible to everyone, regardless of their financial situation.'
    },
    {
      question: 'Can I cancel my subscription anytime?',
      answer: 'Absolutely! You can upgrade, downgrade, or cancel your subscription at any time. There are no long-term commitments or cancellation fees.'
    },
    {
      question: 'Do you offer customer support?',
      answer: 'Yes, we provide 24/7 customer support via chat, email, and phone. Professional and Enterprise users get priority support with faster response times.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-gradient">InvestPro</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/auth">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button variant="hero">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-muted/30 to-background">
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-20 left-10 w-16 h-16 bg-primary/10 rounded-full animate-bounce transition-all duration-1000 ${
            animateHero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`} style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
          <div className={`absolute top-40 right-20 w-12 h-12 bg-success/10 rounded-full animate-bounce transition-all duration-1000 ${
            animateHero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`} style={{ animationDelay: '0.5s', animationDuration: '4s' }}></div>
          <div className={`absolute bottom-20 left-20 w-10 h-10 bg-warning/10 rounded-full animate-bounce transition-all duration-1000 ${
            animateHero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`} style={{ animationDelay: '1s', animationDuration: '5s' }}></div>
          <div className={`absolute top-60 left-1/2 w-8 h-8 bg-error/10 rounded-full animate-bounce transition-all duration-1000 ${
            animateHero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`} style={{ animationDelay: '1.5s', animationDuration: '3.5s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
          <div className="text-center space-y-8">
            <Badge variant="secondary" className={`mx-auto transition-all duration-1000 ${
              animateHero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered Investment Platform
            </Badge>

            <h1 className={`text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight transition-all duration-1000 delay-300 ${
              animateHero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              Smart Investing with
              <span className="text-gradient block">AI Insights</span>
            </h1>

            <p className={`max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground transition-all duration-1000 delay-500 ${
              animateHero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              Build wealth intelligently with AI-powered recommendations, portfolio management,
              and real-time insights. Start your investment journey today.
            </p>

            <div className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-1000 delay-700 ${
              animateHero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              <Link to="/auth?mode=signup">
                <Button size="lg" variant="hero" className="w-full sm:w-auto shadow-glow hover:shadow-glow-intense transition-all">
                  Start Investing
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="w-full sm:w-auto hover:shadow-elegant transition-all">
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className={`flex flex-wrap justify-center items-center gap-4 sm:gap-6 mt-8 sm:mt-12 text-xs sm:text-sm text-muted-foreground transition-all duration-1000 delay-1000 ${
              animateHero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                <span>FDIC Insured</span>
              </div>
              <div className="flex items-center gap-1">
                <Award className="h-4 w-4" />
                <span>SEC Regulated</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>10,000+ Happy Investors</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="text-center shadow-card">
                  <CardContent className="p-6">
                    <Icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary">Features</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold">
              Everything you need to invest smart
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
              Our platform combines cutting-edge technology with financial expertise
              to help you make informed investment decisions.
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="shadow-card hover:shadow-elegant hover:scale-105 transition-all duration-300 group">
                  <CardHeader>
                    <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary">Testimonials</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold">
              What our investors say
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
              Join thousands of satisfied investors who have transformed their financial future with InvestPro.
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="shadow-card hover:shadow-elegant transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <Quote className="h-6 w-6 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-6 group-hover:text-foreground transition-colors">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{testimonial.avatar}</div>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary">Pricing</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold">
              Choose your investment plan
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
              Start free and upgrade as you grow. All plans include our core AI-powered features.
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan, index) => (
              <Card key={index} className={`shadow-card hover:shadow-elegant transition-all duration-300 relative ${
                plan.popular ? 'ring-2 ring-primary scale-105' : ''
              }`}>
                {plan.popular && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-success flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/auth?mode=signup" className="block">
                    <Button
                      variant={plan.popular ? 'hero' : 'outline'}
                      className="w-full mt-6"
                    >
                      Get Started
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary">FAQ</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Find answers to common questions about InvestPro and our investment platform.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="shadow-card">
                <CardContent className="p-0">
                  <button
                    className="w-full p-6 text-left flex justify-between items-center hover:bg-muted/50 transition-colors"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  >
                    <span className="font-semibold pr-4">{faq.question}</span>
                    {openFaq === index ? (
                      <Minus className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <Plus className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-6 text-muted-foreground">
                      {faq.answer}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary to-primary-light">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-6">
            Ready to start your investment journey?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8">
            Join thousands of smart investors who trust InvestPro for their financial growth.
          </p>
          <Link to="/auth?mode=signup">
            <Button size="lg" variant="secondary" className="shadow-glow">
              Create Free Account
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid gap-8 sm:gap-12 md:grid-cols-2 lg:grid-cols-4">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-gradient">InvestPro</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Empowering smart investors with AI-driven insights and portfolio management tools.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="p-2">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2">
                  <Linkedin className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2">
                  <Github className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/auth" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link to="/auth" className="hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link to="/auth" className="hover:text-foreground transition-colors">Security</Link></li>
                <li><Link to="/auth" className="hover:text-foreground transition-colors">Roadmap</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/auth" className="hover:text-foreground transition-colors">Help Center</Link></li>
                <li><Link to="/auth" className="hover:text-foreground transition-colors">Contact Us</Link></li>
                <li><Link to="/auth" className="hover:text-foreground transition-colors">Documentation</Link></li>
                <li><Link to="/auth" className="hover:text-foreground transition-colors">Status</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>hello@investpro.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>+1 (555) 123-4567</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>San Francisco, CA</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 InvestPro. All rights reserved. Built for smart investors worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
