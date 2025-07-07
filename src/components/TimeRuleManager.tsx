import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Clock, ExternalLink } from 'lucide-react';

export interface TimeRule {
  id: string;
  startTime: string;
  endTime: string;
  url: string;
  label?: string;
}

interface TimeRuleManagerProps {
  rules: TimeRule[];
  onRulesChange: (rules: TimeRule[]) => void;
  defaultUrl: string;
}

const TimeRuleManager: React.FC<TimeRuleManagerProps> = ({
  rules,
  onRulesChange,
  defaultUrl
}) => {
  const [newRule, setNewRule] = useState<Partial<TimeRule>>({
    startTime: '',
    endTime: '',
    url: '',
    label: ''
  });

  const convertLocalTimeToUTC = (localTime: string): string => {
    // Parse the time components
    const [hours, minutes] = localTime.split(':').map(Number);
    
    // Create a date in local time
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    
    // Get UTC hours and minutes
    const utcHours = date.getUTCHours();
    const utcMinutes = date.getUTCMinutes();
    
    // Return in HH:MM format
    return `${utcHours.toString().padStart(2, '0')}:${utcMinutes.toString().padStart(2, '0')}`;
  };

  const convertUTCTimeToLocal = (utcTime: string): string => {
    // Parse the time components
    const [hours, minutes] = utcTime.split(':').map(Number);
    
    // Create a date in UTC
    const date = new Date();
    date.setUTCHours(hours, minutes, 0, 0);
    
    // Get local hours and minutes
    const localHours = date.getHours();
    const localMinutes = date.getMinutes();
    
    // Return in HH:MM format
    return `${localHours.toString().padStart(2, '0')}:${localMinutes.toString().padStart(2, '0')}`;
  };

  const addRule = () => {
    if (newRule.startTime && newRule.endTime && newRule.url) {
      console.log('=== ADDING TIME RULE ===');
      console.log('Local start time:', newRule.startTime);
      console.log('Local end time:', newRule.endTime);
      
      // Convert local times to UTC for storage
      const startTimeUTC = convertLocalTimeToUTC(newRule.startTime);
      const endTimeUTC = convertLocalTimeToUTC(newRule.endTime);
      
      console.log('UTC start time:', startTimeUTC);
      console.log('UTC end time:', endTimeUTC);
      console.log('URL:', newRule.url);
      
      const rule: TimeRule = {
        id: Date.now().toString(),
        startTime: startTimeUTC, // Store in UTC
        endTime: endTimeUTC, // Store in UTC
        url: newRule.url,
        label: newRule.label || `${newRule.startTime} - ${newRule.endTime}` // Keep original local time in label
      };
      
      console.log('Complete rule object:', rule);
      
      onRulesChange([...rules, rule]);
      setNewRule({
        startTime: '',
        endTime: '',
        url: '',
        label: ''
      });
    }
  };

  const removeRule = (id: string) => {
    onRulesChange(rules.filter(rule => rule.id !== id));
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getCurrentTimeStatus = () => {
    // Get current time in UTC for comparison with stored rules
    const now = new Date();
    const currentUTCHours = now.getUTCHours();
    const currentUTCMinutes = now.getUTCMinutes();
    const currentUTCTime = `${currentUTCHours.toString().padStart(2, '0')}:${currentUTCMinutes.toString().padStart(2, '0')}`;
    
    console.log('=== TIME RULE STATUS CHECK ===');
    console.log('Current UTC time:', currentUTCTime);
    console.log('Current local time:', now.toTimeString().slice(0, 5));
    console.log('Number of rules:', rules.length);
    
    for (const rule of rules) {
      console.log('Checking rule:', rule);
      console.log(`Rule time range: ${rule.startTime} - ${rule.endTime}`);
      
      // Rules are stored in UTC, so compare with UTC time
      // Handle rules that cross midnight
      if (rule.startTime > rule.endTime) {
        // Rule crosses midnight (e.g., 21:00 - 01:00)
        const matches = currentUTCTime >= rule.startTime || currentUTCTime < rule.endTime;
        console.log('Midnight crossover rule, matches:', matches);
        if (matches) {
          console.log('✓ Active rule found:', rule.label);
          return {
            isActive: true,
            activeRule: rule,
            nextUrl: rule.url
          };
        }
      } else {
        // Normal rule (e.g., 09:00 - 17:00)
        const matches = currentUTCTime >= rule.startTime && currentUTCTime < rule.endTime;
        console.log('Normal rule, matches:', matches);
        if (matches) {
          console.log('✓ Active rule found:', rule.label);
          return {
            isActive: true,
            activeRule: rule,
            nextUrl: rule.url
          };
        }
      }
    }
    
    console.log('No active rules, using default URL');
    return {
      isActive: false,
      activeRule: null,
      nextUrl: defaultUrl
    };
  };

  const timeStatus = getCurrentTimeStatus();

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Clock className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-bold uppercase">Time-Aware QR Code</h3>
        </div>
        <p className="text-muted-foreground">
          Set different URLs for different times of day
        </p>
      </div>

      {/* Current Status */}
      <Card className="brutal-card p-4 bg-secondary/50">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="font-bold">Current Status</span>
          </div>
          <div className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            <span className="text-sm font-mono break-all">
              {timeStatus.nextUrl}
            </span>
          </div>
          {timeStatus.isActive && timeStatus.activeRule && (
            <p className="text-sm text-green-600 font-medium">
              ✓ Active rule: {timeStatus.activeRule.label}
            </p>
          )}
          {!timeStatus.isActive && (
            <p className="text-sm text-muted-foreground">
              Using default URL (no active time rules)
            </p>
          )}
        </div>
      </Card>

      {/* Existing Rules */}
      {rules.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-bold uppercase">Time Rules</h4>
          {rules.map((rule) => (
            <Card key={rule.id} className="brutal-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span className="font-bold">
                      {formatTime(convertUTCTimeToLocal(rule.startTime))} - {formatTime(convertUTCTimeToLocal(rule.endTime))}
                    </span>
                    <span className="text-xs text-muted-foreground">(Local Time)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    <span className="text-sm font-mono break-all">
                      {rule.url}
                    </span>
                  </div>
                  {rule.label && rule.label !== `${rule.startTime} - ${rule.endTime}` && (
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
            <h4 className="font-bold uppercase">Add Time Rule</h4>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={newRule.startTime}
                onChange={(e) => setNewRule({ ...newRule, startTime: e.target.value })}
                className="brutal-input"
              />
            </div>
            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={newRule.endTime}
                onChange={(e) => setNewRule({ ...newRule, endTime: e.target.value })}
                className="brutal-input"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="ruleUrl">Redirect URL</Label>
            <Input
              id="ruleUrl"
              type="url"
              placeholder="https://example.com"
              value={newRule.url}
              onChange={(e) => setNewRule({ ...newRule, url: e.target.value })}
              className="brutal-input"
            />
          </div>

          <div>
            <Label htmlFor="ruleLabel">Label (optional)</Label>
            <Input
              id="ruleLabel"
              placeholder="e.g., Business Hours, Night Mode"
              value={newRule.label}
              onChange={(e) => setNewRule({ ...newRule, label: e.target.value })}
              className="brutal-input"
            />
          </div>

          <Button
            onClick={addRule}
            disabled={!newRule.startTime || !newRule.endTime || !newRule.url}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Rule
          </Button>
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
            Used when no time rules are active
          </p>
          <p className="text-sm font-mono break-all">
            {defaultUrl}
          </p>
        </div>
      </Card>
    </div>
  );
};

export default TimeRuleManager;