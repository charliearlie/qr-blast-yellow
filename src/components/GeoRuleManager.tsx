import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, Plus, MapPin, ExternalLink, Search, Map, Loader2 } from 'lucide-react';

export interface GeoRule {
  id: string;
  type: 'radius';
  lat: number;
  lon: number;
  radius_km: number;
  url: string;
  label?: string;
  address?: string; // Human-readable address
}

interface AddressSearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

interface GeoRuleManagerProps {
  rules: GeoRule[];
  onRulesChange: (rules: GeoRule[]) => void;
  defaultUrl: string;
}

const GeoRuleManager: React.FC<GeoRuleManagerProps> = ({
  rules,
  onRulesChange,
  defaultUrl
}) => {
  const [newRule, setNewRule] = useState<Partial<GeoRule>>({
    type: 'radius',
    lat: 0,
    lon: 0,
    radius_km: 10,
    url: '',
    label: '',
    address: ''
  });

  const [addressSearch, setAddressSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<AddressSearchResult[]>([]);

  const searchAddress = async () => {
    if (!addressSearch.trim()) return;
    
    setIsSearching(true);
    try {
      // Using Nominatim (OpenStreetMap) geocoding service
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressSearch)}&limit=5`
      );
      const results = await response.json();
      setSearchResults(results);
    } catch (error) {
      console.error('Address search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const selectAddress = (result: AddressSearchResult) => {
    setNewRule({
      ...newRule,
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
      address: result.display_name,
      label: newRule.label || result.display_name.split(',')[0] // Use first part as label
    });
    setSearchResults([]);
    setAddressSearch('');
  };

  const addRule = () => {
    if (newRule.lat !== undefined && newRule.lon !== undefined && newRule.radius_km && newRule.url) {
      const rule: GeoRule = {
        id: Date.now().toString(),
        type: 'radius',
        lat: newRule.lat,
        lon: newRule.lon,
        radius_km: newRule.radius_km,
        url: newRule.url,
        label: newRule.label || `Within ${newRule.radius_km}km of ${newRule.address || `${newRule.lat.toFixed(4)}, ${newRule.lon.toFixed(4)}`}`,
        address: newRule.address
      };
      
      onRulesChange([...rules, rule]);
      setNewRule({
        type: 'radius',
        lat: 0,
        lon: 0,
        radius_km: 10,
        url: '',
        label: '',
        address: ''
      });
    }
  };

  const removeRule = (id: string) => {
    onRulesChange(rules.filter(rule => rule.id !== id));
  };

  const getCurrentLocationStatus = () => {
    // For now, we'll show a simple status
    // In a full implementation, this could show if any rules would be active
    // based on the user's current location (with permission)
    return {
      hasRules: rules.length > 0,
      nextUrl: defaultUrl
    };
  };

  const locationStatus = getCurrentLocationStatus();

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <MapPin className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-bold uppercase">Geo-Fenced QR Code</h3>
        </div>
        <p className="text-muted-foreground">
          Set different URLs for different locations
        </p>
      </div>

      {/* Current Status */}
      <Card className="brutal-card p-4 bg-secondary/50">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span className="font-bold">Current Status</span>
          </div>
          <div className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            <span className="text-sm font-mono break-all">
              {locationStatus.nextUrl}
            </span>
          </div>
          {locationStatus.hasRules ? (
            <p className="text-sm text-blue-600 font-medium">
              ✓ {rules.length} geo-rule{rules.length !== 1 ? 's' : ''} configured
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Using default URL (no geo-rules configured)
            </p>
          )}
        </div>
      </Card>

      {/* Existing Rules */}
      {rules.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-bold uppercase">Geo Rules</h4>
          {rules.map((rule) => (
            <Card key={rule.id} className="brutal-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span className="font-bold">
                      Within {rule.radius_km}km of {rule.address || `${rule.lat.toFixed(4)}, ${rule.lon.toFixed(4)}`}
                    </span>
                  </div>
                  {rule.address && (
                    <div className="text-xs text-muted-foreground">
                      Coordinates: {rule.lat.toFixed(4)}, {rule.lon.toFixed(4)}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    <span className="text-sm font-mono break-all">
                      {rule.url}
                    </span>
                  </div>
                  {rule.label && (
                    <p className="text-sm text-muted-foreground">
                      {rule.label}
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeRule(rule.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add New Rule */}
      <Card className="brutal-card p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <h4 className="font-bold uppercase">Add Geo Rule</h4>
          </div>
          
          <Tabs defaultValue="search" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="search" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Search Address
              </TabsTrigger>
              <TabsTrigger value="coordinates" className="flex items-center gap-2">
                <Map className="w-4 h-4" />
                Manual Coordinates
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="search" className="space-y-4">
              <div>
                <Label htmlFor="addressSearch">Search for an address</Label>
                <div className="flex gap-2">
                  <Input
                    id="addressSearch"
                    placeholder="e.g., Times Square, New York"
                    value={addressSearch}
                    onChange={(e) => setAddressSearch(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchAddress()}
                    className="brutal-input flex-1"
                  />
                  <Button 
                    onClick={searchAddress} 
                    disabled={!addressSearch.trim() || isSearching}
                    variant="outline"
                  >
                    {isSearching ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <Label>Search Results</Label>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {searchResults.map((result, index) => (
                      <Card 
                        key={index}
                        className="p-3 cursor-pointer hover:bg-secondary/50 transition-colors"
                        onClick={() => selectAddress(result)}
                      >
                        <div className="text-sm font-medium">{result.display_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {parseFloat(result.lat).toFixed(4)}, {parseFloat(result.lon).toFixed(4)}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {newRule.address && (
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <div className="text-sm font-medium text-green-800">Selected Location:</div>
                  <div className="text-sm text-green-700">{newRule.address}</div>
                  <div className="text-xs text-green-600">
                    {newRule.lat?.toFixed(4)}, {newRule.lon?.toFixed(4)}
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="coordinates" className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="0.0001"
                    placeholder="40.7128"
                    value={newRule.lat || ''}
                    onChange={(e) => setNewRule({ ...newRule, lat: parseFloat(e.target.value) || 0 })}
                    className="brutal-input"
                  />
                </div>
                <div>
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="0.0001"
                    placeholder="-74.0060"
                    value={newRule.lon || ''}
                    onChange={(e) => setNewRule({ ...newRule, lon: parseFloat(e.target.value) || 0 })}
                    className="brutal-input"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div>
            <Label htmlFor="radius">Radius (km)</Label>
            <Input
              id="radius"
              type="number"
              step="0.1"
              min="0.1"
              placeholder="10"
              value={newRule.radius_km || ''}
              onChange={(e) => setNewRule({ ...newRule, radius_km: parseFloat(e.target.value) || 0 })}
              className="brutal-input"
            />
          </div>

          <div>
            <Label htmlFor="geoUrl">Redirect URL</Label>
            <Input
              id="geoUrl"
              type="url"
              placeholder="https://example.com"
              value={newRule.url || ''}
              onChange={(e) => setNewRule({ ...newRule, url: e.target.value })}
              className="brutal-input"
            />
          </div>

          <div>
            <Label htmlFor="geoLabel">Label (optional)</Label>
            <Input
              id="geoLabel"
              placeholder="e.g., NYC Office, London Store"
              value={newRule.label || ''}
              onChange={(e) => setNewRule({ ...newRule, label: e.target.value })}
              className="brutal-input"
            />
          </div>

          <Button
            onClick={addRule}
            disabled={!newRule.lat || !newRule.lon || !newRule.radius_km || !newRule.url}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Rule
          </Button>
        </div>
      </Card>

      {/* Location Examples */}
      <Card className="brutal-card p-4 bg-blue-50 border-blue-200">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-blue-800">Common Locations</span>
          </div>
          <div className="text-xs text-blue-700 space-y-1">
            <p><strong>New York:</strong> 40.7128, -74.0060</p>
            <p><strong>London:</strong> 51.5074, -0.1278</p>
            <p><strong>Tokyo:</strong> 35.6762, 139.6503</p>
            <p><strong>Sydney:</strong> -33.8688, 151.2093</p>
          </div>
        </div>
      </Card>

      {/* Default URL Info */}
      <Card className="brutal-card p-4 bg-secondary/20">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            <span className="font-bold">Default URL</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Used when no geo-rules match the scanner's location
          </p>
          <p className="text-sm font-mono break-all">
            {defaultUrl}
          </p>
        </div>
      </Card>
    </div>
  );
};

export default GeoRuleManager;