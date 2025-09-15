'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePerformanceMetrics } from '@/hooks/use-performance';
import { PerformanceMetrics } from '@/lib/performance';
import { Activity, Clock, Zap, Database, Trash2 } from 'lucide-react';

interface PerformanceDashboardProps {
  className?: string;
}

export function PerformanceDashboard({ className }: PerformanceDashboardProps) {
  const { getMetrics, getMetricsByType, getAverageMetric, clearMetrics } = usePerformanceMetrics();
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [selectedType, setSelectedType] = useState<PerformanceMetrics['type'] | 'all'>('all');

  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(getMetrics());
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 1000);

    return () => clearInterval(interval);
  }, [getMetrics]);

  const filteredMetrics = selectedType === 'all' 
    ? metrics 
    : getMetricsByType(selectedType);

  const getTypeIcon = (type: PerformanceMetrics['type']) => {
    switch (type) {
      case 'render': return <Activity className="h-4 w-4" />;
      case 'api': return <Database className="h-4 w-4" />;
      case 'interaction': return <Zap className="h-4 w-4" />;
      case 'navigation': return <Clock className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: PerformanceMetrics['type']) => {
    switch (type) {
      case 'render': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'api': return 'bg-green-100 text-green-800 border-green-200';
      case 'interaction': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'navigation': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDurationColor = (duration: number, type: PerformanceMetrics['type']) => {
    const thresholds = {
      render: { warning: 50, danger: 100 },
      api: { warning: 500, danger: 1000 },
      interaction: { warning: 100, danger: 200 },
      navigation: { warning: 1000, danger: 2000 },
    };

    const threshold = thresholds[type];
    if (duration > threshold.danger) return 'text-red-600';
    if (duration > threshold.warning) return 'text-yellow-600';
    return 'text-green-600';
  };

  const formatDuration = (duration: number) => {
    if (duration < 1) return `${(duration * 1000).toFixed(0)}μs`;
    if (duration < 1000) return `${duration.toFixed(1)}ms`;
    return `${(duration / 1000).toFixed(2)}s`;
  };

  const getMetricSummary = () => {
    const types: PerformanceMetrics['type'][] = ['render', 'api', 'interaction', 'navigation'];
    return types.map(type => {
      const typeMetrics = getMetricsByType(type);
      const average = getAverageMetric(`${type}-average`);
      return {
        type,
        count: typeMetrics.length,
        average: average || (typeMetrics.length > 0 ? 
          typeMetrics.reduce((sum, m) => sum + m.duration, 0) / typeMetrics.length : 0),
      };
    });
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
            <Activity className="h-5 w-5" />
            Performance Dashboard
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => clearMetrics()}
              className="text-destructive hover:text-destructive/80"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {getMetricSummary().map(({ type, count, average }) => (
            <Card key={type} className="p-3">
              <div className="flex items-center gap-2 mb-2">
                {getTypeIcon(type)}
                <span className="text-sm font-medium capitalize text-foreground">{type}</span>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-foreground">{count}</div>
                <div className="text-xs text-muted-foreground">
                  Avg: {formatDuration(average)}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-medium text-foreground">Filter:</span>
          <Button
            variant={selectedType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedType('all')}
          >
            All ({metrics.length})
          </Button>
          {(['render', 'api', 'interaction', 'navigation'] as const).map(type => {
            const count = getMetricsByType(type).length;
            return (
              <Button
                key={type}
                variant={selectedType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType(type)}
                disabled={count === 0}
              >
                {type} ({count})
              </Button>
            );
          })}
        </div>

        {/* Metrics List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredMetrics.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No performance metrics recorded yet.
              <br />
              <span className="text-xs text-muted-foreground">Interact with the application to see metrics.</span>
            </div>
          ) : (
            filteredMetrics
              .slice(-50) // Show last 50 metrics
              .reverse()
              .map((metric, index) => (
                <div
                  key={`${metric.name}-${metric.timestamp}-${index}`}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Badge className={getTypeColor(metric.type)}>
                      {getTypeIcon(metric.type)}
                      <span className="ml-1 capitalize">{metric.type}</span>
                    </Badge>
                    <div>
                      <div className="font-medium text-sm text-foreground">{metric.name}</div>
                      {metric.metadata && Object.keys(metric.metadata).length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          {Object.entries(metric.metadata)
                            .slice(0, 2)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-mono text-sm ${getDurationColor(metric.duration, metric.type)}`}>
                      {formatDuration(metric.duration)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(metric.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </Card>
    </div>
  );
}