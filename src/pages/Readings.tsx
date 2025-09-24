import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { readingsAPI, type Reading } from '@/services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { RefreshCw, Droplets, Activity, Thermometer } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Readings() {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('24h');
  const { toast } = useToast();

  const fetchReadings = async () => {
    try {
      setLoading(true);
      const response = await readingsAPI.getReadings();
      setReadings(response.data);
    } catch (error) {
      toast({
        title: 'Error fetching readings',
        description: 'Could not load sensor readings',
        variant: 'destructive',
      });
      
      // Mock data for demo
      const now = new Date();
      const mockReadings: Reading[] = [];
      
      for (let i = 0; i < 24; i++) {
        const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
        mockReadings.push({
          id: `reading-${i}`,
          location: i % 3 === 0 ? 'Riverside Village' : i % 3 === 1 ? 'Mountain Springs' : 'Valley View',
          ph: 6.5 + Math.random() * 2,
          turbidity: 20 + Math.random() * 60,
          temperature: 22 + Math.random() * 8,
          timestamp: timestamp.toISOString(),
        });
      }
      
      setReadings(mockReadings.reverse());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadings();
  }, []);

  // Filter readings based on selected location
  const filteredReadings = selectedLocation === 'all' 
    ? readings 
    : readings.filter(reading => reading.location === selectedLocation);

  // Prepare chart data
  const chartData = filteredReadings.map(reading => ({
    time: new Date(reading.timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    pH: Number(reading.ph.toFixed(2)),
    turbidity: Number(reading.turbidity.toFixed(1)),
    temperature: Number(reading.temperature.toFixed(1)),
  }));

  // Calculate current averages
  const currentAverages = filteredReadings.length > 0 ? {
    ph: filteredReadings.reduce((sum, r) => sum + r.ph, 0) / filteredReadings.length,
    turbidity: filteredReadings.reduce((sum, r) => sum + r.turbidity, 0) / filteredReadings.length,
    temperature: filteredReadings.reduce((sum, r) => sum + r.temperature, 0) / filteredReadings.length,
  } : { ph: 0, turbidity: 0, temperature: 0 };

  const locations = [...new Set(readings.map(r => r.location))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sensor Readings</h1>
          <p className="text-muted-foreground">
            Real-time water quality measurements and trends
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map(location => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={fetchReadings}
            disabled={loading}
            className="gap-2"
            variant="outline"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Current Readings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Droplets className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average pH</p>
                <p className="text-2xl font-bold">{currentAverages.ph.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Normal: 6.5-8.5</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary/10 rounded-lg">
                <Activity className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Turbidity</p>
                <p className="text-2xl font-bold">{currentAverages.turbidity.toFixed(1)} NTU</p>
                <p className="text-xs text-muted-foreground">Safe: &lt;5 NTU</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent/10 rounded-lg">
                <Thermometer className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Temperature</p>
                <p className="text-2xl font-bold">{currentAverages.temperature.toFixed(1)}°C</p>
                <p className="text-xs text-muted-foreground">Normal: 20-30°C</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* pH Trend Chart */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>pH Level Trends</CardTitle>
          <CardDescription>
            Water pH measurements over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="phGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="time" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  domain={[4, 10]}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="pH" 
                  stroke="hsl(var(--primary))" 
                  fillOpacity={1}
                  fill="url(#phGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Turbidity Chart */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Turbidity Measurements</CardTitle>
          <CardDescription>
            Water clarity measurements in NTU (Nephelometric Turbidity Units)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="time" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="turbidity" 
                  stroke="hsl(var(--secondary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--secondary))', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Combined Trends */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Multi-Parameter Trends</CardTitle>
          <CardDescription>
            Combined view of pH, turbidity, and temperature measurements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="time" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="pH" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="pH Level"
                />
                <Line 
                  type="monotone" 
                  dataKey="turbidity" 
                  stroke="hsl(var(--secondary))" 
                  strokeWidth={2}
                  name="Turbidity (NTU)"
                />
                <Line 
                  type="monotone" 
                  dataKey="temperature" 
                  stroke="hsl(var(--accent))" 
                  strokeWidth={2}
                  name="Temperature (°C)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}