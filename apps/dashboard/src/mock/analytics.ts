export interface ChartDataPoint {
  timestamp: string;
  cpu: number;
  memory: number;
  latency: number;
  bandwidth: number;
}

export let analyticsTable: ChartDataPoint[] = [];

// Populate last 30 intervals of system status history
const now = Date.now();
for (let i = 30; i > 0; i--) {
  analyticsTable.push({
    timestamp: new Date(now - i * 3000).toISOString(),
    cpu: 38 + Math.random() * 12,
    memory: 82 + Math.random() * 5,
    latency: 18 + Math.floor(Math.random() * 12),
    bandwidth: 2.4 + Math.random() * 0.6
  });
}

export function appendAnalyticsPoint(point: ChartDataPoint) {
  analyticsTable.push(point);
  if (analyticsTable.length > 60) {
    analyticsTable.shift();
  }
}
