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
    // Create a date object with today's date and the local time
    const today = new Date();
    const localTimeDate = new Date(`${today.toDateString()} ${localTime}`);
    
    // Convert to UTC by adding the timezone offset
    const utcTime = new Date(localTimeDate.getTime() - (localTimeDate.getTimezoneOffset() * 60000));
    
    // Return in HH:MM format
    return utcTime.toTimeString().slice(0, 5);
  };

  const convertUTCTimeToLocal = (utcTime: string): string => {
    // Create a date object with today's date and the UTC time
    const today = new Date();
    const utcTimeDate = new Date(`${today.toDateString()} ${utcTime} UTC`);
    
    // Convert to local time
    const localTime = new Date(utcTimeDate.getTime() + (utcTimeDate.getTimezoneOffset() * 60000));
    
    // Return in HH:MM format
    return localTime.toTimeString().slice(0, 5);
  };

  const addRule = () => {
    if (newRule.startTime && newRule.endTime && newRule.url) {
      // Convert local times to UTC for storage
      const startTimeUTC = convertLocalTimeToUTC(newRule.startTime);
      const endTimeUTC = convertLocalTimeToUTC(newRule.endTime);
      
      const rule: TimeRule = {
        id: Date.now().toString(),
        startTime: startTimeUTC, // Store in UTC
        endTime: endTimeUTC, // Store in UTC
        url: newRule.url,
        label: newRule.label || `${newRule.startTime} - ${newRule.endTime}` // Keep original local time in label
      };
      
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
    // Get current time in user's local timezone
    const now = new Date();
    const currentLocalTime = now.toTimeString().slice(0, 5); // HH:MM format
    
    // Convert current local time to UTC for comparison with stored rules
    const todayUTC = new Date();
    const localTimeDate = new Date(`${todayUTC.toDateString()} ${currentLocalTime}`);
    const utcTime = new Date(localTimeDate.getTime() - (localTimeDate.getTimezoneOffset() * 60000));
    const currentUTCTime = utcTime.toTimeString().slice(0, 5);
    
    for (const rule of rules) {
      // Rules are stored in UTC, so compare with UTC time
      if (currentUTCTime >= rule.startTime && currentUTCTime < rule.endTime) {
        return {
          isActive: true,
          activeRule: rule,
          nextUrl: rule.url
        };
      }
    }
    
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