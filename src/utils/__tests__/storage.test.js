import { describe, it, expect } from 'vitest';
import {
  parseBackupFile,
  computeRestorePreview,
  mergeArrayData,
  mergeInventoryData,
} from '../storage';
import { DATA_BACKUP_VERSION, backupStorageKeys, defaultInventory } from '../constants';

describe('parseBackupFile', () => {
  it('应正确解析有效的备份文件', () => {
    const backup = {
      version: DATA_BACKUP_VERSION,
      exportedAt: '2026-06-14T00:00:00.000Z',
      data: {
        records: [],
        customers: [],
        inventory: {},
        materials: [],
        proposals: [],
      },
    };

    const result = parseBackupFile(JSON.stringify(backup));
    expect(result.valid).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data.version).toBe(DATA_BACKUP_VERSION);
    expect(result.data.data).toBeDefined();
  });

  it('应返回错误信息当备份文件格式无效时', () => {
    const result = parseBackupFile('这不是JSON');
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error.length).toBeGreaterThan(0);
  });

  it('应检测缺少version字段的无效备份', () => {
    const backup = {
      exportedAt: '2026-06-14T00:00:00.000Z',
      data: {},
    };

    const result = parseBackupFile(JSON.stringify(backup));
    expect(result.valid).toBe(false);
    expect(result.error).toContain('无效的备份文件格式');
  });

  it('应检测缺少data字段的无效备份', () => {
    const backup = {
      version: DATA_BACKUP_VERSION,
      exportedAt: '2026-06-14T00:00:00.000Z',
    };

    const result = parseBackupFile(JSON.stringify(backup));
    expect(result.valid).toBe(false);
  });

  it('空字符串应返回解析失败', () => {
    const result = parseBackupFile('');
    expect(result.valid).toBe(false);
  });

  it('null或undefined应返回解析失败', () => {
    const result1 = parseBackupFile('null');
    expect(result1.valid).toBe(false);

    const result2 = parseBackupFile('undefined');
    expect(result2.valid).toBe(false);
  });

  it('应支持包含实际数据的备份文件', () => {
    const backup = {
      version: DATA_BACKUP_VERSION,
      exportedAt: '2026-06-14T00:00:00.000Z',
      data: {
        records: [
          { id: 'r1', client: '客户A', adName: '广告1' },
          { id: 'r2', client: '客户B', adName: '广告2' },
        ],
        customers: [
          { id: 'c1', name: '客户A' },
        ],
        inventory: {
          'channel-news': { slots: [] },
        },
        materials: [
          { id: 'm1', name: '素材1' },
          { id: 'm2', name: '素材2' },
          { id: 'm3', name: '素材3' },
        ],
        proposals: [
          { id: 'p1', name: '方案1' },
        ],
      },
    };

    const result = parseBackupFile(JSON.stringify(backup));
    expect(result.valid).toBe(true);
    expect(result.data.data.records.length).toBe(2);
    expect(result.data.data.customers.length).toBe(1);
    expect(result.data.data.materials.length).toBe(3);
    expect(result.data.data.proposals.length).toBe(1);
    expect(Object.keys(result.data.data.inventory).length).toBe(1);
  });
});

