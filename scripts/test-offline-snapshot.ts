import { useGatewayStore } from '../src/store/gatewayStore';
import { OFFLINE_THRESHOLD, TIMEOUT_THRESHOLD, calculateGatewayStatus } from '../src/utils/statusUtils';
import { mockGateways } from '../src/data/mockGateways';

function log(message: string, type: 'info' | 'success' | 'error' | 'test' = 'info') {
  const colors: Record<string, string> = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    test: '\x1b[33m',
    reset: '\x1b[0m',
  };
  console.log(`${colors[type]}${message}${colors.reset}`);
}

function debugStore(store: ReturnType<typeof useGatewayStore.getState>) {
  log('  调试：网关状态列表', 'info');
  store.gateways.forEach((gw) => {
    const hasAlerts = gw.alerts.some((a) => !a.resolved);
    const actualStatus = calculateGatewayStatus(gw.lastHeartbeat, hasAlerts);
    const timeSince = Math.floor((Date.now() - gw.lastHeartbeat.getTime()) / 1000);
    const hasSnapshot = !!store.getSnapshotByGatewayId(gw.id);
    log(`    ${gw.id} ${gw.code} status=${gw.status} actual=${actualStatus} timeSince=${timeSince}s hasSnapshot=${hasSnapshot}`, 'info');
  });
}

