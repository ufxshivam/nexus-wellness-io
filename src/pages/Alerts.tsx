import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { alertsAPI, type Alert } from '@/services/api';
import { AlertTriangle, Clock, MapPin, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await alertsAPI.getAlerts();
      setAlerts(response.data);
    } catch (error) {
      toast({
        title: 'Error fetching alerts',
        description: 'Could not load alerts data',
        variant: 'destructive',
      });
      // Mock data for demo
      setAlerts([
        {
          id: '1',
          type: 'critical',
          severity: 'critical',
          message: 'Water pH level extremely low (4.2)',
          location: 'Riverside Village, District A',
          timestamp: new Date().toISOString(),
        },
        {
          id: '2',
          type: 'warning',
          severity: 'warning',
          message: 'High turbidity detected (85 NTU)',
          location: 'Mountain Springs, District B',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: '3',
          type: 'info',
          severity: 'info',
          message: 'System maintenance scheduled',
          location: 'Central Processing Unit',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-status-critical text-white';
      case 'warning':
        return 'bg-status-warning text-white';
      case 'info':
        return 'bg-status-info text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getSeverityIcon = (severity: Alert['severity']) => {
    return <AlertTriangle className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Active Alerts</h1>
          <p className="text-muted-foreground">
            Monitor and manage system alerts in real-time
          </p>
        </div>
        <Button
          onClick={fetchAlerts}
          disabled={loading}
          className="gap-2"
          variant="outline"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Alert Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-status-critical/10 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-status-critical" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-status-critical">
                  {alerts.filter(a => a.severity === 'critical').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-status-warning/10 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-status-warning" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Warning</p>
                <p className="text-2xl font-bold text-status-warning">
                  {alerts.filter(a => a.severity === 'warning').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-status-info/10 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-status-info" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Info</p>
                <p className="text-2xl font-bold text-status-info">
                  {alerts.filter(a => a.severity === 'info').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
          <CardDescription>
            Latest system alerts and notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <Badge className={cn("gap-1", getSeverityColor(alert.severity))}>
                      {getSeverityIcon(alert.severity)}
                      {alert.severity.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{alert.message}</p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {alert.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(alert.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}