describe('computeRestorePreview - 数量统计', () => {
  const createMockBackupData = (data) => ({
    version: DATA_BACKUP_VERSION,
    exportedAt: '2026-06-14T00:00:00.000Z',
    data,
  });

  const createEmptyCurrentState = () => ({
    records: [],
    customers: [],
    inventory: {},
    materials: [],
    proposals: [],
  });

  it('应正确统计广告排期(records)的数量', () => {
    const backupData = createMockBackupData({
      records: [
        { id: 'r1', client: '客户A' },
        { id: 'r2', client: '客户B' },
        { id: 'r3', client: '客户C' },
      ],
    });

    const currentState = createEmptyCurrentState();
    const preview = computeRestorePreview(backupData, currentState);

    expect(preview.records).toBeDefined();
    expect(preview.records.label).toBe('广告排期');
    expect(preview.records.incomingCount).toBe(3);
    expect(preview.records.currentCount).toBe(0);
    expect(preview.records.overlappingCount).toBe(0);
    expect(preview.records.newOnlyCount).toBe(3);
  });

  it('应正确统计客户档案(customers)的数量', () => {
    const backupData = createMockBackupData({
      customers: [
        { id: 'c1', name: '客户A' },
        { id: 'c2', name: '客户B' },
      ],
    });

    const currentState = createEmptyCurrentState();
    const preview = computeRestorePreview(backupData, currentState);

    expect(preview.customers).toBeDefined();
    expect(preview.customers.label).toBe('客户档案');
    expect(preview.customers.incomingCount).toBe(2);
    expect(preview.customers.currentCount).toBe(0);
    expect(preview.customers.overlappingCount).toBe(0);
    expect(preview.customers.newOnlyCount).toBe(2);
  });

  it('应正确统计频道库存(inventory)的数量', () => {
    const backupData = createMockBackupData({
      inventory: {
        'channel-news': { slots: [] },
        'channel-music': { slots: [] },
        'channel-traffic': { slots: [] },
      },
    });

    const currentState = createEmptyCurrentState();
    const preview = computeRestorePreview(backupData, currentState);

    expect(preview.inventory).toBeDefined();
    expect(preview.inventory.label).toBe('频道库存');
    expect(preview.inventory.incomingCount).toBe(3);
    expect(preview.inventory.currentCount).toBe(0);
    expect(preview.inventory.overlappingCount).toBe(0);
    expect(preview.inventory.newOnlyCount).toBe(3);
  });

  it('应正确统计素材记录(materials)的数量', () => {
    const backupData = createMockBackupData({
      materials: [
        { id: 'm1', name: '素材1' },
        { id: 'm2', name: '素材2' },
        { id: 'm3', name: '素材3' },
        { id: 'm4', name: '素材4' },
        { id: 'm5', name: '素材5' },
      ],
    });

    const currentState = createEmptyCurrentState();
    const preview = computeRestorePreview(backupData, currentState);

    expect(preview.materials).toBeDefined();
    expect(preview.materials.label).toBe('素材记录');
    expect(preview.materials.incomingCount).toBe(5);
    expect(preview.materials.currentCount).toBe(0);
    expect(preview.materials.overlappingCount).toBe(0);
    expect(preview.materials.newOnlyCount).toBe(5);
  });

  it('应正确统计排期方案(proposals)的数量', () => {
    const backupData = createMockBackupData({
      proposals: [
        { id: 'p1', name: '方案1' },
        { id: 'p2', name: '方案2' },
      ],
    });

    const currentState = createEmptyCurrentState();
    const preview = computeRestorePreview(backupData, currentState);

    expect(preview.proposals).toBeDefined();
    expect(preview.proposals.label).toBe('排期方案');
    expect(preview.proposals.incomingCount).toBe(2);
    expect(preview.proposals.currentCount).toBe(0);
    expect(preview.proposals.overlappingCount).toBe(0);
    expect(preview.proposals.newOnlyCount).toBe(2);
  });

  it('应正确计算重叠的数据项（基于id）', () => {
    const backupData = createMockBackupData({
      records: [
        { id: 'r1', client: '客户A' },
        { id: 'r2', client: '客户B' },
        { id: 'r3', client: '客户C' },
      ],
    });

    const currentState = {
      ...createEmptyCurrentState(),
      records: [
        { id: 'r2', client: '客户B-已存在' },
        { id: 'r4', client: '客户D' },
      ],
    };

    const preview = computeRestorePreview(backupData, currentState);

    expect(preview.records.incomingCount).toBe(3);
    expect(preview.records.currentCount).toBe(2);
    expect(preview.records.overlappingCount).toBe(1);
    expect(preview.records.newOnlyCount).toBe(2);
  });

  it('应正确计算库存频道的重叠', () => {
    const backupData = createMockBackupData({
      inventory: {
        'channel-news': { slots: [] },
        'channel-music': { slots: [] },
        'channel-sports': { slots: [] },
      },
    });

    const currentState = {
      ...createEmptyCurrentState(),
      inventory: {
        'channel-news': { slots: [] },
        'channel-traffic': { slots: [] },
      },
    };

    const preview = computeRestorePreview(backupData, currentState);

    expect(preview.inventory.incomingCount).toBe(3);
    expect(preview.inventory.currentCount).toBe(2);
    expect(preview.inventory.overlappingCount).toBe(1);
    expect(preview.inventory.newOnlyCount).toBe(2);
  });

  it('备份中数据为null时应使用默认值', () => {
    const backupData = createMockBackupData({
      records: null,
      customers: null,
      inventory: null,
      materials: null,
      proposals: null,
    });

    const currentState = createEmptyCurrentState();
    const preview = computeRestorePreview(backupData, currentState);

    expect(preview.records.incomingCount).toBe(0);
    expect(preview.customers.incomingCount).toBe(0);
    expect(preview.inventory.incomingCount).toBe(0);
    expect(preview.materials.incomingCount).toBe(0);
    expect(preview.proposals.incomingCount).toBe(0);
  });

  it('备份中数据为undefined时应使用默认值', () => {
    const backupData = createMockBackupData({});

    const currentState = createEmptyCurrentState();
    const preview = computeRestorePreview(backupData, currentState);

    expect(preview.records.incomingCount).toBe(0);
    expect(preview.customers.incomingCount).toBe(0);
    expect(preview.inventory.incomingCount).toBe(0);
    expect(preview.materials.incomingCount).toBe(0);
    expect(preview.proposals.incomingCount).toBe(0);
  });

  it('当前状态为空时应正确计算', () => {
    const backupData = createMockBackupData({
      records: [{ id: 'r1' }],
      customers: [{ id: 'c1' }, { id: 'c2' }],
      inventory: { 'ch1': {} },
      materials: [],
      proposals: [{ id: 'p1' }, { id: 'p2' }, { id: 'p3' }],
    });

    const preview = computeRestorePreview(backupData, {});

    expect(preview.records.currentCount).toBe(0);
    expect(preview.records.overlappingCount).toBe(0);
    expect(preview.records.newOnlyCount).toBe(1);

    expect(preview.customers.currentCount).toBe(0);
    expect(preview.customers.overlappingCount).toBe(0);
    expect(preview.customers.newOnlyCount).toBe(2);

    expect(preview.inventory.currentCount).toBe(0);
    expect(preview.inventory.overlappingCount).toBe(0);
    expect(preview.inventory.newOnlyCount).toBe(1);

    expect(preview.materials.currentCount).toBe(0);
    expect(preview.materials.newOnlyCount).toBe(0);

    expect(preview.proposals.currentCount).toBe(0);
    expect(preview.proposals.newOnlyCount).toBe(3);
  });

  it('备份数据不是数组时应返回0', () => {
    const backupData = createMockBackupData({
      records: '不是数组',
      customers: 123,
      materials: { key: 'value' },
    });

    const currentState = createEmptyCurrentState();
    const preview = computeRestorePreview(backupData, currentState);

    expect(preview.records.incomingCount).toBe(0);
    expect(preview.customers.incomingCount).toBe(0);
    expect(preview.materials.incomingCount).toBe(0);
  });

  it('应包含所有五个数据类别的预览', () => {
    const backupData = createMockBackupData({});
    const currentState = createEmptyCurrentState();
    const preview = computeRestorePreview(backupData, currentState);

    expect(preview.records).toBeDefined();
    expect(preview.customers).toBeDefined();
    expect(preview.inventory).toBeDefined();
    expect(preview.materials).toBeDefined();
    expect(preview.proposals).toBeDefined();

    expect(preview.records.label).toBe('广告排期');
    expect(preview.customers.label).toBe('客户档案');
    expect(preview.inventory.label).toBe('频道库存');
    expect(preview.materials.label).toBe('素材记录');
    expect(preview.proposals.label).toBe('排期方案');
  });

  it('应与backupStorageKeys中的键一致', () => {
    const backupData = createMockBackupData({});
    const currentState = createEmptyCurrentState();
    const preview = computeRestorePreview(backupData, currentState);

    const previewKeys = Object.keys(preview);
    const storageKeys = Object.keys(backupStorageKeys);

    expect(previewKeys.sort()).toEqual(storageKeys.sort());
  });

  it('完全重叠的数据：所有项目都在当前状态中存在', () => {
    const backupData = createMockBackupData({
      records: [
        { id: 'r1', name: 'A' },
        { id: 'r2', name: 'B' },
      ],
    });

    const currentState = {
      ...createEmptyCurrentState(),
      records: [
        { id: 'r1', name: 'A-old' },
        { id: 'r2', name: 'B-old' },
        { id: 'r3', name: 'C-old' },
      ],
    };

    const preview = computeRestorePreview(backupData, currentState);

    expect(preview.records.incomingCount).toBe(2);
    expect(preview.records.currentCount).toBe(3);
    expect(preview.records.overlappingCount).toBe(2);
    expect(preview.records.newOnlyCount).toBe(0);
  });

  it('没有重叠的数据：备份中没有任何项目在当前状态中存在', () => {
    const backupData = createMockBackupData({
      records: [
        { id: 'r1', name: 'A' },
        { id: 'r2', name: 'B' },
      ],
    });

    const currentState = {
      ...createEmptyCurrentState(),
      records: [
        { id: 'r3', name: 'C' },
        { id: 'r4', name: 'D' },
      ],
    };

    const preview = computeRestorePreview(backupData, currentState);

    expect(preview.records.incomingCount).toBe(2);
    expect(preview.records.currentCount).toBe(2);
    expect(preview.records.overlappingCount).toBe(0);
    expect(preview.records.newOnlyCount).toBe(2);
  });

  it('综合场景：所有类别都有部分重叠', () => {
    const backupData = createMockBackupData({
      records: [
        { id: 'r1', name: 'A' },
        { id: 'r2', name: 'B' },
        { id: 'r3', name: 'C' },
      ],
      customers: [
        { id: 'c1', name: '客户1' },
        { id: 'c2', name: '客户2' },
      ],
      inventory: {
        'channel-news': { slots: [] },
        'channel-music': { slots: [] },
        'channel-sports': { slots: [] },
      },
      materials: [
        { id: 'm1', name: '素材1' },
      ],
      proposals: [
        { id: 'p1', name: '方案1' },
        { id: 'p2', name: '方案2' },
        { id: 'p3', name: '方案3' },
        { id: 'p4', name: '方案4' },
      ],
    });

    const currentState = {
      records: [
        { id: 'r2', name: 'B-old' },
        { id: 'r4', name: 'D-old' },
      ],
      customers: [
        { id: 'c1', name: '客户1-old' },
        { id: 'c3', name: '客户3-old' },
        { id: 'c4', name: '客户4-old' },
      ],
      inventory: {
        'channel-news': { slots: [] },
        'channel-traffic': { slots: [] },
      },
      materials: [
        { id: 'm1', name: '素材1-old' },
        { id: 'm2', name: '素材2-old' },
      ],
      proposals: [
        { id: 'p2', name: '方案2-old' },
        { id: 'p4', name: '方案4-old' },
      ],
    };

    const preview = computeRestorePreview(backupData, currentState);

    expect(preview.records.incomingCount).toBe(3);
    expect(preview.records.currentCount).toBe(2);
    expect(preview.records.overlappingCount).toBe(1);
    expect(preview.records.newOnlyCount).toBe(2);

    expect(preview.customers.incomingCount).toBe(2);
    expect(preview.customers.currentCount).toBe(3);
    expect(preview.customers.overlappingCount).toBe(1);
    expect(preview.customers.newOnlyCount).toBe(1);

    expect(preview.inventory.incomingCount).toBe(3);
    expect(preview.inventory.currentCount).toBe(2);
    expect(preview.inventory.overlappingCount).toBe(1);
    expect(preview.inventory.newOnlyCount).toBe(2);

    expect(preview.materials.incomingCount).toBe(1);
    expect(preview.materials.currentCount).toBe(2);
    expect(preview.materials.overlappingCount).toBe(1);
    expect(preview.materials.newOnlyCount).toBe(0);

    expect(preview.proposals.incomingCount).toBe(4);
    expect(preview.proposals.currentCount).toBe(2);
    expect(preview.proposals.overlappingCount).toBe(2);
    expect(preview.proposals.newOnlyCount).toBe(2);
  });
});

