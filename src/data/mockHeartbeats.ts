import type { HeartbeatRecord } from '@/types';

const now = new Date();

function generateHeartbeats(gatewayId: string, count: number, startOffset: number): HeartbeatRecord[] {
  const records: HeartbeatRecord[] = [];
  for (let i = 0; i < count; i++) {
    const timestamp = new Date(now.getTime() - (startOffset + i * 30) * 1000);
    records.push({
      id: `hb-${gatewayId}-${i}`,
      gatewayId,
      timestamp,
      latency: Math.floor(Math.random() * 100) + 10,
      status: Math.random() > 0.1 ? 'success' : 'failed',
    });
  }
  return records;
}

export const mockHeartbeats: Record<string, HeartbeatRecord[]> = {
  'gw-001': generateHeartbeats('gw-001', 20, 0),
  'gw-002': generateHeartbeats('gw-002', 20, 0),
  'gw-003': generateHeartbeats('gw-003', 15, 90),
  'gw-004': generateHeartbeats('gw-004', 20, 0),
  'gw-005': generateHeartbeats('gw-005', 5, 600),
  'gw-006': generateHeartbeats('gw-006', 30, 0),
  'gw-007': generateHeartbeats('gw-007', 20, 0),
  'gw-008': generateHeartbeats('gw-008', 20, 0),
  'gw-009': generateHeartbeats('gw-009', 12, 75),
  'gw-010': generateHeartbeats('gw-010', 20, 0),
};
