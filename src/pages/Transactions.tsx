import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Navbar } from '@/components/layout/Navbar';
import { logsAPI } from '@/lib/api';
import { aiService } from '@/lib/ai';
import { 
  FileText,
  Brain,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  Filter,
  Download
} from 'lucide-react';
import type { TransactionLog } from '@/types';

export default function Transactions() {
  const [logs, setLogs] = useState<TransactionLog[]>([]);
  const [errorSummary, setErrorSummary] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await logsAPI.getUserLogs();
        setLogs(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch transaction logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const generateErrorSummary = async () => {
    setSummaryLoading(true);
    try {
      const summary = await aiService.summarizeErrors(logs);
      setErrorSummary(summary);
    } catch (error) {
      console.error('Failed to generate error summary:', error);
      setErrorSummary('Failed to generate AI summary. Please try again.');
    } finally {
      setSummaryLoading(false);
    }
  };

  const getStatusColor = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return 'bg-success text-success-foreground';
    if (statusCode >= 400 && statusCode < 500) return 'bg-warning text-warning-foreground';
    if (statusCode >= 500) return 'bg-error text-error-foreground';
    return 'bg-secondary text-secondary-foreground';
  };

  const getStatusIcon = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return CheckCircle;
    if (statusCode >= 400) return AlertTriangle;
    return Clock;
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'POST': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'PUT': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'DELETE': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const errorLogs = logs.filter(log => log.status_code >= 400);
  const successRate = logs.length > 0 ? ((logs.length - errorLogs.length) / logs.length * 100).toFixed(1) : '100';

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid gap-4 md:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded"></div>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Transaction Logs</h1>
          <p className="text-muted-foreground">
            Monitor your API activity and system interactions with AI-powered error analysis.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{logs.length}</div>
              <p className="text-xs text-muted-foreground">
                API calls recorded
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{successRate}%</div>
              <p className="text-xs text-muted-foreground">
                Successful requests
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Errors</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-error">{errorLogs.length}</div>
              <p className="text-xs text-muted-foreground">
                Failed requests
              </p>
            </CardContent>
          </Card>
        </div>

        {/* AI Error Summary */}
        {errorLogs.length > 0 && (
          <Card className="mb-8 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                AI Error Analysis
              </CardTitle>
              <CardDescription>
                AI-powered summary of error patterns and suggestions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {errorSummary ? (
                <Alert>
                  <Brain className="h-4 w-4" />
                  <AlertDescription className="whitespace-pre-wrap">
                    {errorSummary}
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="text-center py-6">
                  <Button 
                    onClick={generateErrorSummary} 
                    disabled={summaryLoading}
                    variant="investment"
                  >
                    {summaryLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing Errors...
                      </>
                    ) : (
                      <>
                        <Brain className="mr-2 h-4 w-4" />
                        Generate AI Error Summary
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Logs Table */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Detailed log of all API requests and responses
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-2">No logs available</h3>
                <p className="text-muted-foreground">
                  Transaction logs will appear here as you use the platform.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {logs.slice(0, 50).map((log) => {
                  const StatusIcon = getStatusIcon(log.status_code);
                  return (
                    <div 
                      key={log.id} 
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <StatusIcon 
                          className={`h-5 w-5 ${
                            log.status_code >= 400 ? 'text-error' : 'text-success'
                          }`} 
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge className={getMethodColor(log.http_method)}>
                              {log.http_method}
                            </Badge>
                            <span className="font-mono text-sm">{log.endpoint}</span>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {new Date(log.created_at).toLocaleString()}
                            {log.email && ` • ${log.email}`}
                          </div>
                          {log.error_message && (
                            <div className="text-sm text-error mt-1 max-w-md truncate">
                              {log.error_message}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(log.status_code)}>
                          {log.status_code}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
                
                {logs.length > 50 && (
                  <div className="text-center py-4">
                    <Button variant="outline">
                      Load More Logs
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}