describe('mergeArrayData', () => {
  it('应合并两个数组，保留现有项并添加新项', () => {
    const current = [
      { id: 'a', name: 'A' },
      { id: 'b', name: 'B' },
    ];

    const incoming = [
      { id: 'b', name: 'B-new' },
      { id: 'c', name: 'C' },
    ];

    const result = mergeArrayData(current, incoming);

    expect(result.length).toBe(3);
    expect(result.find((item) => item.id === 'a')).toBeDefined();
    expect(result.find((item) => item.id === 'b').name).toBe('B');
    expect(result.find((item) => item.id === 'c')).toBeDefined();
  });

  it('当前数组为空时应返回备份数组', () => {
    const current = [];
    const incoming = [{ id: 'a' }, { id: 'b' }];

    const result = mergeArrayData(current, incoming);

    expect(result.length).toBe(2);
  });

  it('备份数组为空时应返回当前数组', () => {
    const current = [{ id: 'a' }, { id: 'b' }];
    const incoming = [];

    const result = mergeArrayData(current, incoming);

    expect(result.length).toBe(2);
  });

  it('完全相同时不应添加重复项', () => {
    const current = [{ id: 'a' }, { id: 'b' }];
    const incoming = [{ id: 'a' }, { id: 'b' }];

    const result = mergeArrayData(current, incoming);

    expect(result.length).toBe(2);
  });
});

