import type { ReportedValue } from '@/types';

const now = new Date();

function generateReportedValues(gatewayId: string, count: number, startOffset: number): ReportedValue[] {
  const records: ReportedValue[] = [];
  for (let i = 0; i < count; i++) {
    records.push({
      gatewayId,
      timestamp: new Date(now.getTime() - (startOffset + i * 30) * 1000),
      value: Math.round((Math.random() * 50 + 20) * 100) / 100,
      type: 'sensor_reading',
    });
  }
  return records;
}

export const mockReportedValues: Record<string, ReportedValue[]> = {
  'gw-001': generateReportedValues('gw-001', 20, 0),
  'gw-002': generateReportedValues('gw-002', 20, 0),
  'gw-003': generateReportedValues('gw-003', 15, 90),
  'gw-004': generateReportedValues('gw-004', 20, 0),
  'gw-005': generateReportedValues('gw-005', 5, 600),
  'gw-006': generateReportedValues('gw-006', 30, 0),
  'gw-007': generateReportedValues('gw-007', 20, 0),
  'gw-008': generateReportedValues('gw-008', 20, 0),
  'gw-009': generateReportedValues('gw-009', 12, 75),
  'gw-010': generateReportedValues('gw-010', 20, 0),
  'gw-011': generateReportedValues('gw-011', 8, 310),
};
