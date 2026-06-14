import {
  appConfig,
  defaultInventory,
  defaultCustomers,
  defaultMaterials,
  DATA_BACKUP_VERSION,
  backupStorageKeys,
  customerStorage,
  materialStorage,
  inventoryStorage,
  proposalStorage,
} from './constants';

import { uid, localDateKey, today } from './dateMoneyUtils';

function withIds(items) {
  return items.map((item) => ({
    id: uid(),
    timeline: item.timeline || [{ status: item.status, at: today, by: '系统' }],
    ...item
  }));
}

function loadRecords() {
  const raw = localStorage.getItem(appConfig.storage);
  if (raw) {
    try {
      const data = JSON.parse(raw);
      if (data.length > 0 && !data[0].channelId) {
        const migrated = data.map((item) => ({ ...item, channelId: 'channel-news' }));
        localStorage.setItem(appConfig.storage, JSON.stringify(migrated));
        return migrated;
      }
      return data;
    } catch {
      return withIds(appConfig.seed).map((item) => ({ ...item, channelId: 'channel-news' }));
    }
  }
  return withIds(appConfig.seed).map((item) => ({ ...item, channelId: 'channel-news' }));
}

function persistRecords(next) {
  localStorage.setItem(appConfig.storage, JSON.stringify(next));
}

function loadCustomers() {
  const raw = localStorage.getItem(customerStorage);
  if (raw) {
    try {
      const data = JSON.parse(raw);
      const migrated = data.map((c) => ({
        ...c,
        level: c.level || '',
        industry: c.industry || '',
      }));
      if (JSON.stringify(data) !== JSON.stringify(migrated)) {
        localStorage.setItem(customerStorage, JSON.stringify(migrated));
      }
      return migrated;
    } catch {
      return defaultCustomers.map((c) => ({ ...c, id: uid() }));
    }
  }
  return defaultCustomers.map((c) => ({ ...c, id: uid() }));
}

function persistCustomers(next) {
  localStorage.setItem(customerStorage, JSON.stringify(next));
}

function loadInventory() {
  const raw = localStorage.getItem(inventoryStorage);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      return defaultInventory;
    }
  }
  return defaultInventory;
}

function persistInventory(next) {
  localStorage.setItem(inventoryStorage, JSON.stringify(next));
}

function loadMaterials() {
  const raw = localStorage.getItem(materialStorage);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      return defaultMaterials.map((m) => ({ ...m, id: uid() }));
    }
  }
  return defaultMaterials.map((m) => ({ ...m, id: uid() }));
}

function persistMaterials(next) {
  localStorage.setItem(materialStorage, JSON.stringify(next));
}

function loadProposals() {
  const raw = localStorage.getItem(proposalStorage);
  if (raw) {
    try { return JSON.parse(raw); }
    catch { return []; }
  }
  return [];
}

function persistProposals(next) {
  localStorage.setItem(proposalStorage, JSON.stringify(next));
}

function createBackupData() {
  const backup = {
    version: DATA_BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data: {},
  };
  Object.entries(backupStorageKeys).forEach(([key, storageKey]) => {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try {
        backup.data[key] = JSON.parse(raw);
      } catch {
        backup.data[key] = key === 'inventory' ? defaultInventory : [];
      }
    } else {
      backup.data[key] = key === 'inventory' ? defaultInventory : [];
    }
  });
  return backup;
}

function downloadBackup(backup) {
  const jsonStr = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `电台广告排期备份_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function parseBackupFile(text) {
  try {
    const parsed = JSON.parse(text);
    if (!parsed || !parsed.version || !parsed.data) {
      return { valid: false, error: '无效的备份文件格式' };
    }
    return { valid: true, data: parsed };
  } catch {
    return { valid: false, error: '备份文件解析失败，请确认文件格式正确' };
  }
}

function computeRestorePreview(backupData, currentState) {
  const preview = {};
  Object.entries(backupStorageKeys).forEach(([key]) => {
    const incoming = backupData.data[key] || (key === 'inventory' ? {} : []);
    const current = currentState[key];
    if (key === 'inventory') {
      const incomingChannels = Object.keys(incoming);
      const currentChannels = Object.keys(current || {});
      const overlapping = incomingChannels.filter((c) => currentChannels.includes(c));
      preview[key] = {
        label: '频道库存',
        incomingCount: incomingChannels.length,
        currentCount: currentChannels.length,
        overlappingCount: overlapping.length,
        newOnlyCount: incomingChannels.length - overlapping.length,
      };
    } else {
      const incomingList = Array.isArray(incoming) ? incoming : [];
      const currentList = Array.isArray(current) ? current : [];
      const currentIds = new Set(currentList.map((item) => item.id));
      const overlapping = incomingList.filter((item) => currentIds.has(item.id));
      const newOnly = incomingList.filter((item) => !currentIds.has(item.id));
      preview[key] = {
        label: key === 'records' ? '广告排期' : key === 'customers' ? '客户档案' : key === 'materials' ? '素材记录' : '排期方案',
        incomingCount: incomingList.length,
        currentCount: currentList.length,
        overlappingCount: overlapping.length,
        newOnlyCount: newOnly.length,
      };
    }
  });
  return preview;
}

function mergeArrayData(current, incoming) {
  const currentIds = new Set(current.map((item) => item.id));
  const newItems = incoming.filter((item) => !currentIds.has(item.id));
  return [...current, ...newItems];
}

function mergeInventoryData(current, incoming) {
  const result = { ...current };
  Object.entries(incoming).forEach(([channelId, channelData]) => {
    if (!result[channelId]) {
      result[channelId] = channelData;
    }
  });
  return result;
}

export {
  withIds,
  loadRecords,
  persistRecords,
  loadCustomers,
  persistCustomers,
  loadInventory,
  persistInventory,
  loadMaterials,
  persistMaterials,
  loadProposals,
  persistProposals,
  createBackupData,
  downloadBackup,
  parseBackupFile,
  computeRestorePreview,
  mergeArrayData,
  mergeInventoryData,
};