describe('mergeInventoryData', () => {
  it('应合并库存频道，保留现有频道并添加新频道', () => {
    const current = {
      'channel-news': { slots: [{ slot: '08:00-09:00' }] },
      'channel-music': { slots: [{ slot: '09:00-10:00' }] },
    };

    const incoming = {
      'channel-music': { slots: [{ slot: '10:00-11:00' }] },
      'channel-sports': { slots: [{ slot: '11:00-12:00' }] },
    };

    const result = mergeInventoryData(current, incoming);

    expect(Object.keys(result).length).toBe(3);
    expect(result['channel-news']).toBeDefined();
    expect(result['channel-music'].slots[0].slot).toBe('09:00-10:00');
    expect(result['channel-sports']).toBeDefined();
  });

  it('当前库存为空时应返回备份库存', () => {
    const current = {};
    const incoming = { 'ch1': {}, 'ch2': {} };

    const result = mergeInventoryData(current, incoming);

    expect(Object.keys(result).length).toBe(2);
  });

  it('备份库存为空时应返回当前库存', () => {
    const current = { 'ch1': {}, 'ch2': {} };
    const incoming = {};

    const result = mergeInventoryData(current, incoming);

    expect(Object.keys(result).length).toBe(2);
  });

  it('完全相同的频道不应产生变化', () => {
    const current = { 'ch1': { a: 1 }, 'ch2': { b: 2 } };
    const incoming = { 'ch1': { a: 99 }, 'ch2': { b: 99 } };

    const result = mergeInventoryData(current, incoming);

    expect(Object.keys(result).length).toBe(2);
    expect(result['ch1'].a).toBe(1);
    expect(result['ch2'].b).toBe(2);
  });
});

