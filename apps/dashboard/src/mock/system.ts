export interface SystemMetricRow {
  id: string;
  name: string;
  value: number;
  unit: string;
  updatedAt: string;
}

export let systemMetricsTable: SystemMetricRow[] = [
  { id: "cpu_usage", name: "CPU Utilization", value: 42.8, unit: "%", updatedAt: new Date().toISOString() },
  { id: "memory_usage", name: "Memory Utilization", value: 85.4, unit: "%", updatedAt: new Date().toISOString() },
  { id: "storage_usage", name: "Storage Utilization", value: 68.2, unit: "TB", updatedAt: new Date().toISOString() },
  { id: "bandwidth", name: "Network Bandwidth", value: 2.78, unit: "GB/s", updatedAt: new Date().toISOString() },
  { id: "latency", name: "Network Latency", value: 24, unit: "ms", updatedAt: new Date().toISOString() },
  { id: "kb_size", name: "Knowledge Base Size", value: 97.9, unit: "TB", updatedAt: new Date().toISOString() },
  { id: "health", name: "Overall Health", value: 98.7, unit: "%", updatedAt: new Date().toISOString() }
];

export function updateSystemMetric(id: string, value: number) {
  systemMetricsTable = systemMetricsTable.map(row => 
    row.id === id ? { ...row, value, updatedAt: new Date().toISOString() } : row
  );
}
