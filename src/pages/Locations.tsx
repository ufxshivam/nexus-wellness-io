import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { locationsAPI, type Location } from '@/services/api';
import { MapPin, RefreshCw, Map, List } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Locations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'map' | 'table'>('map');
  const { toast } = useToast();

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await locationsAPI.getLocations();
      setLocations(response.data);
    } catch (error) {
      toast({
        title: 'Error fetching locations',
        description: 'Could not load locations data',
        variant: 'destructive',
      });
      // Mock data for demo
      setLocations([
        {
          id: '1',
          village: 'Riverside Village',
          district: 'District A',
          state: 'Maharashtra',
          latitude: 19.0760,
          longitude: 72.8777,
          status: 'active',
        },
        {
          id: '2',
          village: 'Mountain Springs',
          district: 'District B',
          state: 'Maharashtra',
          latitude: 19.1136,
          longitude: 72.8697,
          status: 'warning',
        },
        {
          id: '3',
          village: 'Valley View',
          district: 'District C',
          state: 'Maharashtra',
          latitude: 19.0896,
          longitude: 72.8656,
          status: 'inactive',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-status-success text-white';
      case 'warning':
        return 'bg-status-warning text-white';
      case 'inactive':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monitoring Locations</h1>
          <p className="text-muted-foreground">
            View and manage water quality monitoring stations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-border rounded-lg p-1">
            <Button
              variant={viewMode === 'map' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('map')}
              className="gap-2"
            >
              <Map className="h-4 w-4" />
              Map
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="gap-2"
            >
              <List className="h-4 w-4" />
              Table
            </Button>
          </div>
          <Button
            onClick={fetchLocations}
            disabled={loading}
            className="gap-2"
            variant="outline"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Location Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{locations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-status-success/10 rounded-lg">
                <MapPin className="h-6 w-6 text-status-success" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-status-success">
                  {locations.filter(l => l.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-status-warning/10 rounded-lg">
                <MapPin className="h-6 w-6 text-status-warning" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Warning</p>
                <p className="text-2xl font-bold text-status-warning">
                  {locations.filter(l => l.status === 'warning').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <MapPin className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inactive</p>
                <p className="text-2xl font-bold text-muted-foreground">
                  {locations.filter(l => l.status === 'inactive').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {viewMode === 'map' ? (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Location Map</CardTitle>
            <CardDescription>
              Interactive map showing all monitoring stations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96 rounded-lg overflow-hidden border border-border bg-muted/20 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Interactive map will be displayed here
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {locations.length} monitoring stations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Locations Table</CardTitle>
            <CardDescription>
              Detailed view of all monitoring stations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-medium">Village</th>
                    <th className="text-left p-4 font-medium">District</th>
                    <th className="text-left p-4 font-medium">State</th>
                    <th className="text-left p-4 font-medium">Coordinates</th>
                    <th className="text-left p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {locations.map((location) => (
                    <tr key={location.id} className="border-b border-border hover:bg-muted/50">
                      <td className="p-4 font-medium">{location.village}</td>
                      <td className="p-4">{location.district}</td>
                      <td className="p-4">{location.state}</td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                      </td>
                      <td className="p-4">
                        <Badge className={getStatusColor(location.status)}>
                          {location.status.toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}