describe('DATA_BACKUP_VERSION 常量', () => {
  it('版本号应为字符串格式', () => {
    expect(typeof DATA_BACKUP_VERSION).toBe('string');
    expect(DATA_BACKUP_VERSION.length).toBeGreaterThan(0);
  });
});

describe('defaultInventory 常量', () => {
  it('默认库存应包含频道数据', () => {
    expect(defaultInventory).toBeDefined();
    expect(Object.keys(defaultInventory).length).toBeGreaterThan(0);
  });

  it('每个频道都应有slots字段', () => {
    Object.values(defaultInventory).forEach((channel) => {
      expect(channel.slots).toBeDefined();
      expect(Array.isArray(channel.slots)).toBe(true);
    });
  });
});

describe('backupStorageKeys 常量', () => {
  it('应包含所有五个数据类别的存储键', () => {
    expect(backupStorageKeys.records).toBeDefined();
    expect(backupStorageKeys.customers).toBeDefined();
    expect(backupStorageKeys.inventory).toBeDefined();
    expect(backupStorageKeys.materials).toBeDefined();
    expect(backupStorageKeys.proposals).toBeDefined();
  });

  it('所有存储键应为字符串', () => {
    Object.values(backupStorageKeys).forEach((key) => {
      expect(typeof key).toBe('string');
      expect(key.length).toBeGreaterThan(0);
    });
  });
});