function runTests() {
  log('========================================', 'test');
  log('  离线快照功能验证测试', 'test');
  log('========================================', 'test');
  console.log();

  let store = useGatewayStore.getState();
  log(`调用 loadGateways 前 gateways 长度: ${store.gateways.length}`, 'info');
  log(`mockGateways 长度: ${mockGateways.length}`, 'info');
  mockGateways.forEach((gw) => {
    log(`  mock: ${gw.id} ${gw.code} lastHeartbeat=${gw.lastHeartbeat.toISOString()}`, 'info');
  });

  store.loadGateways();
  store = useGatewayStore.getState();

  log(`调用 loadGateways 后 gateways 长度: ${store.gateways.length}`, 'info');
  log('加载完成后网关状态：', 'info');
  debugStore(store);
  console.log();

  const testResults: { name: string; passed: boolean; message: string }[] = [];

  log('【测试1】在线网关无法生成离线快照', 'test');
  log('----------------------------------------', 'test');
  {
    const onlineGateway = store.gateways.find((g) => {
      const hasAlerts = g.alerts.some((a) => !a.resolved);
      const actualStatus = calculateGatewayStatus(g.lastHeartbeat, hasAlerts);
      return actualStatus === 'online';
    });

    if (!onlineGateway) {
      testResults.push({ name: '测试1', passed: false, message: '未找到在线网关' });
      log('✗ 未找到在线网关', 'error');
    } else {
      log(`目标网关: ${onlineGateway.name} (${onlineGateway.code})`, 'info');
      const hasAlerts = onlineGateway.alerts.some((a) => !a.resolved);
      const actualStatus = calculateGatewayStatus(onlineGateway.lastHeartbeat, hasAlerts);
      log(`实际状态: ${actualStatus}`, 'info');
      log(`最后心跳: ${onlineGateway.lastHeartbeat.toLocaleString()}`, 'info');

      const result = store.generateOfflineSnapshot(onlineGateway.id);
      log(`生成结果: success=${result.success}, message="${result.message}"`, 'info');

      const hasSnapshot = !!store.getSnapshotByGatewayId(onlineGateway.id);
      log(`快照是否存在: ${hasSnapshot}`, 'info');

      const passed = !result.success && !hasSnapshot;
      testResults.push({
        name: '测试1',
        passed,
        message: passed ? '在线网关正确拒绝生成快照' : '在线网关不应生成快照',
      });
      log(passed ? '✓ 测试通过：在线网关无法生成快照' : '✗ 测试失败：在线网关不应生成快照', passed ? 'success' : 'error');
    }
  }
  console.log();

  log('【测试2】把一个在线网关推进超时状态', 'test');
  log('----------------------------------------', 'test');
  {
    const onlineGateway = store.gateways.find((g) => {
      const hasAlerts = g.alerts.some((a) => !a.resolved);
      const actualStatus = calculateGatewayStatus(g.lastHeartbeat, hasAlerts);
      return actualStatus === 'online' && g.id !== 'gw-001';
    });

    if (!onlineGateway) {
      testResults.push({ name: '测试2', passed: false, message: '未找到可用在线网关' });
      log('✗ 未找到可用在线网关', 'error');
    } else {
      const gatewayId = onlineGateway.id;
      log(`目标网关: ${onlineGateway.name} (${onlineGateway.code})`, 'info');
      const hasAlerts = onlineGateway.alerts.some((a) => !a.resolved);
      const initialStatus = calculateGatewayStatus(onlineGateway.lastHeartbeat, hasAlerts);
      log(`初始状态: ${initialStatus}`, 'info');
      log(`初始最后心跳: ${onlineGateway.lastHeartbeat.toLocaleString()}`, 'info');

      const forceResult = store.forceGatewayTimeout(gatewayId);
      store = useGatewayStore.getState();
      log(`强制超时结果: success=${forceResult.success}, message="${forceResult.message}"`, 'info');

      const updatedGateway = store.gateways.find((g) => g.id === gatewayId)!;
      const timeSinceHeartbeat = Date.now() - updatedGateway.lastHeartbeat.getTime();
      const updatedHasAlerts = updatedGateway.alerts.some((a) => !a.resolved);
      const updatedStatus = calculateGatewayStatus(updatedGateway.lastHeartbeat, updatedHasAlerts);
      log(`更新后状态: ${updatedGateway.status} (实际: ${updatedStatus})`, 'info');
      log(`更新后最后心跳: ${updatedGateway.lastHeartbeat.toLocaleString()}`, 'info');
      log(`距现在: ${Math.floor(timeSinceHeartbeat / 1000)} 秒`, 'info');
      log(`超时阈值: ${TIMEOUT_THRESHOLD / 1000} 秒`, 'info');
      log(`离线阈值: ${OFFLINE_THRESHOLD / 1000} 秒`, 'info');

      const passed =
        forceResult.success &&
        updatedGateway.status === 'timeout' &&
        updatedStatus === 'timeout' &&
        timeSinceHeartbeat > TIMEOUT_THRESHOLD &&
        timeSinceHeartbeat < OFFLINE_THRESHOLD;

      testResults.push({
        name: '测试2',
        passed,
        message: passed ? '网关成功进入超时状态' : '网关未能正确进入超时状态',
      });
      log(passed ? '✓ 测试通过：网关已进入超时状态' : '✗ 测试失败：网关未能正确进入超时状态', passed ? 'success' : 'error');
    }
  }
  console.log();

  log('【测试3】超时网关（未到离线阈值）无法生成快照', 'test');
  log('----------------------------------------', 'test');
  {
    const timeoutGateway = store.gateways.find((g) => {
      const hasAlerts = g.alerts.some((a) => !a.resolved);
      const actualStatus = calculateGatewayStatus(g.lastHeartbeat, hasAlerts);
      const timeSince = Date.now() - g.lastHeartbeat.getTime();
      return actualStatus === 'timeout' && timeSince < OFFLINE_THRESHOLD;
    });

    if (!timeoutGateway) {
      testResults.push({ name: '测试3', passed: false, message: '未找到符合条件的超时网关' });
      log('✗ 未找到符合条件的超时网关', 'error');
      debugStore(store);
    } else {
      log(`目标网关: ${timeoutGateway.name} (${timeoutGateway.code})`, 'info');
      const timeSinceHeartbeat = Date.now() - timeoutGateway.lastHeartbeat.getTime();
      log(`距最后心跳: ${Math.floor(timeSinceHeartbeat / 1000)} 秒`, 'info');
      log(`离线阈值: ${OFFLINE_THRESHOLD / 1000} 秒`, 'info');

      const result = store.generateOfflineSnapshot(timeoutGateway.id);
      log(`生成结果: success=${result.success}, message="${result.message}"`, 'info');

      const hasSnapshot = !!store.getSnapshotByGatewayId(timeoutGateway.id);
      log(`快照是否存在: ${hasSnapshot}`, 'info');

      const passed = !result.success && !hasSnapshot;
      testResults.push({
        name: '测试3',
        passed,
        message: passed ? '超时网关正确拒绝生成快照' : '超时网关不应生成快照',
      });
      log(passed ? '✓ 测试通过：超时网关无法生成快照' : '✗ 测试失败：超时网关不应生成快照', passed ? 'success' : 'error');
    }
  }
  console.log();

  log('【测试4】把网关推进离线状态（超过5分钟）', 'test');
  log('----------------------------------------', 'test');
  {
    const testGatewayId = 'gw-011';
    const originalGateway = mockGateways.find((g) => g.id === testGatewayId);
    if (!originalGateway) {
      testResults.push({ name: '测试4', passed: false, message: '未找到测试网关 gw-011' });
      log('✗ 未找到测试网关 gw-011', 'error');
    } else {
      useGatewayStore.setState((state) => {
        const newSnapshots = { ...state.offlineSnapshots };
        delete newSnapshots[testGatewayId];
        return {
          offlineSnapshots: newSnapshots,
          gateways: state.gateways.map((gw) =>
            gw.id === testGatewayId
              ? {
                  ...gw,
                  lastHeartbeat: new Date(Date.now() - OFFLINE_THRESHOLD - 10000),
                  status: 'timeout',
                }
              : gw
          ),
        };
      });
      store = useGatewayStore.getState();

      const updatedGateway = store.gateways.find((g) => g.id === testGatewayId);
      if (!updatedGateway) {
        testResults.push({ name: '测试4', passed: false, message: '更新后未找到网关 gw-011' });
        log('✗ 更新后未找到网关 gw-011', 'error');
        debugStore(store);
      } else {
        const timeSinceHeartbeat = Date.now() - updatedGateway.lastHeartbeat.getTime();
        log(`目标网关: ${updatedGateway.name} (${updatedGateway.code})`, 'info');
        log(`更新后最后心跳: ${updatedGateway.lastHeartbeat.toLocaleString()}`, 'info');
        log(`距现在: ${Math.floor(timeSinceHeartbeat / 1000)} 秒`, 'info');
        log(`离线阈值: ${OFFLINE_THRESHOLD / 1000} 秒`, 'info');

        const hasAlerts = updatedGateway.alerts.some((a) => !a.resolved);
        const actualStatus = calculateGatewayStatus(updatedGateway.lastHeartbeat, hasAlerts);
        log(`实际状态: ${actualStatus}`, 'info');

        const passed =
          timeSinceHeartbeat > OFFLINE_THRESHOLD && actualStatus === 'offline';
        testResults.push({
          name: '测试4',
          passed,
          message: passed ? '网关成功进入离线状态' : '网关未能正确进入离线状态',
        });
        log(passed ? '✓ 测试通过：网关已进入离线状态' : '✗ 测试失败：网关未能正确进入离线状态', passed ? 'success' : 'error');
      }
    }
  }
  console.log();

  log('【测试5】离线网关可以生成快照', 'test');
  log('----------------------------------------', 'test');
  {
    const testGatewayId = 'gw-011';
    const offlineGateway = store.gateways.find((g) => g.id === testGatewayId);
    if (!offlineGateway) {
      testResults.push({ name: '测试5', passed: false, message: '未找到测试网关' });
      log('✗ 未找到测试网关', 'error');
    } else {
      if (store.getSnapshotByGatewayId(testGatewayId)) {
        log('快照已存在，先删除...', 'info');
        useGatewayStore.setState((state) => {
          const newSnapshots = { ...state.offlineSnapshots };
          delete newSnapshots[testGatewayId];
          return { offlineSnapshots: newSnapshots };
        });
        store = useGatewayStore.getState();
      }

      log(`目标网关: ${offlineGateway.name} (${offlineGateway.code})`, 'info');
      const hasAlerts = offlineGateway.alerts.some((a) => !a.resolved);
      const actualStatus = calculateGatewayStatus(offlineGateway.lastHeartbeat, hasAlerts);
      log(`实际状态: ${actualStatus}`, 'info');

      const result = store.generateOfflineSnapshot(testGatewayId);
      store = useGatewayStore.getState();
      log(`生成结果: success=${result.success}, message="${result.message}"`, 'info');

      const snapshot = store.getSnapshotByGatewayId(testGatewayId);
      log(`快照是否存在: ${!!snapshot}`, 'info');

      if (snapshot) {
        log(`快照ID: ${snapshot.id}`, 'info');
        log(`最后心跳: ${snapshot.lastHeartbeat.toLocaleString()}`, 'info');
        log(`最后上报值: ${snapshot.lastReportedValue}`, 'info');
        log(`处理备注: ${snapshot.processingRemark}`, 'info');
        log(`生成时间: ${snapshot.generatedAt.toLocaleString()}`, 'info');
        log(`离线前状态: ${snapshot.statusBeforeOffline}`, 'info');
      }

      const passed = result.success && !!snapshot;
      testResults.push({
        name: '测试5',
        passed,
        message: passed ? '离线网关成功生成快照' : '离线网关未能生成快照',
      });
      log(passed ? '✓ 测试通过：离线网关成功生成快照' : '✗ 测试失败：离线网关未能生成快照', passed ? 'success' : 'error');
    }
  }
  console.log();

  log('【测试6】已存在快照的离线网关不能重复生成', 'test');
  log('----------------------------------------', 'test');
  {
    const testGatewayId = 'gw-011';
    const existingSnapshot = store.getSnapshotByGatewayId(testGatewayId);
    if (!existingSnapshot) {
      testResults.push({ name: '测试6', passed: false, message: '先决条件失败：没有现有快照' });
      log('✗ 先决条件失败：没有现有快照', 'error');
    } else {
      log(`目标网关已有快照: ${existingSnapshot.id}`, 'info');

      const result = store.generateOfflineSnapshot(testGatewayId);
      log(`再次生成结果: success=${result.success}, message="${result.message}"`, 'info');

      const snapshotAfter = store.getSnapshotByGatewayId(testGatewayId);
      log(`快照ID未变化: ${snapshotAfter?.id === existingSnapshot.id}`, 'info');

      const passed = !result.success && snapshotAfter?.id === existingSnapshot.id;
      testResults.push({
        name: '测试6',
        passed,
        message: passed ? '正确阻止重复生成快照' : '不应重复生成快照',
      });
      log(passed ? '✓ 测试通过：正确阻止重复生成快照' : '✗ 测试失败：不应重复生成快照', passed ? 'success' : 'error');
    }
  }
  console.log();

  log('【测试7】已离线网关 gw-005 应已有初始快照', 'test');
  log('----------------------------------------', 'test');
  {
    const offlineGatewayId = 'gw-005';
    const offlineGateway = store.gateways.find((g) => g.id === offlineGatewayId);
    if (!offlineGateway) {
      testResults.push({ name: '测试7', passed: false, message: '未找到 gw-005' });
      log('✗ 未找到 gw-005', 'error');
    } else {
      const snapshot = store.getSnapshotByGatewayId(offlineGatewayId);
      log(`网关: ${offlineGateway.name} (${offlineGateway.code})`, 'info');
      log(`状态: ${offlineGateway.status}`, 'info');
      log(`快照是否存在: ${!!snapshot}`, 'info');

      if (snapshot) {
        log(`快照ID: ${snapshot.id}`, 'info');
        log(`最后心跳: ${snapshot.lastHeartbeat.toLocaleString()}`, 'info');
        log(`最后上报值: ${snapshot.lastReportedValue}`, 'info');
      }

      const passed = !!snapshot;
      testResults.push({
        name: '测试7',
        passed,
        message: passed ? '离线网关正确加载初始快照' : '离线网关应加载初始快照',
      });
      log(passed ? '✓ 测试通过：离线网关已加载初始快照' : '✗ 测试失败：离线网关应加载初始快照', passed ? 'success' : 'error');
    }
  }
  console.log();

  log('【测试8】recalculateStats 自动为离线网关生成快照', 'test');
  log('----------------------------------------', 'test');
  {
    const testGatewayId = 'gw-009';
    const testGateway = store.gateways.find((g) => g.id === testGatewayId);
    if (!testGateway) {
      testResults.push({ name: '测试8', passed: false, message: '未找到 gw-009' });
      log('✗ 未找到 gw-009', 'error');
    } else {
      useGatewayStore.setState((state) => {
        const newSnapshots = { ...state.offlineSnapshots };
        delete newSnapshots[testGatewayId];
        return {
          offlineSnapshots: newSnapshots,
          gateways: state.gateways.map((gw) =>
            gw.id === testGatewayId
              ? {
                  ...gw,
                  lastHeartbeat: new Date(Date.now() - OFFLINE_THRESHOLD - 5000),
                  status: 'timeout',
                }
              : gw
          ),
        };
      });
      store = useGatewayStore.getState();

      log(`目标网关: ${testGateway.name} (${testGateway.code})`, 'info');
      const beforeSnapshot = store.getSnapshotByGatewayId(testGatewayId);
      log(`recalculateStats 前快照存在: ${!!beforeSnapshot}`, 'info');

      store.recalculateStats();
      store = useGatewayStore.getState();

      const afterSnapshot = store.getSnapshotByGatewayId(testGatewayId);
      log(`recalculateStats 后快照存在: ${!!afterSnapshot}`, 'info');

      const updatedGateway = store.gateways.find((g) => g.id === testGatewayId)!;
      log(`网关状态: ${updatedGateway.status}`, 'info');

      const passed = !beforeSnapshot && !!afterSnapshot && updatedGateway.status === 'offline';
      testResults.push({
        name: '测试8',
        passed,
        message: passed ? 'recalculateStats 正确自动生成快照' : 'recalculateStats 应自动生成快照',
      });
      log(passed ? '✓ 测试通过：recalculateStats 正确自动生成快照' : '✗ 测试失败：recalculateStats 应自动生成快照', passed ? 'success' : 'error');
    }
  }
  console.log();

  log('========================================', 'test');
  log('  测试结果汇总', 'test');
  log('========================================', 'test');
  console.log();

  const passedCount = testResults.filter((t) => t.passed).length;
  const totalCount = testResults.length;

  testResults.forEach((result) => {
    log(
      `${result.passed ? '✓' : '✗'} ${result.name}: ${result.message}`,
      result.passed ? 'success' : 'error'
    );
  });
  console.log();
  log(
    `总计: ${passedCount}/${totalCount} 测试通过`,
    passedCount === totalCount ? 'success' : 'error'
  );

  if (passedCount !== totalCount) {
    console.log();
    log('失败的测试：', 'error');
    testResults
      .filter((t) => !t.passed)
      .forEach((result) => {
        log(`  - ${result.name}: ${result.message}`, 'error');
      });
    process.exit(1);
  }

  console.log();
  log('所有测试通过！离线快照功能正常工作。', 'success');
}

runTests();
