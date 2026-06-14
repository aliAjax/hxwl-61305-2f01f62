import { useEffect, useMemo, useState } from 'react';
import { Radio, Plus, Search, Trash2, RotateCcw, CheckCircle2, AlertTriangle, ClipboardList, CalendarDays, Users, UserPlus, Phone, Pencil, X, ChevronLeft, ChevronRight, Calendar, FileUp, XCircle, ShieldAlert, Clock, Layers, MinusCircle, Zap, CalendarRange, SkipForward, Flag, PlayCircle, ListVideo, Mic2, BarChart3, TrendingUp, PieChart, Inbox, FileText, Package, History, Calculator, ArrowRightLeft, Sparkles, Eye, ThumbsUp, Ban } from 'lucide-react';
import './App.css';

const appConfig = {
  "id": "hxwl-61305",
  "port": 61305,
  "title": "小型电台广告排期",
  "subtitle": "按天查看广告时段、播放次数和冲突提示",
  "domain": "电台广告",
  "icon": "Radio",
  "storage": "hxwl-61305-radio-ad-schedule",
  "accent": "#f97316",
  "statuses": [
    "待确认",
    "已排期",
    "已播完"
  ],
  "primaryStatus": "待确认",
  "fields": [
    {
      "key": "client",
      "label": "客户",
      "type": "input",
      "placeholder": "蓝海家居",
      "options": []
    },
    {
      "key": "adName",
      "label": "广告名称",
      "type": "input",
      "placeholder": "618门店促销",
      "options": []
    },
    {
      "key": "date",
      "label": "投放日期",
      "type": "date",
      "placeholder": "",
      "options": []
    },
    {
      "key": "slot",
      "label": "时段",
      "type": "select",
      "placeholder": "08:00-09:00",
      "options": [
        "07:00-08:00",
        "08:00-09:00",
        "12:00-13:00",
        "18:00-19:00",
        "21:00-22:00"
      ]
    },
    {
      "key": "plays",
      "label": "播放次数",
      "type": "number",
      "placeholder": "4",
      "options": []
    },
    {
      "key": "amount",
      "label": "合同金额",
      "type": "number",
      "placeholder": "3600",
      "options": []
    }
  ],
  "seed": [
    {
      "client": "蓝海家居",
      "adName": "618门店促销",
      "date": "2026-06-13",
      "slot": "08:00-09:00",
      "plays": "4",
      "amount": "3600",
      "status": "已排期"
    },
    {
      "client": "北城眼镜",
      "adName": "暑期配镜",
      "date": "2026-06-13",
      "slot": "08:00-09:00",
      "plays": "3",
      "amount": "2800",
      "status": "待确认"
    },
    {
      "client": "云上烘焙",
      "adName": "新品上线",
      "date": "2026-06-13",
      "slot": "08:00-09:00",
      "plays": "2",
      "amount": "1600",
      "status": "已排期"
    },
    {
      "client": "星河电器",
      "adName": "年中大促",
      "date": "2026-06-13",
      "slot": "18:00-19:00",
      "plays": "5",
      "amount": "5000",
      "status": "已排期"
    },
    {
      "client": "绿洲健身",
      "adName": "夏季会员招募",
      "date": "2026-06-13",
      "slot": "18:00-19:00",
      "plays": "3",
      "amount": "3200",
      "status": "待确认"
    },
    {
      "client": "锦绣珠宝",
      "adName": "父亲节特惠",
      "date": "2026-06-14",
      "slot": "12:00-13:00",
      "plays": "2",
      "amount": "8000",
      "status": "已播完"
    }
  ],
  "metrics": [
    [
      "排期数",
      "records.length"
    ],
    [
      "今日广告",
      "records.filter((item) => item.date === today).length"
    ],
    [
      "合同额",
      "money(records.reduce((sum, item) => sum + Number(item.amount || 0), 0))"
    ]
  ],
  "filters": [
    {
      "key": "query",
      "label": "客户/广告",
      "type": "search",
      "match": "`${item.client}${item.adName}`.includes(filters.query)"
    },
    {
      "key": "status",
      "label": "排期状态",
      "type": "status"
    }
  ],
  "cardTitle": "item.adName",
  "cardMeta": "`${item.client} · ${item.date} · ${item.slot}`",
  "cardDetail": "`播放${item.plays}次｜合同${money(Number(item.amount || 0))}`",
  "dateKey": "date",
  "conflict": "date-slot",
  "note": "新增排期时如果同一天同一时段已有广告，要在界面里提示冲突。",
  "defaultValues": {
    "client": "蓝海家居",
    "adName": "618门店促销",
    "date": "",
    "slot": "08:00-09:00",
    "plays": "4",
    "amount": "3600",
    "status": "待确认"
  }
};

const channels = [
  {
    id: 'channel-news',
    name: '新闻台',
    color: '#2563eb',
    isDefault: true,
    slots: [
      '07:00-08:00',
      '08:00-09:00',
      '12:00-13:00',
      '18:00-19:00',
      '21:00-22:00'
    ]
  },
  {
    id: 'channel-music',
    name: '音乐台',
    color: '#8b5cf6',
    isDefault: false,
    slots: [
      '07:00-08:00',
      '08:00-09:00',
      '12:00-13:00',
      '18:00-19:00',
      '21:00-22:00'
    ]
  },
  {
    id: 'channel-traffic',
    name: '交通台',
    color: '#f97316',
    isDefault: false,
    slots: [
      '07:00-08:00',
      '08:00-09:00',
      '12:00-13:00',
      '18:00-19:00',
      '21:00-22:00'
    ]
  }
];

const inventoryStorage = 'hxwl-61305-channel-inventory';

const defaultInventory = {
  'channel-news': {
    slots: [
      { slot: '07:00-08:00', capacity: 3, enabled: true },
      { slot: '08:00-09:00', capacity: 3, enabled: true },
      { slot: '12:00-13:00', capacity: 3, enabled: true },
      { slot: '18:00-19:00', capacity: 3, enabled: true },
      { slot: '21:00-22:00', capacity: 3, enabled: true }
    ]
  },
  'channel-music': {
    slots: [
      { slot: '07:00-08:00', capacity: 3, enabled: true },
      { slot: '08:00-09:00', capacity: 3, enabled: true },
      { slot: '12:00-13:00', capacity: 3, enabled: true },
      { slot: '18:00-19:00', capacity: 3, enabled: true },
      { slot: '21:00-22:00', capacity: 3, enabled: true }
    ]
  },
  'channel-traffic': {
    slots: [
      { slot: '07:00-08:00', capacity: 3, enabled: true },
      { slot: '08:00-09:00', capacity: 3, enabled: true },
      { slot: '12:00-13:00', capacity: 3, enabled: true },
      { slot: '18:00-19:00', capacity: 3, enabled: true },
      { slot: '21:00-22:00', capacity: 3, enabled: true }
    ]
  }
};

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

const customerStorage = 'hxwl-61305-customer-archive';

const customerLevels = ['A级', 'B级', 'C级', 'D级'];
const customerIndustries = ['零售', '餐饮', '教育', '医疗', '金融', '房地产', '汽车', '家居', '其他'];

const defaultCustomers = [
  { name: '蓝海家居', contact: '张经理', phone: '138-0001-0001', preferredSlot: '08:00-09:00', historicalAmount: 3600, level: 'A级', industry: '家居' },
  { name: '北城眼镜', contact: '李总', phone: '139-0002-0002', preferredSlot: '18:00-19:00', historicalAmount: 2800, level: 'B级', industry: '零售' },
  { name: '云上烘焙', contact: '王店长', phone: '137-0003-0003', preferredSlot: '12:00-13:00', historicalAmount: 1600, level: 'C级', industry: '餐饮' },
];

const materialStorage = 'hxwl-61305-ad-materials';

const materialStatuses = ['待制作', '制作中', '审核中', '已交付', '已退回'];

const defaultMaterials = [];

const proposalStorage = 'hxwl-61305-proposal-plans';

const discountStrategies = [
  { key: 'none', label: '无折扣', description: '按原价计算' },
  { key: 'percent', label: '百分比折扣', description: '按总价百分比优惠' },
  { key: 'tiered', label: '阶梯折扣', description: '按播放总量分段计价' },
  { key: 'earlybird', label: '早鸟折扣', description: '距首播越早折扣越大' },
];

const tieredRules = [
  { min: 0, max: 20, rate: 1.0 },
  { min: 21, max: 50, rate: 0.95 },
  { min: 51, max: Infinity, rate: 0.90 },
];

const earlybirdRules = [
  { minDays: 14, rate: 0.90 },
  { minDays: 7, rate: 0.95 },
  { minDays: 0, rate: 1.0 },
];

const slotPriceTiers = {
  '07:00-08:00': 'standard',
  '08:00-09:00': 'premium',
  '12:00-13:00': 'standard',
  '18:00-19:00': 'premium',
  '21:00-22:00': 'standard',
};

const planTypeLabels = {
  concentrated: { name: '集中投放方案', desc: '聚焦黄金时段，每日高频播放', color: '#dc2626' },
  balanced: { name: '均衡投放方案', desc: '均匀分配时段和频次', color: '#2563eb' },
  spread: { name: '广覆盖方案', desc: '分散时段降低冲突，覆盖更多受众', color: '#059669' },
};

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

function loadProposals() {
  const raw = localStorage.getItem(proposalStorage);
  if (raw) {
    try { return JSON.parse(raw); }
    catch { return []; }
  }
  return [];
}

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateKey(dateKey) {
  const [year, month, day] = String(dateKey || '').split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

const today = localDateKey();

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function withIds(items) {
  return items.map((item) => ({ id: uid(), timeline: item.timeline || [{ status: item.status, at: today, by: '系统' }], ...item }));
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

function avg(numbers) {
  const valid = numbers.filter((value) => Number.isFinite(value));
  if (!valid.length) return 0;
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

function money(value) {
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', maximumFractionDigits: 0 }).format(value || 0);
}

function inNextDays(dateText, days) {
  if (!dateText) return false;
  const date = parseDateKey(dateText);
  const now = parseDateKey(today);
  const diff = (date.getTime() - now.getTime()) / 86400000;
  return diff >= 0 && diff <= days;
}

function latestTemp(item) {
  const temps = item.temps || [Number(item.temperature)];
  return temps[temps.length - 1];
}

function hasHotTemp(item) {
  const temps = item.temps || [Number(item.temperature)];
  return temps.some((value) => Number(value) > 2);
}

function priorityRank(value) {
  return { 危急: 0, 加急: 1, 常规: 2, 高: 0, 中: 1, 低: 2 }[value] ?? 9;
}

function hasOverlap(target, records) {
  if (!target.bed || !target.date || !target.start || !target.end) return false;
  return records.some((item) => item.id !== target.id && item.bed === target.bed && item.date === target.date && target.start < item.end && target.end > item.start);
}

const csvColumnMap = {
  '客户': 'client',
  '广告名称': 'adName',
  '投放日期': 'date',
  '时段': 'slot',
  '播放次数': 'plays',
  '合同金额': 'amount',
};

const requiredCsvColumns = ['客户', '广告名称', '投放日期', '时段', '播放次数', '合同金额'];

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return { rows: [], headers: [], missingHeaders: [] };

  const headers = lines[0].split(',').map((h) => h.trim());
  const knownHeaders = Object.keys(csvColumnMap);
  const missingHeaders = requiredCsvColumns.filter((h) => !headers.includes(h));

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim());
    const row = {};
    headers.forEach((header, idx) => {
      const key = csvColumnMap[header];
      if (key) row[key] = values[idx] || '';
    });
    const missingFields = requiredCsvColumns
      .filter((h) => !headers.includes(h) || !row[csvColumnMap[h]])
      .map((h) => h);
    rows.push({ ...row, _rowIndex: i, _missingFields: missingFields });
  }

  return { rows, headers, missingHeaders };
}

function statusClass(status) {
  const index = appConfig.statuses.indexOf(status);
  return ['status-a', 'status-b', 'status-c', 'status-d'][index] || 'status-a';
}

function getChannelById(channelId) {
  return channels.find((c) => c.id === channelId);
}

function getChannelColor(channelId) {
  const channel = getChannelById(channelId);
  return channel?.color || channels.find((c) => c.isDefault)?.color || '#2563eb';
}

function getChannelSlots(channelId) {
  const channel = getChannelById(channelId);
  return channel?.slots || channels.find((c) => c.isDefault)?.slots || [];
}

function getChannelInventory(channelId, inventory) {
  return inventory?.[channelId] || defaultInventory[channelId];
}

function getEnabledInventorySlots(channelId, inventory) {
  const inventorySlots = getChannelInventory(channelId, inventory)?.slots || [];
  const enabledSlots = inventorySlots
    .filter((slot) => slot.enabled !== false && Number(slot.capacity || 0) > 0)
    .map((slot) => slot.slot)
    .filter(Boolean);
  return enabledSlots.length > 0 ? enabledSlots : getChannelSlots(channelId);
}

function getInventorySlotConfig(channelId, slotName, inventory) {
  return getChannelInventory(channelId, inventory)?.slots?.find((slot) => slot.slot === slotName);
}

function getSlotCapacityState(channelId, slotName, count, inventory) {
  const slotConfig = getInventorySlotConfig(channelId, slotName, inventory);
  const capacity = Number(slotConfig?.capacity ?? 1);
  const isEnabled = slotConfig?.enabled !== false && capacity > 0;
  return {
    capacity,
    isEnabled,
    isOverCapacity: !isEnabled ? count > 0 : count > capacity,
  };
}

function App() {
  const [records, setRecords] = useState(loadRecords);
  const [selectedChannel, setSelectedChannel] = useState('channel-news');
  const [inventory, setInventory] = useState(loadInventory);
  const [inventoryModalOpen, setInventoryModalOpen] = useState(false);
  const [inventoryEditChannel, setInventoryEditChannel] = useState(null);
  const [form, setForm] = useState({ ...appConfig.defaultValues, channelId: 'channel-news' });
  const [filters, setFilters] = useState({ query: '', status: '全部', channel: '全部' });
  const [selected, setSelected] = useState(null);
  const [customers, setCustomers] = useState(loadCustomers);
  const [customerForm, setCustomerForm] = useState({ name: '', contact: '', phone: '', preferredSlot: '', historicalAmount: '', level: '', industry: '' });
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [importCsv, setImportCsv] = useState('');
  const [importResult, setImportResult] = useState(null);

  const [batchForm, setBatchForm] = useState({
    client: '',
    adName: '',
    channelId: 'channel-news',
    startDate: '',
    endDate: '',
    weekdays: [1, 2, 3, 4, 5],
    slots: [],
    playsPerDay: '4',
    slotPlays: {},
    totalAmount: '',
    status: '待确认',
  });
  const [batchPreview, setBatchPreview] = useState(null);
  const [batchConflictMode, setBatchConflictMode] = useState('skip');

  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [broadcastTarget, setBroadcastTarget] = useState(null);
  const [broadcastForm, setBroadcastForm] = useState({
    broadcastTime: '',
    plays: '1',
    remark: ''
  });
  const [broadcastFilter, setBroadcastFilter] = useState({ query: '', status: '全部', startDate: '', endDate: '' });
  const [broadcastDetail, setBroadcastDetail] = useState(null);
  const [analyticsTab, setAnalyticsTab] = useState('ranking');

  const [materials, setMaterials] = useState(loadMaterials);
  const [materialModalOpen, setMaterialModalOpen] = useState(false);
  const [materialTargetSchedule, setMaterialTargetSchedule] = useState(null);
  const [materialForm, setMaterialForm] = useState({
    copyTitle: '',
    durationSeconds: '',
    productionStatus: '待制作',
    deliveryDate: '',
    remarks: '',
    statusRemark: ''
  });
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [materialFilter, setMaterialFilter] = useState({ query: '', status: '全部', showUndeliveredOnly: false, showUpcomingUndeliveredOnly: true });
  const [materialDetail, setMaterialDetail] = useState(null);

  const [proposalForm, setProposalForm] = useState({
    client: '',
    adName: '',
    channelId: 'channel-news',
    startDate: '',
    endDate: '',
    weekdays: [1, 2, 3, 4, 5],
    slots: [],
    playsPerDay: '4',
    baseUnitPrice: '',
    discountStrategy: 'none',
    discountValue: '',
    status: '待确认',
  });
  const [proposals, setProposals] = useState(loadProposals);
  const [proposalPlans, setProposalPlans] = useState(null);
  const [selectedProposalPlan, setSelectedProposalPlan] = useState(null);
  const [proposalStep, setProposalStep] = useState('form');
  const [proposalConflictMode, setProposalConflictMode] = useState('skip');

  useEffect(() => {
    if (filters.channel !== '全部') {
      setSelectedChannel(filters.channel);
      const channelSlots = getEnabledInventorySlots(filters.channel, inventory);
      setForm((prev) => ({
        ...prev,
        channelId: filters.channel,
        slot: channelSlots.includes(prev.slot) ? prev.slot : channelSlots[0] || '',
      }));
      setBatchForm((prev) => ({ ...prev, channelId: filters.channel, slots: [], slotPlays: {} }));
    }
  }, [filters.channel, inventory]);

  useEffect(() => {
    setForm((prev) => {
      const channelId = prev.channelId || selectedChannel;
      const channelSlots = getEnabledInventorySlots(channelId, inventory);
      if (channelSlots.includes(prev.slot)) return prev;
      return { ...prev, slot: channelSlots[0] || '' };
    });
    setBatchForm((prev) => {
      const channelSlots = getEnabledInventorySlots(prev.channelId, inventory);
      const nextSlots = prev.slots.filter((slot) => channelSlots.includes(slot));
      if (nextSlots.length === prev.slots.length) return prev;
      const nextSlotPlays = { ...prev.slotPlays };
      prev.slots.forEach((s) => {
        if (!nextSlots.includes(s)) delete nextSlotPlays[s];
      });
      return { ...prev, slots: nextSlots, slotPlays: nextSlotPlays };
    });
  }, [inventory, selectedChannel]);

  function persist(next) {
    setRecords(next);
    localStorage.setItem(appConfig.storage, JSON.stringify(next));
  }

  function persistCustomers(next) {
    setCustomers(next);
    localStorage.setItem(customerStorage, JSON.stringify(next));
  }

  function persistMaterials(next) {
    setMaterials(next);
    localStorage.setItem(materialStorage, JSON.stringify(next));
  }

  function handlePersistInventory(next) {
    setInventory(next);
    persistInventory(next);
  }

  function openInventoryModal(channelId) {
    setInventoryEditChannel(channelId);
    setInventoryModalOpen(true);
  }

  function closeInventoryModal() {
    setInventoryModalOpen(false);
    setInventoryEditChannel(null);
  }

  function updateSlotCapacity(channelId, slotIndex, field, value) {
    const next = { ...inventory };
    if (!next[channelId]) {
      next[channelId] = { slots: [...defaultInventory[channelId].slots] };
    }
    next[channelId].slots = next[channelId].slots.map((slot, idx) => {
      if (idx === slotIndex) {
        return { ...slot, [field]: field === 'capacity' ? Number(value) : value };
      }
      return slot;
    });
    handlePersistInventory(next);
  }

  function addSlot(channelId) {
    const next = { ...inventory };
    if (!next[channelId]) {
      next[channelId] = { slots: [...defaultInventory[channelId].slots] };
    }
    next[channelId].slots = [...next[channelId].slots, { slot: '00:00-01:00', capacity: 3, enabled: true }];
    handlePersistInventory(next);
  }

  function removeSlot(channelId, slotIndex) {
    const next = { ...inventory };
    if (!next[channelId]) return;
    next[channelId].slots = next[channelId].slots.filter((_, idx) => idx !== slotIndex);
    handlePersistInventory(next);
  }

  function getSlotUsage(channelId, slotName, recordsList) {
    return recordsList.filter((r) => r.channelId === channelId && r.slot === slotName && !r.coPlay).length;
  }

  function getMaterialByScheduleId(scheduleId) {
    return materials.find((m) => m.scheduleId === scheduleId);
  }

  function getMaterialStatusClass(status) {
    const map = {
      '待制作': 'status-a',
      '制作中': 'status-b',
      '审核中': 'status-b',
      '已交付': 'status-c',
      '已退回': 'status-over'
    };
    return map[status] || 'status-a';
  }

  function isMaterialDelivered(material) {
    return material?.productionStatus === '已交付';
  }

  function isMaterialUndeliveredWarning(schedule, material) {
    if (schedule.status !== '已排期') return false;
    if (!material) return true;
    return !isMaterialDelivered(material);
  }

  function openMaterialModal(schedule, existingMaterial = null) {
    setMaterialTargetSchedule(schedule);
    setEditingMaterial(existingMaterial);
    setMaterialForm({
      copyTitle: existingMaterial?.copyTitle || schedule.adName || '',
      durationSeconds: existingMaterial?.durationSeconds || '',
      productionStatus: existingMaterial?.productionStatus || '待制作',
      deliveryDate: existingMaterial?.deliveryDate || '',
      remarks: existingMaterial?.remarks || '',
      statusRemark: ''
    });
    setMaterialModalOpen(true);
  }

  function closeMaterialModal() {
    setMaterialModalOpen(false);
    setMaterialTargetSchedule(null);
    setEditingMaterial(null);
    setMaterialForm({
      copyTitle: '',
      durationSeconds: '',
      productionStatus: '待制作',
      deliveryDate: '',
      remarks: '',
      statusRemark: ''
    });
  }

  function saveMaterial(event) {
    event.preventDefault();
    if (!materialTargetSchedule) return;

    const now = new Date().toISOString();
    const statusChange = editingMaterial?.productionStatus !== materialForm.productionStatus;
    const statusHistoryEntry = statusChange
      ? {
          status: materialForm.productionStatus,
          at: now,
          by: '操作员',
          remark: materialForm.statusRemark || ''
        }
      : null;

    if (editingMaterial) {
      const next = materials.map((m) => {
        if (m.id !== editingMaterial.id) return m;
        return {
          ...m,
          copyTitle: materialForm.copyTitle,
          durationSeconds: materialForm.durationSeconds,
          productionStatus: materialForm.productionStatus,
          deliveryDate: materialForm.deliveryDate,
          remarks: materialForm.remarks,
          updatedAt: now,
          statusHistory: statusChange
            ? [...(m.statusHistory || []), statusHistoryEntry]
            : m.statusHistory
        };
      });
      persistMaterials(next);
      const updated = next.find((m) => m.id === editingMaterial.id);
      if (materialDetail?.id === editingMaterial.id) setMaterialDetail(updated);
    } else {
      const newMaterial = {
        id: uid(),
        scheduleId: materialTargetSchedule.id,
        copyTitle: materialForm.copyTitle,
        durationSeconds: materialForm.durationSeconds,
        productionStatus: materialForm.productionStatus,
        deliveryDate: materialForm.deliveryDate,
        remarks: materialForm.remarks,
        createdAt: now,
        updatedAt: now,
        statusHistory: [
          {
            status: materialForm.productionStatus,
            at: now,
            by: '操作员',
            remark: materialForm.statusRemark || '创建素材记录'
          }
        ]
      };
      persistMaterials([newMaterial, ...materials]);
      if (materialDetail?.scheduleId === materialTargetSchedule.id) setMaterialDetail(newMaterial);
    }

    closeMaterialModal();
  }

  function removeMaterial(materialId) {
    if (!confirm('确定要删除这条素材记录吗？')) return;
    persistMaterials(materials.filter((m) => m.id !== materialId));
    if (materialDetail?.id === materialId) setMaterialDetail(null);
  }

  function getActualPlays(item) {
    if (!item.broadcastLogs || item.broadcastLogs.length === 0) return 0;
    return item.broadcastLogs.reduce((sum, log) => sum + Number(log.plays || 0), 0);
  }

  function getBroadcastStatus(item) {
    const planned = Number(item.plays || 0);
    const actual = getActualPlays(item);
    if (actual === 0) return '未开始';
    if (actual < planned) return '未完成';
    if (actual === planned) return '已完成';
    return '超播';
  }

  function getBroadcastStatusClass(status) {
    const map = {
      '未开始': 'status-a',
      '未完成': 'status-b',
      '已完成': 'status-c',
      '超播': 'status-over'
    };
    return map[status] || 'status-a';
  }

  function openBroadcastModal(item) {
    setBroadcastTarget(item);
    const now = new Date();
    const timeStr = now.toISOString().slice(0, 16);
    setBroadcastForm({ broadcastTime: timeStr, plays: '1', remark: '' });
    setBroadcastModalOpen(true);
  }

  function closeBroadcastModal() {
    setBroadcastModalOpen(false);
    setBroadcastTarget(null);
    setBroadcastForm({ broadcastTime: '', plays: '1', remark: '' });
  }

  function addBroadcastLog(event) {
    event.preventDefault();
    if (!broadcastTarget || !broadcastForm.broadcastTime) return;

    const plays = Number(broadcastForm.plays || 0);
    if (plays <= 0) {
      alert('播出次数必须大于0');
      return;
    }

    const newLog = {
      id: uid(),
      broadcastTime: broadcastForm.broadcastTime,
      plays: String(plays),
      remark: broadcastForm.remark || '',
      createdAt: new Date().toISOString()
    };

    const next = records.map((item) => {
      if (item.id !== broadcastTarget.id) return item;

      const updatedLogs = [...(item.broadcastLogs || []), newLog];
      const actualPlays = updatedLogs.reduce((sum, log) => sum + Number(log.plays || 0), 0);
      const plannedPlays = Number(item.plays || 0);
      const wasCompleted = item.status === '已播完';
      const nowCompleted = actualPlays >= plannedPlays;

      let updatedItem = {
        ...item,
        broadcastLogs: updatedLogs
      };

      if (nowCompleted && !wasCompleted) {
        updatedItem.status = '已播完';
        updatedItem.timeline = [
          ...(item.timeline || []),
          { status: '已播完', at: today, by: '系统自动（播出达标）' }
        ];
      }

      return updatedItem;
    });

    persist(next);
    const updatedTarget = next.find((item) => item.id === broadcastTarget.id);
    if (selected?.id === broadcastTarget.id) setSelected(updatedTarget);
    if (broadcastDetail?.id === broadcastTarget.id) setBroadcastDetail(updatedTarget);
    closeBroadcastModal();
  }

  function removeBroadcastLog(itemId, logId) {
    const next = records.map((item) => {
      if (item.id !== itemId) return item;

      const updatedLogs = (item.broadcastLogs || []).filter((log) => log.id !== logId);
      const actualPlays = updatedLogs.reduce((sum, log) => sum + Number(log.plays || 0), 0);
      const plannedPlays = Number(item.plays || 0);
      const wasCompleted = item.status === '已播完';
      const stillCompleted = actualPlays >= plannedPlays;

      let updatedItem = {
        ...item,
        broadcastLogs: updatedLogs
      };

      if (!stillCompleted && wasCompleted) {
        updatedItem.status = '已排期';
        updatedItem.timeline = [
          ...(item.timeline || []),
          { status: '已排期', at: today, by: '系统自动（播出不足）' }
        ];
      }

      return updatedItem;
    });

    persist(next);
    const updatedItem = next.find((item) => item.id === itemId);
    if (selected?.id === itemId) setSelected(updatedItem);
    if (broadcastDetail?.id === itemId) setBroadcastDetail(updatedItem);
  }

  function addCustomer(event) {
    event.preventDefault();
    if (!customerForm.name.trim()) return;
    const newCustomer = { id: uid(), ...customerForm, historicalAmount: Number(customerForm.historicalAmount || 0) };
    persistCustomers([...customers, newCustomer]);
    setCustomerForm({ name: '', contact: '', phone: '', preferredSlot: '', historicalAmount: '', level: '', industry: '' });
  }

  function startEditCustomer(customer) {
    setEditingCustomer(customer.id);
    setCustomerForm({
      name: customer.name,
      contact: customer.contact,
      phone: customer.phone,
      preferredSlot: customer.preferredSlot || '',
      historicalAmount: customer.historicalAmount || '',
      level: customer.level || '',
      industry: customer.industry || '',
    });
  }

  function saveEditCustomer(event) {
    event.preventDefault();
    if (!customerForm.name.trim()) return;
    const next = customers.map((c) => c.id === editingCustomer ? {
      ...c,
      ...customerForm,
      historicalAmount: Number(customerForm.historicalAmount || 0)
    } : c);
    persistCustomers(next);
    setEditingCustomer(null);
    setCustomerForm({ name: '', contact: '', phone: '', preferredSlot: '', historicalAmount: '', level: '', industry: '' });
  }

  function cancelEditCustomer() {
    setEditingCustomer(null);
    setCustomerForm({ name: '', contact: '', phone: '', preferredSlot: '', historicalAmount: '', level: '', industry: '' });
  }

  function removeCustomer(id) {
    persistCustomers(customers.filter((c) => c.id !== id));
    if (editingCustomer === id) cancelEditCustomer();
  }

  function handleClientSelect(event) {
    const name = event.target.value;
    if (!name) return;
    const customer = customers.find((c) => c.name === name);
    if (customer) {
      setForm({ ...form, client: customer.name, slot: customer.preferredSlot || form.slot });
    }
  }

  function customerAmount(name) {
    return records.filter((r) => r.client === name).reduce((sum, r) => sum + Number(r.amount || 0), 0);
  }

  function addRecord(event) {
    event.preventDefault();
    const targetChannelId = form.channelId || selectedChannel;
    const targetSlot = form.slot;
    const targetDate = form.date;

    if (targetChannelId && targetSlot && targetDate) {
      const currentUsage = records.filter(
        (r) => r.channelId === targetChannelId && r.date === targetDate && r.slot === targetSlot && !r.coPlay
      ).length;
      const { capacity, isEnabled } = getSlotCapacityState(targetChannelId, targetSlot, currentUsage, inventory);

      if (!isEnabled) {
        const confirmAdd = confirm(`警告：频道「${getChannelById(targetChannelId)?.name}」的时段「${targetSlot}」已被禁用，是否仍要添加？`);
        if (!confirmAdd) return;
      } else if (currentUsage >= capacity) {
        const confirmAdd = confirm(
          `警告：频道「${getChannelById(targetChannelId)?.name}」时段「${targetSlot}」容量为${capacity}条，当前已有${currentUsage}条记录，是否继续添加？`
        );
        if (!confirmAdd) return;
      }
    }

    const nextRecord = {
      id: uid(),
      ...form,
      channelId: targetChannelId,
      status: form.status || appConfig.primaryStatus,
      createdAt: new Date().toISOString(),
      timeline: [{ status: form.status || appConfig.primaryStatus, at: today, by: '录入' }]
    };

    if (appConfig.chart) {
      const temp = Number(nextRecord.temperature || 0);
      nextRecord.temps = [temp];
      if (temp > 2) nextRecord.status = '异常';
    }

    persist([nextRecord, ...records]);
    const channelSlots = getEnabledInventorySlots(targetChannelId, inventory);
    setForm({ ...appConfig.defaultValues, channelId: targetChannelId, slot: channelSlots[0] || '' });
    setSelected(nextRecord);
  }

  function updateStatus(id, status) {
    const next = records.map((item) => item.id === id ? {
      ...item,
      status,
      timeline: [...(item.timeline || []), { status, at: today, by: '操作员' }]
    } : item);
    persist(next);
    if (selected?.id === id) setSelected(next.find((item) => item.id === id));
  }

  function removeRecord(id) {
    const next = records.filter((item) => item.id !== id);
    persist(next);
    if (selected?.id === id) setSelected(null);
  }

  function duplicateRecord(item) {
    const copied = { ...item, id: uid(), status: appConfig.primaryStatus, timeline: [{ status: appConfig.primaryStatus, at: today, by: '复制' }] };
    persist([copied, ...records]);
    setSelected(copied);
  }

  function addTemperature(item) {
    const value = Number(prompt('录入新的温度读数'));
    if (!Number.isFinite(value)) return;
    const next = records.map((record) => record.id === item.id ? {
      ...record,
      temps: [...(record.temps || []), value],
      temperature: String(value),
      status: value > 2 ? '异常' : record.status
    } : record);
    persist(next);
    setSelected(next.find((record) => record.id === item.id));
  }

  const filteredRecords = useMemo(() => {
    return records
      .filter((item) => filters.channel === '全部' || item.channelId === filters.channel)
      .filter((item) => !filters.query || `${item.client}${item.adName}`.includes(filters.query))
      .filter((item) => filters.status === '全部' || item.status === filters.status)
      .filter((item) => !selectedDate || item.date === selectedDate)
      .sort((a, b) => {
        if (appConfig.sort === 'priority') {
          const rank = priorityRank(a.priority) - priorityRank(b.priority);
          if (rank !== 0) return rank;
        }
        const aDate = a[appConfig.dateKey] || a.sentAt || a.createdAt || '';
        const bDate = b[appConfig.dateKey] || b.sentAt || b.createdAt || '';
        return String(aDate).localeCompare(String(bDate));
      });
  }, [records, filters, selectedDate]);

  const groupedByDate = useMemo(() => {
    return filteredRecords.reduce((acc, item) => {
      const key = item[appConfig.dateKey] || item.date || item.enrollDate || '未排期';
      (acc[key] ||= []).push(item);
      return acc;
    }, {});
  }, [filteredRecords]);

  const groupedByDateSlot = useMemo(() => {
    const result = {};
    filteredRecords.forEach((item) => {
      const dateKey = item.date || '未排期';
      const slotKey = item.slot || '未排期';
      if (!result[dateKey]) result[dateKey] = {};
      if (!result[dateKey][slotKey]) result[dateKey][slotKey] = [];
      result[dateKey][slotKey].push(item);
    });
    return result;
  }, [filteredRecords]);

  const directory = useMemo(() => {
    return records.reduce((acc, item) => {
      const key = item.issue || '未分类';
      (acc[key] ||= []).push(item);
      return acc;
    }, {});
  }, [records]);

  const weekDays = useMemo(() => {
    const baseDate = parseDateKey(today);
    baseDate.setDate(baseDate.getDate() + weekOffset * 7);
    const dayOfWeek = baseDate.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(baseDate);
    monday.setDate(baseDate.getDate() + mondayOffset);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = localDateKey(d);
      days.push({
        date: dateStr,
        dayName: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()],
        dayNum: d.getDate(),
        isToday: dateStr === today,
      });
    }
    return days;
  }, [weekOffset, today]);

  const weekRangeLabel = useMemo(() => {
    if (weekDays.length === 0) return '';
    const first = weekDays[0];
    const last = weekDays[6];
    const f = new Date(first.date);
    const l = new Date(last.date);
    return `${f.getMonth() + 1}月${f.getDate()}日 - ${l.getMonth() + 1}月${l.getDate()}日`;
  }, [weekDays]);

  const dailyStats = useMemo(() => {
    const stats = {};
    const sourceRecords = filters.channel === '全部' ? records : records.filter((r) => r.channelId === filters.channel);
    sourceRecords.forEach((item) => {
      const d = item.date;
      if (!stats[d]) {
        stats[d] = { count: 0, plays: 0, amount: 0 };
      }
      stats[d].count += 1;
      stats[d].plays += Number(item.plays || 0);
      stats[d].amount += Number(item.amount || 0);
    });
    return stats;
  }, [records, filters.channel]);

  const conflictGroups = useMemo(() => {
    const slotMap = {};
    records.forEach((item) => {
      if (!item.date || !item.slot || !item.channelId) return;
      const key = `${item.channelId}::${item.date}::${item.slot}`;
      (slotMap[key] ||= []).push(item);
    });
    const groups = [];
    Object.entries(slotMap).forEach(([key, items]) => {
      const nonCoPlay = items.filter((r) => !r.coPlay);
      const [channelId, date, slot] = key.split('::');
      const { capacity, isEnabled, isOverCapacity } = getSlotCapacityState(channelId, slot, nonCoPlay.length, inventory);
      if (isOverCapacity) {
        const totalPlays = nonCoPlay.reduce((sum, r) => sum + Number(r.plays || 0), 0);
        const totalAmount = nonCoPlay.reduce((sum, r) => sum + Number(r.amount || 0), 0);
        const clients = [...new Set(nonCoPlay.map((r) => r.client))];
        const channel = getChannelById(channelId);
        groups.push({
          key,
          channelId,
          channelName: channel?.name || '未知频道',
          channelColor: channel?.color || '#666',
          date,
          slot,
          items: nonCoPlay,
          totalPlays,
          totalAmount,
          clients,
          conflictCount: nonCoPlay.length,
          capacity,
          isEnabled,
          conflictType: isEnabled ? 'overcapacity' : 'disabled'
        });
      }
    });
    groups.sort((a, b) => a.channelId.localeCompare(b.channelId) || a.date.localeCompare(b.date) || a.slot.localeCompare(b.slot));
    return groups;
  }, [records, inventory]);

  const isConflicted = useMemo(() => {
    const set = new Set();
    conflictGroups.forEach((g) => g.items.forEach((item) => set.add(item.id)));
    return set;
  }, [conflictGroups]);

  const clientRankingStats = useMemo(() => {
    const map = {};
    filteredRecords.forEach((item) => {
      const client = item.client || '未命名客户';
      if (!map[client]) {
        map[client] = {
          client,
          amount: 0,
          plays: 0,
          pendingCount: 0,
          conflictCount: 0,
          recordCount: 0,
        };
      }
      map[client].amount += Number(item.amount || 0);
      map[client].plays += Number(item.plays || 0);
      map[client].recordCount += 1;
      if (item.status === '待确认') map[client].pendingCount += 1;
      if (isConflicted.has(item.id)) map[client].conflictCount += 1;
    });
    const list = Object.values(map);
    list.sort((a, b) => b.amount - a.amount);
    return list;
  }, [filteredRecords, isConflicted]);

  const slotUtilizationStats = useMemo(() => {
    let slotOptions;
    if (filters.channel === '全部') {
      const allSlots = new Set();
      channels.forEach((ch) => getEnabledInventorySlots(ch.id, inventory).forEach((s) => allSlots.add(s)));
      slotOptions = Array.from(allSlots);
    } else {
      slotOptions = getEnabledInventorySlots(filters.channel, inventory);
    }
    const map = {};
    slotOptions.forEach((slot) => {
      map[slot] = { slot, recordCount: 0, plays: 0, amount: 0, clients: new Set(), conflictCount: 0 };
    });
    filteredRecords.forEach((item) => {
      const slot = item.slot;
      if (!map[slot]) {
        map[slot] = { slot, recordCount: 0, plays: 0, amount: 0, clients: new Set(), conflictCount: 0 };
      }
      map[slot].recordCount += 1;
      map[slot].plays += Number(item.plays || 0);
      map[slot].amount += Number(item.amount || 0);
      if (item.client) map[slot].clients.add(item.client);
      if (isConflicted.has(item.id)) map[slot].conflictCount += 1;
    });
    const totalRecords = filteredRecords.length;
    return slotOptions.map((slot) => {
      const s = map[slot];
      return {
        slot,
        recordCount: s.recordCount,
        plays: s.plays,
        amount: s.amount,
        clientCount: s.clients.size,
        conflictCount: s.conflictCount,
        utilization: totalRecords > 0 ? (s.recordCount / totalRecords) * 100 : 0,
      };
    });
  }, [filteredRecords, isConflicted, filters.channel, inventory]);

  const last7DaysRevenue = useMemo(() => {
    const baseDate = parseDateKey(today);
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() - i);
      const dateStr = localDateKey(d);
      days.push({
        date: dateStr,
        dayName: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()],
        dayNum: d.getDate(),
        amount: 0,
        recordCount: 0,
        plays: 0,
      });
    }
    filteredRecords.forEach((item) => {
      if (!item.date) return;
      const day = days.find((d) => d.date === item.date);
      if (day) {
        day.amount += Number(item.amount || 0);
        day.recordCount += 1;
        day.plays += Number(item.plays || 0);
      }
    });
    return days;
  }, [filteredRecords, today]);

  const analyticsHasData = useMemo(() => {
    return filteredRecords.length > 0;
  }, [filteredRecords]);

  const materialListData = useMemo(() => {
    return records
      .filter((item) => !materialFilter.query || `${item.client}${item.adName}`.includes(materialFilter.query))
      .filter((item) => {
        if (materialFilter.status === '全部') return true;
        const material = getMaterialByScheduleId(item.id);
        return material?.productionStatus === materialFilter.status;
      })
      .filter((item) => {
        if (!materialFilter.showUndeliveredOnly) return true;
        const material = getMaterialByScheduleId(item.id);
        return isMaterialUndeliveredWarning(item, material);
      })
      .filter((item) => {
        if (!materialFilter.showUpcomingUndeliveredOnly) return true;
        if (item.status !== '已排期') return false;
        if (!inNextDays(item.date, 3)) return false;
        const material = getMaterialByScheduleId(item.id);
        return !isMaterialDelivered(material);
      })
      .sort((a, b) => {
        const matA = getMaterialByScheduleId(a.id);
        const matB = getMaterialByScheduleId(b.id);
        const warnA = isMaterialUndeliveredWarning(a, matA) ? 0 : 1;
        const warnB = isMaterialUndeliveredWarning(b, matB) ? 0 : 1;
        if (warnA !== warnB) return warnA - warnB;
        return (b.date || '').localeCompare(a.date || '');
      });
  }, [records, materials, materialFilter]);

  const materialMetrics = useMemo(() => {
    const scheduledCount = records.filter((r) => r.status === '已排期').length;
    const withMaterial = records.filter((r) => r.status === '已排期' && getMaterialByScheduleId(r.id)).length;
    const deliveredCount = records.filter((r) => {
      const mat = getMaterialByScheduleId(r.id);
      return r.status === '已排期' && isMaterialDelivered(mat);
    }).length;
    const undeliveredCount = scheduledCount - deliveredCount;
    const upcomingUndeliveredCount = records.filter((r) => {
      if (r.status !== '已排期') return false;
      if (!inNextDays(r.date, 3)) return false;
      const mat = getMaterialByScheduleId(r.id);
      return !isMaterialDelivered(mat);
    }).length;
    return [
      { label: '已排期广告', value: scheduledCount },
      { label: '已绑定素材', value: withMaterial },
      { label: '已交付', value: deliveredCount },
      { label: '待交付', value: undeliveredCount },
      { label: '临近投放未交付', value: upcomingUndeliveredCount, highlight: upcomingUndeliveredCount > 0 }
    ];
  }, [records, materials]);

  const broadcastListData = useMemo(() => {
    return records
      .filter((item) => !broadcastFilter.query || `${item.client}${item.adName}`.includes(broadcastFilter.query))
      .filter((item) => {
        if (broadcastFilter.status === '全部') return true;
        return getBroadcastStatus(item) === broadcastFilter.status;
      })
      .filter((item) => {
        if (!broadcastFilter.startDate && !broadcastFilter.endDate) return true;
        const itemDate = item.date;
        if (!itemDate) return false;
        if (broadcastFilter.startDate && itemDate < broadcastFilter.startDate) return false;
        if (broadcastFilter.endDate && itemDate > broadcastFilter.endDate) return false;
        return true;
      })
      .filter((item) => item.status !== '待确认')
      .sort((a, b) => {
        const statusOrder = { '未开始': 0, '未完成': 1, '超播': 2, '已完成': 3 };
        const orderA = statusOrder[getBroadcastStatus(a)] ?? 9;
        const orderB = statusOrder[getBroadcastStatus(b)] ?? 9;
        if (orderA !== orderB) return orderA - orderB;
        return (b.date || '').localeCompare(a.date || '');
      });
  }, [records, broadcastFilter]);

  useEffect(() => {
    if (broadcastDetail) {
      const stillInList = broadcastListData.some((item) => item.id === broadcastDetail.id);
      if (!stillInList) {
        setBroadcastDetail(null);
      }
    }
  }, [broadcastListData, broadcastDetail]);

  const hasBroadcastFilter = broadcastFilter.query || broadcastFilter.status !== '全部' || broadcastFilter.startDate || broadcastFilter.endDate;

  const channelRecords = useMemo(() => {
    return filters.channel === '全部' ? records : records.filter((r) => r.channelId === filters.channel);
  }, [records, filters.channel]);

  const metrics = [
    { label: "排期数", value: channelRecords.length },
    { label: "今日广告", value: channelRecords.filter((item) => item.date === today).length },
    { label: "冲突", value: filters.channel === '全部' ? conflictGroups.length : conflictGroups.filter((g) => g.channelId === filters.channel).length },
    { label: "合同额", value: money(channelRecords.reduce((sum, item) => sum + Number(item.amount || 0), 0)) },
  ];

  function toggleDateFilter(date) {
    if (selectedDate === date) {
      setSelectedDate(null);
    } else {
      setSelectedDate(date);
    }
  }

  function handleParseCsv() {
    const result = parseCsv(importCsv);
    const conflicts = [];
    const importChannelId = filters.channel === '全部' ? 'channel-news' : filters.channel;
    result.rows.forEach((row, idx) => {
      if (row.date && row.slot) {
        const existingConflict = records.some(
          (r) => r.channelId === importChannelId && r.date === row.date && r.slot === row.slot && !r.coPlay
        );
        const internalConflict = result.rows.some(
          (r, j) => j !== idx && r.date === row.date && r.slot === row.slot
        );
        if (existingConflict || internalConflict) {
          conflicts.push({ rowIndex: idx, date: row.date, slot: row.slot });
        }
      }
    });
    setImportResult({ ...result, conflicts });
  }

  function handleConfirmImport() {
    if (!importResult || !importResult.rows.length) return;
    const importChannelId = filters.channel === '全部' ? 'channel-news' : filters.channel;
    const newRecords = importResult.rows.map((row) => ({
      id: uid(),
      client: row.client || '',
      adName: row.adName || '',
      channelId: importChannelId,
      date: row.date || '',
      slot: row.slot || '',
      plays: row.plays || '',
      amount: row.amount || '',
      status: appConfig.primaryStatus,
      createdAt: new Date().toISOString(),
      timeline: [{ status: appConfig.primaryStatus, at: today, by: '导入' }],
    }));
    persist([...newRecords, ...records]);
    setImportCsv('');
    setImportResult(null);
  }

  function handleClearImport() {
    setImportCsv('');
    setImportResult(null);
  }

  function getDatesInRange(startDate, endDate, weekdays) {
    const dates = [];
    const start = parseDateKey(startDate);
    const end = parseDateKey(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return dates;
    const current = new Date(start);
    while (current <= end) {
      const dayOfWeek = current.getDay();
      if (weekdays.includes(dayOfWeek)) {
        dates.push(localDateKey(current));
      }
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }

  function distributeTotalAmount(totalAmount, totalRecords) {
    if (!totalRecords) return [];
    const total = totalAmount && Number(totalAmount) > 0 ? Math.round(Number(totalAmount)) : 0;
    const base = Math.floor(total / totalRecords);
    const remainder = total % totalRecords;
    return Array.from({ length: totalRecords }, (_, index) => String(base + (index < remainder ? 1 : 0)));
  }

  function getEffectiveSlotPlays(slot, slots, slotPlays, playsPerDay) {
    const customVal = slotPlays && slotPlays[slot];
    if (customVal != null && customVal !== '' && Number(customVal) > 0) {
      return String(Math.max(1, Math.round(Number(customVal))));
    }
    const total = playsPerDay && Number(playsPerDay) > 0 ? Number(playsPerDay) : slots.length;
    return slots.length > 0
      ? String(Math.max(1, Math.round(total / slots.length)))
      : '1';
  }

  function generateBatchPreview() {
    const { client, adName, channelId, startDate, endDate, weekdays, slots, playsPerDay, slotPlays, totalAmount, status } = batchForm;

    if (!client.trim() || !adName.trim() || !startDate || !endDate || slots.length === 0) {
      alert('请填写客户、广告名称、日期范围并选择至少一个时段');
      return;
    }

    const dates = getDatesInRange(startDate, endDate, weekdays);
    if (dates.length === 0) {
      alert('所选日期范围内没有符合条件的投放日期');
      return;
    }

    const totalRecords = dates.length * slots.length;
    const amountValues = distributeTotalAmount(totalAmount, totalRecords);

    const previewRows = [];
    let rowIndex = 0;
    dates.forEach((date, dateIdx) => {
      slots.forEach((slot, slotIdx) => {
        const key = `${channelId}::${date}::${slot}`;
        const existingRecords = records.filter((r) => r.channelId === channelId && r.date === date && r.slot === slot && !r.coPlay);
        const usageWithPreview = existingRecords.length + 1;
        const capacityState = getSlotCapacityState(channelId, slot, usageWithPreview, inventory);
        const hasConflict = capacityState.isOverCapacity;
        const slotPlayCount = getEffectiveSlotPlays(slot, slots, slotPlays, playsPerDay);
        previewRows.push({
          previewId: `p-${dateIdx}-${slotIdx}`,
          client,
          adName,
          channelId,
          date,
          slot,
          plays: slotPlayCount,
          amount: amountValues[rowIndex] || '0',
          status,
          hasConflict,
          conflictWith: existingRecords.map((r) => ({
            id: r.id,
            client: r.client,
            adName: r.adName,
          })),
          capacity: capacityState.capacity,
        });
        rowIndex += 1;
      });
    });

    const conflictCount = previewRows.filter((r) => r.hasConflict).length;
    const normalCount = previewRows.length - conflictCount;
    const amountNumbers = previewRows.map((r) => Number(r.amount || 0));
    const minAmount = Math.min(...amountNumbers);
    const maxAmount = Math.max(...amountNumbers);
    const playsNumbers = previewRows.map((r) => Number(r.plays || 0));
    const minPlays = Math.min(...playsNumbers);
    const maxPlays = Math.max(...playsNumbers);

    setBatchPreview({
      rows: previewRows,
      totalCount: previewRows.length,
      normalCount,
      conflictCount,
      totalAmount: amountNumbers.reduce((sum, value) => sum + value, 0),
      totalPlays: playsNumbers.reduce((sum, v) => sum + v, 0),
      dates,
      slots,
      perRecordAmount: minAmount === maxAmount ? money(minAmount) : `${money(minAmount)}-${money(maxAmount)}`,
      perRecordPlays: minPlays === maxPlays ? String(minPlays) : `${minPlays}-${maxPlays}`,
      slotPlaysMap: slots.reduce((acc, s) => { acc[s] = getEffectiveSlotPlays(s, slots, slotPlays, playsPerDay); return acc; }, {}),
    });
  }

  function clearBatchPreview() {
    setBatchPreview(null);
  }

  function confirmBatchCreate() {
    if (!batchPreview || batchPreview.rows.length === 0) return;

    const rowsToCreate = batchConflictMode === 'skip'
      ? batchPreview.rows.filter((r) => !r.hasConflict)
      : batchPreview.rows;

    if (rowsToCreate.length === 0) {
      alert('没有可创建的记录');
      return;
    }

    const newRecords = rowsToCreate.map((row) => ({
      id: uid(),
      client: row.client,
      adName: row.adName,
      channelId: row.channelId || batchForm.channelId,
      date: row.date,
      slot: row.slot,
      plays: row.plays,
      amount: row.amount,
      status: row.status || appConfig.primaryStatus,
      createdAt: new Date().toISOString(),
      timeline: [{ status: row.status || appConfig.primaryStatus, at: today, by: '批量生成' }],
      batchFlag: batchConflictMode === 'create' && row.hasConflict ? true : false,
    }));

    persist([...newRecords, ...records]);
    setBatchPreview(null);
    setBatchForm({
      client: '',
      adName: '',
      channelId: batchForm.channelId,
      startDate: '',
      endDate: '',
      weekdays: [1, 2, 3, 4, 5],
      slots: [],
      playsPerDay: '4',
      slotPlays: {},
      totalAmount: '',
      status: '待确认',
    });
  }

  function toggleWeekday(day) {
    setBatchForm((prev) => {
      const exists = prev.weekdays.includes(day);
      return {
        ...prev,
        weekdays: exists
          ? prev.weekdays.filter((d) => d !== day)
          : [...prev.weekdays, day].sort(),
      };
    });
  }

  function toggleSlot(slot) {
    setBatchForm((prev) => {
      const exists = prev.slots.includes(slot);
      const nextSlots = exists
        ? prev.slots.filter((s) => s !== slot)
        : [...prev.slots, slot];
      const nextSlotPlays = { ...prev.slotPlays };
      if (exists) {
        delete nextSlotPlays[slot];
      }
      return {
        ...prev,
        slots: nextSlots,
        slotPlays: nextSlotPlays,
      };
    });
  }

  function handleBatchClientSelect(event) {
    const name = event.target.value;
    if (!name) return;
    const customer = customers.find((c) => c.name === name);
    if (customer) {
      const nextSlots = customer.preferredSlot && !batchForm.slots.includes(customer.preferredSlot)
        ? [...batchForm.slots, customer.preferredSlot]
        : batchForm.slots;
      setBatchForm({
        ...batchForm,
        client: customer.name,
        slots: nextSlots,
      });
    }
  }

  function persistProposals(next) {
    setProposals(next);
    localStorage.setItem(proposalStorage, JSON.stringify(next));
  }

  function calculateDiscount(totalPlays, baseAmount, strategy, discountValue, firstPlayDate) {
    const originalAmount = baseAmount * totalPlays;
    if (strategy === 'none') {
      return { originalAmount, discountRate: 1, discountAmount: 0, finalAmount: originalAmount };
    }
    if (strategy === 'percent') {
      const pct = Math.min(100, Math.max(0, Number(discountValue || 0)));
      const discountRate = (100 - pct) / 100;
      const discountAmount = Math.round(originalAmount * (pct / 100));
      return { originalAmount, discountRate, discountAmount, finalAmount: originalAmount - discountAmount };
    }
    if (strategy === 'tiered') {
      let finalAmount = 0;
      let remaining = totalPlays;
      for (const rule of tieredRules) {
        if (remaining <= 0) break;
        const rangeSize = rule.max === Infinity ? remaining : rule.max - rule.min;
        const applicable = Math.min(remaining, rangeSize);
        finalAmount += baseAmount * applicable * rule.rate;
        remaining -= applicable;
      }
      const discountAmount = originalAmount - Math.round(finalAmount);
      const discountRate = originalAmount > 0 ? finalAmount / originalAmount : 1;
      return { originalAmount, discountRate, discountAmount, finalAmount: Math.round(finalAmount) };
    }
    if (strategy === 'earlybird') {
      if (!firstPlayDate) {
        return { originalAmount, discountRate: 1, discountAmount: 0, finalAmount: originalAmount };
      }
      const firstDate = parseDateKey(firstPlayDate);
      const nowDate = parseDateKey(today);
      const daysAhead = Math.floor((firstDate.getTime() - nowDate.getTime()) / 86400000);
      let rate = 1;
      for (const rule of earlybirdRules) {
        if (daysAhead >= rule.minDays) {
          rate = rule.rate;
          break;
        }
      }
      const discountAmount = Math.round(originalAmount * (1 - rate));
      return { originalAmount, discountRate: rate, discountAmount, finalAmount: originalAmount - discountAmount };
    }
    return { originalAmount, discountRate: 1, discountAmount: 0, finalAmount: originalAmount };
  }

  function assessConflictRisk(conflictCount, totalCount) {
    if (totalCount === 0) return { level: 'low', conflictCount: 0, totalCount: 0, ratio: 0 };
    const ratio = conflictCount / totalCount;
    let level = 'low';
    if (ratio === 0) level = 'low';
    else if (ratio <= 0.3) level = 'medium';
    else level = 'high';
    return { level, conflictCount, totalCount, ratio: Math.round(ratio * 100) / 100 };
  }

  function assessMaterialRisk(firstPlayDate, client, adName) {
    let dateRisk = 'high';
    if (firstPlayDate) {
      const firstDate = parseDateKey(firstPlayDate);
      const nowDate = parseDateKey(today);
      const daysAhead = Math.floor((firstDate.getTime() - nowDate.getTime()) / 86400000);
      if (daysAhead >= 14) dateRisk = 'low';
      else if (daysAhead >= 7) dateRisk = 'medium';
    }

    let materialStatusRisk = 'high';
    let materialDetail = null;
    if (client && adName) {
      const matchedMaterials = materials.filter((m) => {
        const linkedSchedule = records.find((r) => r.id === m.scheduleId);
        const materialClient = m.client || linkedSchedule?.client;
        const materialAdName = m.adName || linkedSchedule?.adName || m.copyTitle;
        return materialClient === client && materialAdName === adName;
      });
      if (matchedMaterials.length > 0) {
        const best = matchedMaterials.reduce((prev, curr) => {
          const priority = { '已交付': 4, '审核中': 3, '制作中': 2, '待制作': 1, '已退回': 0 };
          return (priority[curr.productionStatus] || 0) > (priority[prev.productionStatus] || 0) ? curr : prev;
        });
        const linkedSchedule = records.find((r) => r.id === best.scheduleId);
        materialDetail = {
          id: best.id,
          status: best.productionStatus,
          copyTitle: best.copyTitle,
          scheduleId: best.scheduleId,
          client: best.client || linkedSchedule?.client,
          adName: best.adName || linkedSchedule?.adName || best.copyTitle,
        };
        switch (best.productionStatus) {
          case '已交付':
            materialStatusRisk = 'low';
            break;
          case '审核中':
          case '制作中':
            materialStatusRisk = 'medium';
            break;
          case '待制作':
          case '已退回':
          default:
            materialStatusRisk = 'high';
        }
      }
    }

    const riskLevels = { low: 0, medium: 1, high: 2 };
    const finalRisk = materialDetail?.status === '已交付'
      ? riskLevels.low
      : Math.max(riskLevels[dateRisk], riskLevels[materialStatusRisk]);
    return {
      level: ['low', 'medium', 'high'][finalRisk],
      dateRisk,
      materialStatusRisk,
      materialDetail,
      daysAhead: firstPlayDate
        ? Math.floor((parseDateKey(firstPlayDate).getTime() - parseDateKey(today).getTime()) / 86400000)
        : null,
    };
  }

  function riskLevelClass(level) {
    const l = typeof level === 'object' && level !== null ? level.level : level;
    return { low: 'risk-low', medium: 'risk-medium', high: 'risk-high' }[l] || 'risk-low';
  }

  function riskLevelLabel(level) {
    const l = typeof level === 'object' && level !== null ? level.level : level;
    return { low: '低', medium: '中', high: '高' }[l] || '低';
  }

  function buildPlanRows(channelId, dates, slots, playsPerSlot, client, adName) {
    const rows = [];
    const dateSlotCounter = {};
    dates.forEach((date, dateIdx) => {
      slots.forEach((slot, slotIdx) => {
        const key = `${date}::${slot}`;
        const planCountOnDateSlot = (dateSlotCounter[key] || 0) + 1;
        const existingOnDateSlot = records.filter(
          (r) => r.channelId === channelId && r.date === date && r.slot === slot && !r.coPlay
        );
        const totalCount = existingOnDateSlot.length + planCountOnDateSlot;
        const capacityState = getSlotCapacityState(channelId, slot, totalCount, inventory);
        const row = {
          previewId: `pp-${dateIdx}-${slotIdx}`,
          client,
          adName,
          channelId,
          date,
          slot,
          plays: String(playsPerSlot),
          hasConflict: capacityState.isOverCapacity,
          conflictWith: existingOnDateSlot.map((r) => ({ id: r.id, client: r.client, adName: r.adName })),
          capacity: capacityState.capacity,
          existingCountOnSlot: existingOnDateSlot.length,
          planCountOnSlot: planCountOnDateSlot,
        };
        rows.push(row);
        dateSlotCounter[key] = planCountOnDateSlot;
      });
    });
    return rows;
  }

  function buildPlanSummary(rows, baseUnitPrice, discountStrategy, discountValue, channelId, client, adName) {
    const totalCount = rows.length;
    const conflictCount = rows.filter((r) => r.hasConflict).length;
    const normalCount = totalCount - conflictCount;
    const totalPlays = rows.reduce((sum, r) => sum + Number(r.plays || 0), 0);
    const firstPlayDate = rows.length > 0 ? rows.slice().sort((a, b) => a.date.localeCompare(b.date))[0].date : null;

    const discount = calculateDiscount(totalPlays, Number(baseUnitPrice || 0), discountStrategy, discountValue, firstPlayDate);
    const perRecordAmount = totalCount > 0 ? Math.round(discount.finalAmount / totalCount) : 0;
    const rowsWithAmount = rows.map((r, idx) => ({
      ...r,
      amount: String(perRecordAmount + (idx < (discount.finalAmount - perRecordAmount * totalCount) ? 1 : 0)),
    }));

    const inventoryOccupation = {};
    rowsWithAmount.forEach((r) => {
      const key = `${r.date}::${r.slot}`;
      if (!inventoryOccupation[key]) {
        const slotConfig = getInventorySlotConfig(channelId, r.slot, inventory);
        const existingOnSlot = records.filter(
          (rec) => rec.channelId === channelId && rec.date === r.date && rec.slot === r.slot && !rec.coPlay
        ).length;
        inventoryOccupation[key] = {
          key,
          date: r.date,
          slot: r.slot,
          planCount: 0,
          existingCount: existingOnSlot,
          capacity: Number(slotConfig?.capacity ?? 1),
          overCapacity: false,
        };
      }
      inventoryOccupation[key].planCount += 1;
      if (inventoryOccupation[key].existingCount + inventoryOccupation[key].planCount > inventoryOccupation[key].capacity) {
        inventoryOccupation[key].overCapacity = true;
      }
    });

    const slotInventoryAgg = {};
    Object.values(inventoryOccupation).forEach((inv) => {
      if (!slotInventoryAgg[inv.slot]) {
        slotInventoryAgg[inv.slot] = {
          slot: inv.slot,
          totalPlanCount: 0,
          maxExistingCount: 0,
          maxDailyPlanCount: 0,
          maxDailyTotalCount: 0,
          avgOccupancy: 0,
          capacity: inv.capacity,
          dateCount: 0,
          overCapacityDates: 0,
        };
      }
      slotInventoryAgg[inv.slot].totalPlanCount += inv.planCount;
      slotInventoryAgg[inv.slot].maxExistingCount = Math.max(slotInventoryAgg[inv.slot].maxExistingCount, inv.existingCount);
      slotInventoryAgg[inv.slot].maxDailyPlanCount = Math.max(slotInventoryAgg[inv.slot].maxDailyPlanCount, inv.planCount);
      slotInventoryAgg[inv.slot].maxDailyTotalCount = Math.max(slotInventoryAgg[inv.slot].maxDailyTotalCount, inv.existingCount + inv.planCount);
      slotInventoryAgg[inv.slot].avgOccupancy += (inv.existingCount + inv.planCount) / inv.capacity;
      slotInventoryAgg[inv.slot].dateCount += 1;
      if (inv.overCapacity) slotInventoryAgg[inv.slot].overCapacityDates += 1;
    });
    Object.values(slotInventoryAgg).forEach((agg) => {
      agg.avgOccupancy = agg.dateCount > 0 ? Math.round(agg.avgOccupancy / agg.dateCount * 100) / 100 : 0;
    });

    const dailyMap = {};
    rowsWithAmount.forEach((r) => {
      if (!dailyMap[r.date]) dailyMap[r.date] = { date: r.date, plays: 0, amount: 0, conflictCount: 0, records: [] };
      dailyMap[r.date].plays += Number(r.plays || 0);
      dailyMap[r.date].amount += Number(r.amount || 0);
      if (r.hasConflict) dailyMap[r.date].conflictCount += 1;
      dailyMap[r.date].records.push(r);
    });
    const dailyBreakdown = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

    const conflictRisk = assessConflictRisk(conflictCount, totalCount);
    const materialRisk = assessMaterialRisk(firstPlayDate, client, adName);

    return {
      totalCount,
      normalCount,
      conflictCount,
      totalPlays,
      originalAmount: discount.originalAmount,
      discountAmount: discount.discountAmount,
      discountRate: discount.discountRate,
      totalAmount: discount.finalAmount,
      perRecordAmount,
      inventoryOccupation,
      slotInventoryAgg,
      conflictRisk,
      materialRisk,
      dailyBreakdown,
      firstPlayDate,
      rows: rowsWithAmount,
    };
  }

  function generateProposalPlans() {
    const { client, adName, channelId, startDate, endDate, weekdays, slots, playsPerDay, baseUnitPrice, discountStrategy, discountValue } = proposalForm;

    if (!client.trim() || !adName.trim() || !startDate || !endDate || slots.length === 0 || !baseUnitPrice) {
      alert('请填写客户、广告名称、日期范围、时段和单次播放单价');
      return;
    }

    const allDates = getDatesInRange(startDate, endDate, weekdays);
    if (allDates.length === 0) {
      alert('所选日期范围内没有符合条件的投放日期');
      return;
    }

    const allChannelSlots = getEnabledInventorySlots(channelId, inventory);
    const premiumSlots = slots.filter((s) => slotPriceTiers[s] === 'premium');
    const dailyPlays = Number(playsPerDay) || 4;

    const plans = [];

    const concSlots = premiumSlots.length > 0 ? premiumSlots : slots.slice(0, Math.min(2, slots.length));
    const concPlaysPerSlot = Math.max(1, Math.ceil(dailyPlays / concSlots.length));
    const concRows = buildPlanRows(channelId, allDates, concSlots, concPlaysPerSlot, client, adName);
    plans.push({
      id: uid(),
      planType: 'concentrated',
      form: { ...proposalForm },
      ...buildPlanSummary(concRows, baseUnitPrice, discountStrategy, discountValue, channelId, client, adName),
      createdAt: new Date().toISOString(),
      confirmed: false,
    });

    const balPlaysPerSlot = Math.max(1, Math.ceil(dailyPlays / slots.length));
    const balRows = buildPlanRows(channelId, allDates, slots, balPlaysPerSlot, client, adName);
    plans.push({
      id: uid(),
      planType: 'balanced',
      form: { ...proposalForm },
      ...buildPlanSummary(balRows, baseUnitPrice, discountStrategy, discountValue, channelId, client, adName),
      createdAt: new Date().toISOString(),
      confirmed: false,
    });

    const extraSlots = allChannelSlots.filter((s) => !slots.includes(s));
    const spreadSlots = [...slots, ...extraSlots.slice(0, 2)];
    const spreadPlaysPerSlot = Math.max(1, Math.ceil(dailyPlays / spreadSlots.length));
    const spreadRows = buildPlanRows(channelId, allDates, spreadSlots, spreadPlaysPerSlot, client, adName);
    plans.push({
      id: uid(),
      planType: 'spread',
      form: { ...proposalForm },
      ...buildPlanSummary(spreadRows, baseUnitPrice, discountStrategy, discountValue, channelId, client, adName),
      createdAt: new Date().toISOString(),
      confirmed: false,
    });

    setProposalPlans(plans);
    setProposalStep('compare');
    setSelectedProposalPlan(null);
  }

  function confirmProposalPlan(plan) {
    const savedPlan = {
      ...plan,
      confirmed: false,
      confirmedAt: null,
    };
    persistProposals([savedPlan, ...proposals]);
    setProposalStep('form');
    setProposalPlans(null);
    setSelectedProposalPlan(null);
  }

  function confirmProposalToSchedule(proposalId) {
    const proposal = proposals.find((p) => p.id === proposalId);
    if (!proposal) return;

    const { rows } = proposal;
    const conflictCount = rows.filter((r) => r.hasConflict).length;

    if (conflictCount > 0) {
      const modeMsg = proposalConflictMode === 'skip'
        ? `将跳过 ${conflictCount} 条冲突记录，仅创建 ${rows.length - conflictCount} 条正常记录`
        : `将强制创建全部 ${rows.length} 条记录，${conflictCount} 条冲突记录将被标记`;
      if (!confirm(`方案包含 ${conflictCount} 条冲突记录。\n${modeMsg}。\n是否继续？`)) return;
    } else {
      if (!confirm('确认将此方案写入正式排期？此操作不可撤销。')) return;
    }

    const rowsToCreate = proposalConflictMode === 'skip'
      ? rows.filter((r) => !r.hasConflict)
      : rows;

    if (rowsToCreate.length === 0) {
      alert('没有可创建的记录');
      return;
    }

    const existingKeys = new Set(
      records.map((r) => `${r.channelId}::${r.date}::${r.slot}::${r.client}::${r.adName}`)
    );
    const dateSlotRunningCount = {};

    const newRecords = rowsToCreate.map((row) => {
      const runKey = `${row.channelId}::${row.date}::${row.slot}`;
      dateSlotRunningCount[runKey] = (dateSlotRunningCount[runKey] || 0) + 1;
      const existingOnSlot = records.filter(
        (r) => r.channelId === row.channelId && r.date === row.date && r.slot === row.slot && !r.coPlay
      ).length;
      const totalAfterCreate = existingOnSlot + dateSlotRunningCount[runKey];
      const capacityState = getSlotCapacityState(row.channelId, row.slot, totalAfterCreate, inventory);

      const dedupKey = `${row.channelId}::${row.date}::${row.slot}::${row.client}::${row.adName}`;
      const isDuplicate = existingKeys.has(dedupKey);
      existingKeys.add(dedupKey);

      return {
        id: uid(),
        client: row.client,
        adName: row.adName,
        channelId: row.channelId,
        date: row.date,
        slot: row.slot,
        plays: row.plays,
        amount: row.amount,
        status: proposal.form.status || appConfig.primaryStatus,
        createdAt: new Date().toISOString(),
        timeline: [{ status: proposal.form.status || appConfig.primaryStatus, at: today, by: '方案确认' }],
        proposalId: proposal.id,
        proposalPlanType: proposal.planType,
        conflictFlag: capacityState.isOverCapacity,
        duplicateFlag: isDuplicate,
      };
    });

    persist([...newRecords, ...records]);

    const next = proposals.map((p) =>
      p.id === proposalId
        ? {
            ...p,
            confirmed: true,
            confirmedAt: new Date().toISOString(),
            createdRecordCount: newRecords.length,
            skippedConflictCount: rows.length - rowsToCreate.length,
            conflictModeUsed: proposalConflictMode,
          }
        : p
    );
    persistProposals(next);
  }

  function cancelProposal(proposalId) {
    if (!confirm('确定要取消此方案？取消后方案将从列表中删除。')) return;
    persistProposals(proposals.filter((p) => p.id !== proposalId));
  }

  function clearProposalPlans() {
    setProposalPlans(null);
    setSelectedProposalPlan(null);
    setProposalStep('form');
  }

  function resetProposalForm() {
    setProposalForm({
      client: '',
      adName: '',
      channelId: 'channel-news',
      startDate: '',
      endDate: '',
      weekdays: [1, 2, 3, 4, 5],
      slots: [],
      playsPerDay: '4',
      baseUnitPrice: '',
      discountStrategy: 'none',
      discountValue: '',
      status: '待确认',
    });
    setProposalPlans(null);
    setSelectedProposalPlan(null);
    setProposalStep('form');
  }

  function toggleProposalWeekday(day) {
    setProposalForm((prev) => {
      const exists = prev.weekdays.includes(day);
      return { ...prev, weekdays: exists ? prev.weekdays.filter((d) => d !== day) : [...prev.weekdays, day].sort() };
    });
  }

  function toggleProposalSlot(slot) {
    setProposalForm((prev) => {
      const exists = prev.slots.includes(slot);
      return { ...prev, slots: exists ? prev.slots.filter((s) => s !== slot) : [...prev.slots, slot] };
    });
  }

  function handleProposalClientSelect(event) {
    const name = event.target.value;
    if (!name) return;
    const customer = customers.find((c) => c.name === name);
    if (customer) {
      setProposalForm({
        ...proposalForm,
        client: customer.name,
        slots: customer.preferredSlot && !proposalForm.slots.includes(customer.preferredSlot)
          ? [...proposalForm.slots, customer.preferredSlot]
          : proposalForm.slots,
      });
    }
  }

  const [reslotTarget, setReslotTarget] = useState(null);
  const [reslotValue, setReslotValue] = useState('');

  function resolveByReslot(recordId) {
    setReslotTarget(recordId);
    setReslotValue('');
  }

  function confirmReslot() {
    if (!reslotTarget || !reslotValue) return;
    const next = records.map((item) => item.id === reslotTarget ? { ...item, slot: reslotValue } : item);
    persist(next);
    if (selected?.id === reslotTarget) setSelected(next.find((item) => item.id === reslotTarget));
    setReslotTarget(null);
    setReslotValue('');
  }

  function resolveByCoPlay(groupKey) {
    const next = records.map((item) => {
      const key = `${item.channelId}::${item.date}::${item.slot}`;
      if (key === groupKey) return { ...item, coPlay: true };
      return item;
    });
    persist(next);
    if (selected) setSelected(next.find((item) => item.id === selected.id));
  }

  function resolveByDelete(recordId) {
    const next = records.filter((item) => item.id !== recordId);
    persist(next);
    if (selected?.id === recordId) setSelected(null);
    if (reslotTarget === recordId) {
      setReslotTarget(null);
      setReslotValue('');
    }
  }

  return (
    <main className="shell" style={{ '--accent': appConfig.accent }}>
      <section className="hero">
        <div>
          <div className="eyebrow"><Radio size={18} />{appConfig.domain}</div>
          <h1>{appConfig.title}</h1>
          <p>{appConfig.subtitle}</p>
        </div>
        <div className="port-card">
          <span>Local Port</span>
          <strong>{appConfig.port}</strong>
        </div>
      </section>

      <section className="channel-tabs">
        <button
          type="button"
          className={`channel-tab ${filters.channel === '全部' ? 'active' : ''}`}
          onClick={() => setFilters({ ...filters, channel: '全部' })}
        >
          <span className="channel-dot" style={{ background: 'linear-gradient(90deg, #2563eb, #8b5cf6, #f97316)' }} />
          <span>全部频道</span>
        </button>
        {channels.map((channel) => (
          <button
            key={channel.id}
            type="button"
            className={`channel-tab ${filters.channel === channel.id ? 'active' : ''}`}
            onClick={() => setFilters({ ...filters, channel: channel.id })}
          >
            <span className="channel-dot" style={{ background: channel.color }} />
            <span>{channel.name}</span>
          </button>
        ))}
      </section>

      <section className="metrics">
        {metrics.map((metric) => (
          <article className="metric" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </section>

      <section className="inventory-section">
        <div className="panel">
          <div className="panel-title">
            <Layers size={18} />
            <h2>多频道排期库存</h2>
            <span className="broadcast-hint">各频道可售时段、容量和占用情况</span>
          </div>
          <div className="inventory-grid">
            {channels.map((channel) => {
              const channelInv = getChannelInventory(channel.id, inventory);
              const channelRecs = records.filter((r) => r.channelId === channel.id);
              return (
                <div key={channel.id} className="inventory-card" style={{ borderTopColor: channel.color }}>
                  <div className="inventory-card-header">
                    <div>
                      <span className="channel-dot" style={{ background: channel.color }} />
                      <strong>{channel.name}</strong>
                    </div>
                    <button type="button" className="primary compact" onClick={() => openInventoryModal(channel.id)}>
                      <Pencil size={14} />配置
                    </button>
                  </div>
                  <div className="inventory-slot-list">
                    {channelInv.slots.filter((s) => s.enabled).map((slotConfig, idx) => {
                      const usage = getSlotUsage(channel.id, slotConfig.slot, channelRecs);
                      const percent = slotConfig.capacity > 0 ? Math.min(100, (usage / slotConfig.capacity) * 100) : 0;
                      const isFull = usage >= slotConfig.capacity;
                      const isHigh = percent >= 70 && !isFull;
                      return (
                        <div key={idx} className="inventory-slot-item">
                          <div className="inventory-slot-header">
                            <span className="slot-name">{slotConfig.slot}</span>
                            <span className={`capacity-badge ${isFull ? 'full' : isHigh ? 'high' : ''}`}>
                              {usage}/{slotConfig.capacity}
                            </span>
                          </div>
                          <div className="inventory-progress">
                            <div
                              className="inventory-progress-fill"
                              style={{
                                width: `${percent}%`,
                                background: isFull ? '#dc2626' : isHigh ? '#f59e0b' : channel.color
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="workspace">
        <form className="panel form-panel" onSubmit={addRecord}>
          <div className="panel-title">
            <ClipboardList size={18} />
            <h2>新增记录</h2>
          </div>
          <div className="form-grid">
            <label>
              <span>投放频道</span>
              <select value={form.channelId || selectedChannel} onChange={(event) => {
                const newChannelId = event.target.value;
                const channelSlots = getEnabledInventorySlots(newChannelId, inventory);
                setForm({ ...form, channelId: newChannelId, slot: channelSlots[0] || form.slot });
              }}>
                {channels.map((channel) => (
                  <option key={channel.id} value={channel.id}>{channel.name}</option>
                ))}
              </select>
            </label>
            {appConfig.fields.map((field) => (
              <label key={field.key} className={field.type === 'textarea' ? 'wide' : ''}>
                <span>{field.label}</span>
                {field.key === 'client' ? (
                  <div className="client-select-group">
                    <select className="client-select" value="" onChange={handleClientSelect}>
                      <option value="">从档案选择...</option>
                      {customers.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                    <input type={field.type} value={form[field.key] || ''} onChange={(event) => setForm({ ...form, [field.key]: event.target.value })} placeholder={field.placeholder} />
                  </div>
                ) : field.type === 'textarea' ? (
                  <textarea value={form[field.key] || ''} onChange={(event) => setForm({ ...form, [field.key]: event.target.value })} placeholder={field.placeholder} />
                ) : field.key === 'slot' ? (
                  <select value={form[field.key] || ''} onChange={(event) => setForm({ ...form, [field.key]: event.target.value })}>
                    {getEnabledInventorySlots(form.channelId || selectedChannel, inventory).map((option) => <option key={option}>{option}</option>)}
                  </select>
                ) : field.type === 'select' ? (
                  <select value={form[field.key] || ''} onChange={(event) => setForm({ ...form, [field.key]: event.target.value })}>
                    {field.options.map((option) => <option key={option}>{option}</option>)}
                  </select>
                ) : (
                  <input type={field.type} value={form[field.key] || ''} onChange={(event) => setForm({ ...form, [field.key]: event.target.value })} placeholder={field.placeholder} />
                )}
              </label>
            ))}
            <label>
              <span>当前状态</span>
              <select value={form.status || appConfig.primaryStatus} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                {appConfig.statuses.map((status) => <option key={status}>{status}</option>)}
              </select>
            </label>
          </div>
          {form.client && customers.find((c) => c.name === form.client) && (() => {
            const c = customers.find((c) => c.name === form.client);
            return (
              <div className="client-info-card">
                <div className="client-info-title">客户档案信息</div>
                <div className="client-info-row">
                  <span className="client-info-label">联系人：</span>
                  <span className="client-info-value">{c.contact || '未设置'}</span>
                  <span className="client-info-label">电话：</span>
                  <span className="client-info-value">{c.phone || '未设置'}</span>
                </div>
                <div className="client-info-row">
                  <span className="client-info-label">常用时段：</span>
                  <span className="client-info-value">{c.preferredSlot || '不限'}</span>
                  <span className="client-info-label">历史合同额：</span>
                  <span className="client-info-value">{money(Number(c.historicalAmount || 0))}</span>
                </div>
                <div className="client-info-row">
                  <span className="client-info-label">客户等级：</span>
                  <span className="client-info-value">{c.level || '未设置'}</span>
                  <span className="client-info-label">行业类型：</span>
                  <span className="client-info-value">{c.industry || '未设置'}</span>
                </div>
              </div>
            );
          })()}
          <button className="primary" type="submit"><Plus size={18} />新增</button>
          <p className="hint">{appConfig.note}</p>
        </form>

        <section className="panel list-panel">
          <div className="toolbar">
            <div className="search">
              <Search size={16} />
              <input value={filters.query} onChange={(event) => setFilters({ ...filters, query: event.target.value })} placeholder={appConfig.filters[0]?.label || '搜索'} />
            </div>
            <select value={filters.channel} onChange={(event) => setFilters({ ...filters, channel: event.target.value })}>
              <option value="全部">全部频道</option>
              {channels.map((channel) => <option key={channel.id} value={channel.id}>{channel.name}</option>)}
            </select>
            <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
              <option>全部状态</option>
              {appConfig.statuses.map((status) => <option key={status}>{status}</option>)}
            </select>
          </div>

          <div className="records">
            {filteredRecords.map((item) => {
              const material = getMaterialByScheduleId(item.id);
              const needsMaterial = isMaterialUndeliveredWarning(item, material);
              return (
              <article className={'record ' + (isConflicted.has(item.id) ? 'conflict' : '')} key={item.id} onClick={() => setSelected(item)}>
                <div className="record-head">
                  <div>
                    <h3>{item.adName}</h3>
                    <p>{`${item.client} · ${item.date} · ${item.slot}`}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <span className={'status ' + statusClass(item.status)}>{item.status}</span>
                    {item.channelId && (
                      <span className={`channel-badge channel-badge-${item.channelId.replace('channel-', '')}`}>
                        {getChannelById(item.channelId)?.name || '未知'}
                      </span>
                    )}
                  </div>
                </div>
                <p className="record-detail">{`播放${item.plays}次｜合同${money(Number(item.amount || 0))}`}</p>
                {isConflicted.has(item.id) && <div className="warning"><AlertTriangle size={15} />发现冲突</div>}
                {needsMaterial && <div className="material-warning"><AlertTriangle size={15} />素材未交付</div>}
                {item.coPlay && <div className="conflict-badge-co"><Layers size={12} />可并播</div>}
                {item.batchFlag && <div className="batch-flag-badge"><Flag size={12} />批量冲突</div>}
                {material && (
                  <div className="material-badge">
                    <Package size={12} />
                    <span className={'status small ' + getMaterialStatusClass(material.productionStatus)}>{material.productionStatus}</span>
                  </div>
                )}
                <div className="actions" onClick={(event) => event.stopPropagation()}>
                  {appConfig.statuses.map((status) => (
                    <button key={status} type="button" onClick={() => updateStatus(item.id, status)}>{status}</button>
                  ))}
                  {isConflicted.has(item.id) && (
                    <>
                      {reslotTarget === item.id ? (
                        <div className="reslot-inline">
                          <select value={reslotValue} onChange={(e) => setReslotValue(e.target.value)}>
                            <option value="">选择新时段</option>
                            {getEnabledInventorySlots(item.channelId || selectedChannel, inventory)
                              .filter((opt) => opt !== item.slot)
                              .map((opt) => <option key={opt}>{opt}</option>)}
                          </select>
                          <button className="primary compact" type="button" onClick={confirmReslot} disabled={!reslotValue}>
                            <CheckCircle2 size={14} />
                          </button>
                          <button className="cancel-btn compact" type="button" onClick={() => { setReslotTarget(null); setReslotValue(''); }}>
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <button type="button" className="reslot-btn compact-action" onClick={() => resolveByReslot(item.id)}>
                          <Clock size={14} />改时段
                        </button>
                      )}
                      {!item.coPlay && (
                        <button type="button" className="co-play-single-btn compact-action" onClick={() => {
                          const next = records.map((r) => r.id === item.id ? { ...r, coPlay: true } : r);
                          persist(next);
                          if (selected?.id === item.id) setSelected(next.find((r) => r.id === item.id));
                        }}>
                          <Layers size={14} />可并播
                        </button>
                      )}
                    </>
                  )}
                  {item.coPlay && (
                    <button type="button" className="co-play-single-btn compact-action" onClick={() => {
                      const next = records.map((r) => r.id === item.id ? { ...r, coPlay: false } : r);
                      persist(next);
                      if (selected?.id === item.id) setSelected(next.find((r) => r.id === item.id));
                    }}>
                      <XCircle size={14} />取消并播
                    </button>
                  )}
                  {appConfig.action === 'copyRecipe' && <button type="button" onClick={() => duplicateRecord(item)}><RotateCcw size={14} />复制</button>}
                  {appConfig.chart && <button type="button" onClick={() => addTemperature(item)}>加温度</button>}
                  <button className="ghost-danger" type="button" onClick={() => removeRecord(item.id)}><Trash2 size={14} /></button>
                </div>
              </article>
              );
            })}
          </div>
        </section>
      </section>

      <section className="import-section">
        <div className="panel import-input-panel">
          <div className="panel-title">
            <FileUp size={18} />
            <h2>数据导入预览</h2>
          </div>
          <p className="hint">粘贴CSV格式数据，表头需包含：客户、广告名称、投放日期、时段、播放次数、合同金额</p>
          <textarea
            className="import-textarea"
            rows={6}
            value={importCsv}
            onChange={(e) => setImportCsv(e.target.value)}
            placeholder={'客户,广告名称,投放日期,时段,播放次数,合同金额\n蓝海家居,618促销,2026-06-15,08:00-09:00,4,3600\n北城眼镜,暑期配镜,2026-06-15,18:00-19:00,3,2800'}
          />
          <div className="import-actions">
            <button className="primary" type="button" onClick={handleParseCsv} disabled={!importCsv.trim()}>
              <CheckCircle2 size={18} />解析数据
            </button>
            {importResult && (
              <button className="cancel-btn" type="button" onClick={handleClearImport}>
                <X size={18} />清除
              </button>
            )}
          </div>
        </div>

        {importResult && (
          <div className="panel import-preview-panel">
            <div className="panel-title">
              <ClipboardList size={18} />
              <h2>识别结果（{importResult.rows.length}条）</h2>
            </div>

            {importResult.missingHeaders.length > 0 && (
              <div className="import-alert import-alert-error">
                <XCircle size={16} />
                <span>缺少必需列：{importResult.missingHeaders.join('、')}</span>
              </div>
            )}

            {importResult.conflicts.length > 0 && (
              <div className="import-alert import-alert-warn">
                <AlertTriangle size={16} />
                <span>发现同日同时段冲突：{importResult.conflicts.map((c) => `${c.date} ${c.slot}`).join('、')}</span>
              </div>
            )}

            {importResult.rows.length > 0 && (
              <div className="import-table-wrap">
                <table className="import-table">
                  <thead>
                    <tr>
                      <th>行</th>
                      <th>客户</th>
                      <th>广告名称</th>
                      <th>投放日期</th>
                      <th>时段</th>
                      <th>播放次数</th>
                      <th>合同金额</th>
                      <th>状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importResult.rows.map((row, idx) => {
                      const isConflict = importResult.conflicts.some((c) => c.rowIndex === idx);
                      const hasMissing = row._missingFields.length > 0;
                      return (
                        <tr key={idx} className={isConflict ? 'row-conflict' : hasMissing ? 'row-missing' : ''}>
                          <td>{row._rowIndex}</td>
                          <td>{row.client || '-'}</td>
                          <td>{row.adName || '-'}</td>
                          <td>{row.date || '-'}</td>
                          <td>{row.slot || '-'}</td>
                          <td>{row.plays || '-'}</td>
                          <td>{row.amount ? money(Number(row.amount)) : '-'}</td>
                          <td>
                            {isConflict && <span className="import-badge badge-conflict">冲突</span>}
                            {hasMissing && <span className="import-badge badge-missing">缺{row._missingFields.join('/')}</span>}
                            {!isConflict && !hasMissing && <span className="import-badge badge-ok">正常</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="import-confirm-actions">
              <button
                className="primary"
                type="button"
                onClick={handleConfirmImport}
                disabled={importResult.rows.length === 0}
              >
                <FileUp size={18} />确认导入
              </button>
              <button className="cancel-btn" type="button" onClick={handleClearImport}>取消</button>
            </div>
          </div>
        )}
      </section>

      <section className="batch-section">
        <div className="panel batch-form-panel">
          <div className="panel-title">
            <Zap size={18} />
            <h2>批量排期生成器</h2>
          </div>
          <p className="hint">设置广告参数，自动生成日期范围内指定星期、时段的多条排期记录，并预览冲突。</p>
          <div className="batch-form">
            <label className="batch-label">
              <span>投放频道</span>
              <select
                value={batchForm.channelId}
                onChange={(e) => {
                  const newChannelId = e.target.value;
                  setBatchForm({ ...batchForm, channelId: newChannelId, slots: [], slotPlays: {} });
                }}
              >
                {channels.map((channel) => (
                  <option key={channel.id} value={channel.id}>{channel.name}</option>
                ))}
              </select>
            </label>

            <label className="batch-label">
              <span>客户</span>
              <div className="client-select-group">
                <select className="client-select" value="" onChange={handleBatchClientSelect}>
                  <option value="">从档案选择...</option>
                  {customers.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
                <input
                  type="text"
                  value={batchForm.client}
                  onChange={(e) => setBatchForm({ ...batchForm, client: e.target.value })}
                  placeholder="蓝海家居"
                />
              </div>
              {batchForm.client && customers.find((c) => c.name === batchForm.client) && (() => {
                const c = customers.find((c) => c.name === batchForm.client);
                return (
                  <div className="client-info-card">
                    <div className="client-info-title">客户档案信息</div>
                    <div className="client-info-row">
                      <span className="client-info-label">联系人：</span>
                      <span className="client-info-value">{c.contact || '未设置'}</span>
                      <span className="client-info-label">电话：</span>
                      <span className="client-info-value">{c.phone || '未设置'}</span>
                    </div>
                    <div className="client-info-row">
                      <span className="client-info-label">常用时段：</span>
                      <span className="client-info-value">{c.preferredSlot || '不限'}</span>
                      <span className="client-info-label">历史合同额：</span>
                      <span className="client-info-value">{money(Number(c.historicalAmount || 0))}</span>
                    </div>
                    <div className="client-info-row">
                      <span className="client-info-label">客户等级：</span>
                      <span className="client-info-value">{c.level || '未设置'}</span>
                      <span className="client-info-label">行业类型：</span>
                      <span className="client-info-value">{c.industry || '未设置'}</span>
                    </div>
                  </div>
                );
              })()}
            </label>

            <label className="batch-label">
              <span>广告名称</span>
              <input
                type="text"
                value={batchForm.adName}
                onChange={(e) => setBatchForm({ ...batchForm, adName: e.target.value })}
                placeholder="618门店促销"
              />
            </label>

            <div className="batch-date-range">
              <label className="batch-label">
                <span>开始日期</span>
                <input
                  type="date"
                  value={batchForm.startDate}
                  onChange={(e) => setBatchForm({ ...batchForm, startDate: e.target.value })}
                />
              </label>
              <label className="batch-label">
                <span>结束日期</span>
                <input
                  type="date"
                  value={batchForm.endDate}
                  onChange={(e) => setBatchForm({ ...batchForm, endDate: e.target.value })}
                />
              </label>
            </div>

            <label className="batch-label">
              <span>投放星期</span>
              <div className="weekday-chips">
                {[
                  { v: 0, label: '日' },
                  { v: 1, label: '一' },
                  { v: 2, label: '二' },
                  { v: 3, label: '三' },
                  { v: 4, label: '四' },
                  { v: 5, label: '五' },
                  { v: 6, label: '六' },
                ].map((d) => (
                  <button
                    key={d.v}
                    type="button"
                    className={`weekday-chip ${batchForm.weekdays.includes(d.v) ? 'active' : ''}`}
                    onClick={() => toggleWeekday(d.v)}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </label>

            <label className="batch-label">
              <span>投放时段（可多选）</span>
              <div className="slot-chips">
                {getEnabledInventorySlots(batchForm.channelId, inventory).map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    className={`slot-chip ${batchForm.slots.includes(slot) ? 'active' : ''}`}
                    onClick={() => toggleSlot(slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </label>

            {batchForm.slots.length > 0 && (
              <div className="slot-plays-section">
                <div className="slot-plays-header">
                  <span>按时段设置播放次数</span>
                  <span className="slot-plays-total">
                    日均合计：{batchForm.slots.reduce((sum, s) => sum + Number(getEffectiveSlotPlays(s, batchForm.slots, batchForm.slotPlays, batchForm.playsPerDay)), 0)}次
                  </span>
                </div>
                {batchForm.slots.map((slot) => {
                  const customVal = batchForm.slotPlays[slot];
                  const hasCustom = customVal != null && customVal !== '' && Number(customVal) > 0;
                  const effectiveVal = getEffectiveSlotPlays(slot, batchForm.slots, batchForm.slotPlays, batchForm.playsPerDay);
                  return (
                    <div key={slot} className={`slot-play-row ${hasCustom ? 'custom' : 'auto'}`}>
                      <span className="slot-play-label">{slot}</span>
                      <input
                        type="number"
                        min="1"
                        value={hasCustom ? customVal : ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setBatchForm((prev) => {
                            const nextSlotPlays = { ...prev.slotPlays };
                            if (val === '' || val == null) {
                              delete nextSlotPlays[slot];
                            } else {
                              nextSlotPlays[slot] = val;
                            }
                            return { ...prev, slotPlays: nextSlotPlays };
                          });
                        }}
                        placeholder={`自动 ${effectiveVal}`}
                      />
                      <span className="slot-play-unit">次/天</span>
                      {!hasCustom && <span className="slot-play-auto-tag">自动</span>}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="batch-meta-row">
              <label className="batch-label">
                <span>每日播放次数（快捷设置）</span>
                <input
                  type="number"
                  min="1"
                  value={batchForm.playsPerDay}
                  onChange={(e) => {
                    const val = e.target.value;
                    setBatchForm((prev) => {
                      const totalPlays = Number(val) || 0;
                      const nextSlotPlays = {};
                      if (prev.slots.length > 0 && totalPlays > 0) {
                        const perSlot = String(Math.max(1, Math.round(totalPlays / prev.slots.length)));
                        prev.slots.forEach((s) => {
                          nextSlotPlays[s] = perSlot;
                        });
                      }
                      return { ...prev, playsPerDay: val, slotPlays: nextSlotPlays };
                    });
                  }}
                  placeholder="4"
                />
                <span className="batch-sub-hint">修改后将重置各时段为平均分配</span>
              </label>
              <label className="batch-label">
                <span>合同总额（元）</span>
                <input
                  type="number"
                  min="0"
                  value={batchForm.totalAmount}
                  onChange={(e) => setBatchForm({ ...batchForm, totalAmount: e.target.value })}
                  placeholder="36000"
                />
                <span className="batch-sub-hint">将平均分配到每条记录</span>
              </label>
            </div>

            <label className="batch-label">
              <span>初始状态</span>
              <select
                value={batchForm.status}
                onChange={(e) => setBatchForm({ ...batchForm, status: e.target.value })}
              >
                {appConfig.statuses.map((status) => <option key={status}>{status}</option>)}
              </select>
            </label>

            <div className="batch-actions">
              <button
                className="primary"
                type="button"
                onClick={generateBatchPreview}
              >
                <CalendarRange size={18} />生成预览
              </button>
              {batchPreview && (
                <button className="cancel-btn" type="button" onClick={clearBatchPreview}>
                  <X size={18} />清除预览
                </button>
              )}
            </div>
          </div>
        </div>

        {batchPreview && (
          <div className="panel batch-preview-panel">
            <div className="panel-title">
              <ClipboardList size={18} />
              <h2>排期预览（共{batchPreview.totalCount}条）</h2>
              {batchPreview.conflictCount > 0 && (
                <span className="batch-conflict-badge">
                  <AlertTriangle size={12} />{batchPreview.conflictCount}条冲突
                </span>
              )}
            </div>

            <div className="batch-summary">
              <div className="batch-summary-item">
                <span className="bs-label">投放日期</span>
                <span className="bs-value">{batchPreview.dates.length}天</span>
              </div>
              <div className="batch-summary-item">
                <span className="bs-label">投放时段</span>
                <span className="bs-value">{batchPreview.slots.length}个</span>
              </div>
              <div className="batch-summary-item">
                <span className="bs-label">每条播放</span>
                <span className="bs-value">
                  {batchPreview.slotPlaysMap
                    ? Object.entries(batchPreview.slotPlaysMap).map(([s, p]) => `${s}:${p}次`).join('、')
                    : `${batchPreview.perRecordPlays}次`}
                </span>
              </div>
              <div className="batch-summary-item">
                <span className="bs-label">每条金额</span>
                <span className="bs-value amount">{batchPreview.perRecordAmount}</span>
              </div>
              <div className="batch-summary-item">
                <span className="bs-label">总播放</span>
                <span className="bs-value">{batchPreview.totalPlays}次</span>
              </div>
              <div className="batch-summary-item">
                <span className="bs-label">总合同额</span>
                <span className="bs-value amount">{money(batchPreview.totalAmount)}</span>
              </div>
            </div>

            {batchPreview.conflictCount > 0 && (
              <div className="batch-conflict-options">
                <div className="batch-conflict-title">
                  <AlertTriangle size={16} />
                  <span>发现{batchPreview.conflictCount}条同日同时段冲突，请选择处理方式：</span>
                </div>
                <div className="conflict-mode-options">
                  <label className={`conflict-mode-option ${batchConflictMode === 'skip' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      checked={batchConflictMode === 'skip'}
                      onChange={() => setBatchConflictMode('skip')}
                    />
                    <SkipForward size={14} />
                    <div>
                      <strong>跳过冲突</strong>
                      <span>仅创建无冲突的{batchPreview.normalCount}条记录</span>
                    </div>
                  </label>
                  <label className={`conflict-mode-option ${batchConflictMode === 'create' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      checked={batchConflictMode === 'create'}
                      onChange={() => setBatchConflictMode('create')}
                    />
                    <Flag size={14} />
                    <div>
                      <strong>照常创建</strong>
                      <span>创建全部{batchPreview.totalCount}条，冲突的{batchPreview.conflictCount}条将标记为需处理</span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            <div className="batch-preview-table-wrap">
              <table className="batch-preview-table">
                <thead>
                  <tr>
                    <th>序号</th>
                    <th>投放日期</th>
                    <th>星期</th>
                    <th>时段</th>
                    <th>播放</th>
                    <th>合同金额</th>
                    <th>状态</th>
                  </tr>
                </thead>
                <tbody>
                  {batchPreview.rows.map((row, idx) => {
                    const dayOfWeek = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][new Date(row.date).getDay()];
                    return (
                      <tr key={row.previewId} className={row.hasConflict ? 'row-conflict' : ''}>
                        <td>{idx + 1}</td>
                        <td>{row.date}</td>
                        <td>{dayOfWeek}</td>
                        <td>{row.slot}</td>
                        <td>{row.plays}次</td>
                        <td>{money(Number(row.amount))}</td>
                        <td>
                          {row.hasConflict ? (
                            <span className="import-badge badge-conflict" title={row.conflictWith.map(c => `${c.client}-${c.adName}`).join('、')}>
                              冲突：{row.conflictWith.map(c => c.client).join('、')}
                            </span>
                          ) : (
                            <span className="import-badge badge-ok">正常</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="import-confirm-actions">
              <button
                className="primary"
                type="button"
                onClick={confirmBatchCreate}
              >
                <Plus size={18} />
                确认创建（{batchConflictMode === 'skip' ? batchPreview.normalCount : batchPreview.totalCount}条）
              </button>
              <button className="cancel-btn" type="button" onClick={clearBatchPreview}>取消</button>
            </div>
          </div>
        )}
      </section>

      <section className="proposal-section">
        <div className="panel proposal-form-panel">
          <div className="panel-title">
            <Calculator size={18} />
            <h2>广告报价与排期方案生成</h2>
          </div>
          <p className="hint">选择客户、频道、日期范围和折扣策略后，系统将生成多个可选方案供对比测算。确认方案后才写入正式排期。</p>

          <div className="proposal-step-tabs">
            <button type="button" className={`proposal-step-tab ${proposalStep === 'form' ? 'active' : ''}`} onClick={() => { setProposalStep('form'); setProposalPlans(null); setSelectedProposalPlan(null); }}>
              <Sparkles size={14} />方案配置
            </button>
            <button type="button" className={`proposal-step-tab ${proposalStep === 'compare' ? 'active' : ''}`} disabled={!proposalPlans} onClick={() => setProposalStep('compare')}>
              <ArrowRightLeft size={14} />方案对比
            </button>
            <button type="button" className={`proposal-step-tab ${proposalStep === 'saved' ? 'active' : ''}`} onClick={() => { setProposalStep('saved'); setProposalPlans(null); setSelectedProposalPlan(null); }}>
              <Eye size={14} />已保存方案（{proposals.length}）
            </button>
          </div>

          {proposalStep === 'form' && (
            <div className="proposal-form">
              <div className="form-grid">
                <label>
                  <span>投放频道</span>
                  <select value={proposalForm.channelId} onChange={(e) => setProposalForm({ ...proposalForm, channelId: e.target.value, slots: [] })}>
                    {channels.map((ch) => <option key={ch.id} value={ch.id}>{ch.name}</option>)}
                  </select>
                </label>
                <label>
                  <span>客户</span>
                  <div className="client-select-group">
                    <select className="client-select" value="" onChange={handleProposalClientSelect}>
                      <option value="">从档案选择...</option>
                      {customers.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                    <input type="text" value={proposalForm.client} onChange={(e) => setProposalForm({ ...proposalForm, client: e.target.value })} placeholder="蓝海家居" />
                  </div>
                  {proposalForm.client && customers.find((c) => c.name === proposalForm.client) && (() => {
                    const c = customers.find((c) => c.name === proposalForm.client);
                    return (
                      <div className="client-info-card">
                        <div className="client-info-title">客户档案信息</div>
                        <div className="client-info-row">
                          <span className="client-info-label">联系人：</span>
                          <span className="client-info-value">{c.contact || '未设置'}</span>
                          <span className="client-info-label">电话：</span>
                          <span className="client-info-value">{c.phone || '未设置'}</span>
                        </div>
                        <div className="client-info-row">
                          <span className="client-info-label">常用时段：</span>
                          <span className="client-info-value">{c.preferredSlot || '不限'}</span>
                          <span className="client-info-label">历史合同额：</span>
                          <span className="client-info-value">{money(Number(c.historicalAmount || 0))}</span>
                        </div>
                        <div className="client-info-row">
                          <span className="client-info-label">客户等级：</span>
                          <span className="client-info-value">{c.level || '未设置'}</span>
                          <span className="client-info-label">行业类型：</span>
                          <span className="client-info-value">{c.industry || '未设置'}</span>
                        </div>
                      </div>
                    );
                  })()}
                </label>
                <label>
                  <span>广告名称</span>
                  <input type="text" value={proposalForm.adName} onChange={(e) => setProposalForm({ ...proposalForm, adName: e.target.value })} placeholder="618门店促销" />
                </label>
                <label>
                  <span>初始状态</span>
                  <select value={proposalForm.status} onChange={(e) => setProposalForm({ ...proposalForm, status: e.target.value })}>
                    {appConfig.statuses.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </label>
              </div>

              <div className="proposal-date-range">
                <label>
                  <span>开始日期</span>
                  <input type="date" value={proposalForm.startDate} onChange={(e) => setProposalForm({ ...proposalForm, startDate: e.target.value })} />
                </label>
                <label>
                  <span>结束日期</span>
                  <input type="date" value={proposalForm.endDate} onChange={(e) => setProposalForm({ ...proposalForm, endDate: e.target.value })} />
                </label>
              </div>

              <label className="proposal-label">
                <span>投放星期</span>
                <div className="weekday-chips">
                  {[{ v: 0, l: '日' }, { v: 1, l: '一' }, { v: 2, l: '二' }, { v: 3, l: '三' }, { v: 4, l: '四' }, { v: 5, l: '五' }, { v: 6, l: '六' }].map((d) => (
                    <button key={d.v} type="button" className={`weekday-chip ${proposalForm.weekdays.includes(d.v) ? 'active' : ''}`} onClick={() => toggleProposalWeekday(d.v)}>{d.l}</button>
                  ))}
                </div>
              </label>

              <label className="proposal-label">
                <span>投放时段（可多选）</span>
                <div className="slot-chips">
                  {getEnabledInventorySlots(proposalForm.channelId, inventory).map((slot) => (
                    <button key={slot} type="button" className={`slot-chip ${proposalForm.slots.includes(slot) ? 'active' : ''} ${slotPriceTiers[slot] === 'premium' ? 'slot-premium' : ''}`} onClick={() => toggleProposalSlot(slot)}>
                      {slot}{slotPriceTiers[slot] === 'premium' ? ' ★' : ''}
                    </button>
                  ))}
                </div>
              </label>

              <div className="proposal-meta-row">
                <label className="proposal-label">
                  <span>每日播放次数</span>
                  <input type="number" min="1" value={proposalForm.playsPerDay} onChange={(e) => setProposalForm({ ...proposalForm, playsPerDay: e.target.value })} placeholder="4" />
                  <span className="batch-sub-hint">将分配到各时段</span>
                </label>
                <label className="proposal-label">
                  <span>单次播放单价（元）</span>
                  <input type="number" min="0" value={proposalForm.baseUnitPrice} onChange={(e) => setProposalForm({ ...proposalForm, baseUnitPrice: e.target.value })} placeholder="900" />
                  <span className="batch-sub-hint">合同额 = 单价 × 播放总次 × 折扣</span>
                </label>
              </div>

              <div className="proposal-discount-row">
                <label className="proposal-label">
                  <span>折扣策略</span>
                  <select value={proposalForm.discountStrategy} onChange={(e) => setProposalForm({ ...proposalForm, discountStrategy: e.target.value, discountValue: '' })}>
                    {discountStrategies.map((ds) => <option key={ds.key} value={ds.key}>{ds.label} - {ds.description}</option>)}
                  </select>
                </label>
                {proposalForm.discountStrategy === 'percent' && (
                  <label className="proposal-label">
                    <span>折扣百分比（%）</span>
                    <input type="number" min="0" max="100" value={proposalForm.discountValue} onChange={(e) => setProposalForm({ ...proposalForm, discountValue: e.target.value })} placeholder="15" />
                  </label>
                )}
                {proposalForm.discountStrategy === 'tiered' && (
                  <div className="discount-info">
                    <span className="discount-info-title">阶梯规则</span>
                    <span>1-20次：原价</span>
                    <span>21-50次：95折</span>
                    <span>51次以上：9折</span>
                  </div>
                )}
                {proposalForm.discountStrategy === 'earlybird' && (
                  <div className="discount-info">
                    <span className="discount-info-title">早鸟规则</span>
                    <span>首播14天前：9折</span>
                    <span>首播7-14天前：95折</span>
                    <span>7天内：原价</span>
                  </div>
                )}
              </div>

              <div className="proposal-actions">
                <button className="primary" type="button" onClick={generateProposalPlans}>
                  <Sparkles size={18} />生成方案
                </button>
                <button className="cancel-btn" type="button" onClick={resetProposalForm}>
                  <RotateCcw size={18} />重置
                </button>
              </div>
            </div>
          )}

          {proposalStep === 'compare' && proposalPlans && (
            <div className="proposal-compare">
              <div className="proposal-compare-header">
                <div className="panel-title" style={{ marginBottom: 0 }}>
                  <ArrowRightLeft size={18} />
                  <h2>方案对比</h2>
                </div>
                <button className="cancel-btn" type="button" onClick={clearProposalPlans}>
                  <X size={16} />返回配置
                </button>
              </div>

              <div className="proposal-cards">
                {proposalPlans.map((plan) => {
                  const meta = planTypeLabels[plan.planType];
                  return (
                    <div key={plan.id} className={`proposal-card ${selectedProposalPlan?.id === plan.id ? 'selected' : ''}`} style={{ borderTopColor: meta.color }}>
                      <div className="proposal-card-header">
                        <div className="proposal-card-type" style={{ background: `${meta.color}15`, color: meta.color }}>{meta.name}</div>
                        <span className="proposal-card-desc">{meta.desc}</span>
                      </div>

                      <div className="proposal-card-metrics">
                        <div className="proposal-metric">
                          <span className="pm-label">预计合同额</span>
                          <span className="pm-value amount">{money(plan.totalAmount)}</span>
                          {plan.discountAmount > 0 && (
                            <span className="pm-discount">优惠 {money(plan.discountAmount)}</span>
                          )}
                        </div>
                        <div className="proposal-metric">
                          <span className="pm-label">排期条数</span>
                          <span className="pm-value">{plan.totalCount}</span>
                        </div>
                        <div className="proposal-metric">
                          <span className="pm-label">总播放次</span>
                          <span className="pm-value">{plan.totalPlays}次</span>
                        </div>
                      </div>

                      <div className="proposal-card-risks">
                        <div className="proposal-risk">
                          <span className="pr-label">冲突风险</span>
                          <span className={`pr-badge ${riskLevelClass(plan.conflictRisk)}`}>{riskLevelLabel(plan.conflictRisk)}</span>
                          {plan.conflictCount > 0 && <span className="pr-detail">{plan.conflictCount}条 / {Math.round(plan.conflictRisk.ratio * 100)}%</span>}
                        </div>
                        <div className="proposal-risk">
                          <span className="pr-label">素材风险</span>
                          <span className={`pr-badge ${riskLevelClass(plan.materialRisk)}`}>{riskLevelLabel(plan.materialRisk)}</span>
                          {plan.materialRisk.materialDetail
                            ? <span className="pr-detail">素材：{plan.materialRisk.materialDetail.status}</span>
                            : plan.firstPlayDate && <span className="pr-detail">距首播{plan.materialRisk.daysAhead}天</span>}
                        </div>
                      </div>

                      <div className="proposal-card-inventory">
                        <span className="pci-title">库存占用（按日期平均）</span>
                        {Object.values(plan.slotInventoryAgg).map((agg) => (
                          <div key={agg.slot} className="pci-item">
                            <span className="pci-slot">{agg.slot}</span>
                            <div className="pci-bar-wrap">
                              <div className="pci-bar" style={{ width: `${Math.min(100, agg.avgOccupancy * 100)}%`, background: agg.overCapacityDates > 0 ? '#dc2626' : agg.avgOccupancy >= 1 ? '#f59e0b' : meta.color }} />
                            </div>
                            <span className={`pci-count ${agg.overCapacityDates > 0 ? 'over' : ''}`}>
                              均{Math.round(agg.avgOccupancy * 100)}% · 峰{agg.maxDailyTotalCount}/{agg.capacity}
                              {agg.overCapacityDates > 0 && ` · ${agg.overCapacityDates}天超`}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="proposal-card-actions">
                        <button className="primary compact" type="button" onClick={() => setSelectedProposalPlan(plan)}>
                          <Eye size={14} />查看详情
                        </button>
                        <button className="compact" type="button" style={{ background: `${meta.color}15`, color: meta.color, border: `1px solid ${meta.color}30` }} onClick={() => confirmProposalPlan(plan)}>
                          <ThumbsUp size={14} />保存方案
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedProposalPlan && (
                <div className="proposal-detail-panel">
                  <div className="proposal-detail-header">
                    <div className="panel-title" style={{ marginBottom: 0 }}>
                      <ClipboardList size={18} />
                      <h2>{planTypeLabels[selectedProposalPlan.planType].name} - 每日播放拆分</h2>
                    </div>
                    <button className="cancel-btn compact" type="button" onClick={() => setSelectedProposalPlan(null)}>
                      <X size={14} />
                    </button>
                  </div>

                  <div className="proposal-detail-summary">
                    <div className="pds-item">
                      <span className="pds-label">原价总额</span>
                      <span className="pds-value">{money(selectedProposalPlan.originalAmount)}</span>
                    </div>
                    <div className="pds-item">
                      <span className="pds-label">折扣优惠</span>
                      <span className="pds-value discount">-{money(selectedProposalPlan.discountAmount)}</span>
                    </div>
                    <div className="pds-item">
                      <span className="pds-label">折后总额</span>
                      <span className="pds-value amount">{money(selectedProposalPlan.totalAmount)}</span>
                    </div>
                    <div className="pds-item">
                      <span className="pds-label">每条金额</span>
                      <span className="pds-value">{money(selectedProposalPlan.perRecordAmount)}</span>
                    </div>
                  </div>

                  <div className="proposal-detail-table-wrap">
                    <table className="proposal-detail-table">
                      <thead>
                        <tr>
                          <th>日期</th>
                          <th>星期</th>
                          <th>时段</th>
                          <th>播放</th>
                          <th>金额</th>
                          <th>状态</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedProposalPlan.rows.map((row) => {
                          const dayOfWeek = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][new Date(row.date).getDay()];
                          return (
                            <tr key={row.previewId} className={row.hasConflict ? 'row-conflict' : ''}>
                              <td>{row.date}</td>
                              <td>{dayOfWeek}</td>
                              <td>{row.slot}</td>
                              <td>{row.plays}次</td>
                              <td>{money(Number(row.amount))}</td>
                              <td>
                                {row.hasConflict ? (
                                  <span className="import-badge badge-conflict" title={row.conflictWith.map((c) => `${c.client}-${c.adName}`).join('、')}>
                                    冲突
                                  </span>
                                ) : (
                                  <span className="import-badge badge-ok">正常</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="proposal-detail-daily">
                    <div className="pdd-title">每日播放汇总</div>
                    <div className="pdd-chart">
                      {selectedProposalPlan.dailyBreakdown.map((day) => {
                        const maxPlays = Math.max(...selectedProposalPlan.dailyBreakdown.map((d) => d.plays), 1);
                        const height = (day.plays / maxPlays) * 100;
                        return (
                          <div key={day.date} className="pdd-col">
                            <div className="pdd-value">{day.plays}次</div>
                            <div className="pdd-bar-wrap">
                              <div className="pdd-bar" style={{ height: `${Math.max(height, day.plays > 0 ? 8 : 0)}%`, background: day.conflictCount > 0 ? '#dc2626' : planTypeLabels[selectedProposalPlan.planType].color }} />
                            </div>
                            <div className="pdd-meta">
                              <span>{day.date.slice(5)}</span>
                              <span>{money(day.amount)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {proposalStep === 'saved' && (
            <div className="proposal-saved-list">
              {proposals.length > 0 && (
                <div className="proposal-conflict-mode">
                  <span className="pcm-label">写入排期冲突处理：</span>
                  <label className={`conflict-mode-option ${proposalConflictMode === 'skip' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="proposalConflictMode"
                      checked={proposalConflictMode === 'skip'}
                      onChange={() => setProposalConflictMode('skip')}
                    />
                    <span>跳过冲突记录</span>
                  </label>
                  <label className={`conflict-mode-option ${proposalConflictMode === 'create' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="proposalConflictMode"
                      checked={proposalConflictMode === 'create'}
                      onChange={() => setProposalConflictMode('create')}
                    />
                    <span>强制创建并标记</span>
                  </label>
                </div>
              )}
              {proposals.length === 0 ? (
                <div className="proposal-empty">
                  <Calculator size={36} />
                  <p>暂无已保存的方案。请先在"方案配置"中生成并保存方案。</p>
                </div>
              ) : (
                proposals.map((proposal) => {
                  const meta = planTypeLabels[proposal.planType];
                  return (
                    <article key={proposal.id} className={`proposal-saved-card ${proposal.confirmed ? 'confirmed' : ''}`}>
                      <div className="proposal-saved-header">
                        <div>
                          <span className="proposal-card-type" style={{ background: `${meta.color}15`, color: meta.color }}>{meta.name}</span>
                          <strong className="proposal-saved-client">{proposal.form.client} - {proposal.form.adName}</strong>
                        </div>
                        <div className="proposal-saved-badges">
                          {proposal.confirmed ? (
                            <span className="import-badge badge-ok">已写入排期</span>
                          ) : (
                            <span className="import-badge badge-warn">待确认</span>
                          )}
                        </div>
                      </div>
                      <div className="proposal-saved-meta">
                        <span>频道：{getChannelById(proposal.form.channelId)?.name || '未知'}</span>
                        <span>日期：{proposal.form.startDate} ~ {proposal.form.endDate}</span>
                        <span>排期：{proposal.totalCount}条</span>
                        <span>播放：{proposal.totalPlays}次</span>
                        <span className="amount">合同额：{money(proposal.totalAmount)}</span>
                      </div>
                      <div className="proposal-saved-risks">
                        <span>冲突风险：<span className={`pr-badge ${riskLevelClass(proposal.conflictRisk)}`}>{riskLevelLabel(proposal.conflictRisk)}</span>
                          {proposal.conflictCount > 0 && ` · ${proposal.conflictCount}条/${proposal.totalCount}条`}
                        </span>
                        <span>素材风险：<span className={`pr-badge ${riskLevelClass(proposal.materialRisk)}`}>{riskLevelLabel(proposal.materialRisk)}</span>
                          {proposal.materialRisk.materialDetail
                            ? ` · 素材：${proposal.materialRisk.materialDetail.status}`
                            : proposal.firstPlayDate && ` · 距首播${proposal.materialRisk.daysAhead}天`}
                        </span>
                      </div>
                      {proposal.confirmed && proposal.createdRecordCount !== undefined && (
                        <div className="proposal-saved-confirmed-meta">
                          <span>已创建：{proposal.createdRecordCount}条</span>
                          {proposal.skippedConflictCount > 0 && <span>跳过冲突：{proposal.skippedConflictCount}条</span>}
                          <span>策略：{proposal.conflictModeUsed === 'skip' ? '跳过冲突' : '强制创建'}</span>
                        </div>
                      )}
                      <div className="proposal-saved-actions" onClick={(e) => e.stopPropagation()}>
                        {!proposal.confirmed && (
                          <button className="primary compact" type="button" onClick={() => confirmProposalToSchedule(proposal.id)}>
                            <CheckCircle2 size={14} />写入排期
                          </button>
                        )}
                        <button className="cancel-btn compact" type="button" onClick={() => cancelProposal(proposal.id)}>
                          <Ban size={14} />{proposal.confirmed ? '删除记录' : '取消方案'}
                        </button>
                      </div>
                      <div className="proposal-saved-time">
                        创建于 {new Date(proposal.createdAt).toLocaleString('zh-CN')}
                        {proposal.confirmedAt && ` · 确认于 ${new Date(proposal.confirmedAt).toLocaleString('zh-CN')}`}
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          )}
        </div>
      </section>

      <section className="conflict-section">
        <div className="panel">
          <div className="panel-title">
            <ShieldAlert size={18} />
            <h2>冲突处理中心</h2>
            {conflictGroups.length > 0 && (
              <span className="conflict-summary-badge">待处理 {conflictGroups.length} 组</span>
            )}
          </div>
          <p className="hint">同一天同一时段存在多条广告时，视为冲突。以下分组列出所有冲突，请逐组处理。</p>
          {conflictGroups.length === 0 ? (
            <div className="conflict-empty">
              <CheckCircle2 size={28} />
              <span>当前无时段冲突，所有排期正常。</span>
            </div>
          ) : (
            <div className="conflict-groups">
              {conflictGroups.map((group) => (
                <div key={group.key} className="conflict-group">
                  <div className="conflict-group-head">
                    <div className="conflict-group-label">
                      <AlertTriangle size={16} />
                      <span className={`channel-badge channel-badge-${group.channelId.replace('channel-', '')}`}>
                        {group.channelName}
                      </span>
                      <strong>{group.date}</strong>
                      <span className="conflict-slot-tag">{group.slot}</span>
                      <span className="conflict-count">{group.conflictCount}条冲突</span>
                    </div>
                    <div className="conflict-group-actions">
                      <button className="co-play-btn" type="button" onClick={() => resolveByCoPlay(group.key)}>
                        <Layers size={14} />整组标记可并播
                      </button>
                    </div>
                  </div>
                  <div className="conflict-group-summary">
                    <div className="summary-item">
                      <span className="summary-label">涉及客户</span>
                      <span className="summary-value">{group.clients.join('、')}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">总播放次数</span>
                      <span className="summary-value">{group.totalPlays}次</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">总合同额</span>
                      <span className="summary-value amount">{money(group.totalAmount)}</span>
                    </div>
                  </div>
                  <div className="conflict-items">
                    {group.items.map((item) => (
                      <div key={item.id} className="conflict-item" onClick={() => setSelected(item)}>
                        <div className="conflict-item-info">
                          <h4>{item.adName}</h4>
                          <p>客户：{item.client}</p>
                          <p>播放次数：{item.plays}次｜合同额：{money(Number(item.amount || 0))}</p>
                          <span className={'status ' + statusClass(item.status)}>{item.status}</span>
                        </div>
                        <div className="conflict-item-actions" onClick={(e) => e.stopPropagation()}>
                          {reslotTarget === item.id ? (
                            <div className="reslot-inline">
                              <select value={reslotValue} onChange={(e) => setReslotValue(e.target.value)}>
                                <option value="">选择新时段</option>
                                {getEnabledInventorySlots(group.channelId, inventory)
                                  .filter((opt) => opt !== group.slot)
                                  .map((opt) => <option key={opt}>{opt}</option>)}
                              </select>
                              <button className="primary compact" type="button" onClick={confirmReslot} disabled={!reslotValue}>
                                <CheckCircle2 size={14} />确认
                              </button>
                              <button className="cancel-btn compact" type="button" onClick={() => setReslotTarget(null)}>
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <button type="button" className="reslot-btn" onClick={() => resolveByReslot(item.id)}>
                                <Clock size={14} />改时段
                              </button>
                              <button type="button" className="co-play-single-btn" onClick={() => {
                                const next = records.map((r) => r.id === item.id ? { ...r, coPlay: true } : r);
                                persist(next);
                                if (selected?.id === item.id) setSelected(next.find((r) => r.id === item.id));
                              }}>
                                <Layers size={14} />标记可并播
                              </button>
                              <button type="button" className="delete-btn" onClick={() => resolveByDelete(item.id)}>
                                <MinusCircle size={14} />删除
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="archive-section">
        <div className="panel archive-form-panel">
          <div className="panel-title">
            <Users size={18} />
            <h2>客户档案</h2>
          </div>
          <form onSubmit={editingCustomer ? saveEditCustomer : addCustomer}>
            <div className="form-grid">
              <label>
                <span>客户名称</span>
                <input type="text" value={customerForm.name} onChange={(event) => setCustomerForm({ ...customerForm, name: event.target.value })} placeholder="蓝海家居" required />
              </label>
              <label>
                <span>联系人</span>
                <input type="text" value={customerForm.contact} onChange={(event) => setCustomerForm({ ...customerForm, contact: event.target.value })} placeholder="张经理" />
              </label>
              <label>
                <span>电话</span>
                <input type="tel" value={customerForm.phone} onChange={(event) => setCustomerForm({ ...customerForm, phone: event.target.value })} placeholder="138-0000-0000" />
              </label>
              <label>
                <span>常用广告时段</span>
                <select value={customerForm.preferredSlot} onChange={(event) => setCustomerForm({ ...customerForm, preferredSlot: event.target.value })}>
                  <option value="">不限</option>
                  {appConfig.fields.find((f) => f.key === 'slot')?.options.map((opt) => <option key={opt}>{opt}</option>)}
                </select>
              </label>
              <label>
                <span>历史合同额（元）</span>
                <input type="number" value={customerForm.historicalAmount} onChange={(event) => setCustomerForm({ ...customerForm, historicalAmount: event.target.value })} placeholder="50000" />
              </label>
              <label>
                <span>客户等级</span>
                <select value={customerForm.level} onChange={(event) => setCustomerForm({ ...customerForm, level: event.target.value })}>
                  <option value="">未设置</option>
                  {customerLevels.map((l) => <option key={l}>{l}</option>)}
                </select>
              </label>
              <label>
                <span>行业类型</span>
                <select value={customerForm.industry} onChange={(event) => setCustomerForm({ ...customerForm, industry: event.target.value })}>
                  <option value="">未设置</option>
                  {customerIndustries.map((i) => <option key={i}>{i}</option>)}
                </select>
              </label>
            </div>
            <div className="archive-form-actions">
              <button className="primary" type="submit">
                {editingCustomer ? <><CheckCircle2 size={18} />保存修改</> : <><UserPlus size={18} />添加客户</>}
              </button>
              {editingCustomer && <button type="button" className="cancel-btn" onClick={cancelEditCustomer}><X size={18} />取消</button>}
            </div>
          </form>
        </div>

        <div className="panel archive-list-panel">
          <div className="customer-list">
            {customers.length === 0 && <p className="empty">暂无客户档案，请在左侧添加。</p>}
            {customers.map((customer) => (
              <article className="customer-card" key={customer.id}>
                <div className="customer-head">
                  <div>
                    <h3>{customer.name}</h3>
                    <p>{customer.contact}<Phone size={12} />{customer.phone}</p>
                  </div>
                  <span className="customer-slot">{customer.preferredSlot || '不限'}</span>
                </div>
                <div className="customer-meta">
                  <span className="customer-tag">等级：{customer.level || '未设置'}</span>
                  <span className="customer-tag">行业：{customer.industry || '未设置'}</span>
                </div>
                <p className="customer-amount">历史合同额：{money(Number(customer.historicalAmount || 0))}</p>
                <div className="actions" onClick={(event) => event.stopPropagation()}>
                  <button type="button" onClick={() => startEditCustomer(customer)}><Pencil size={14} />编辑</button>
                  <button className="ghost-danger" type="button" onClick={() => removeCustomer(customer.id)}><Trash2 size={14} /></button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="broadcast-section">
        <div className="panel broadcast-list-panel">
          <div className="panel-title">
            <Mic2 size={18} />
            <h2>播出回填</h2>
            <span className="broadcast-hint">记录每条已排期广告的实际播出情况</span>
          </div>
          <div className="toolbar broadcast-toolbar">
            <div className="search">
              <Search size={16} />
              <input
                value={broadcastFilter.query}
                onChange={(e) => setBroadcastFilter({ ...broadcastFilter, query: e.target.value })}
                placeholder="搜索客户/广告名称"
              />
            </div>
            <select
              value={broadcastFilter.status}
              onChange={(e) => setBroadcastFilter({ ...broadcastFilter, status: e.target.value })}
            >
              <option>全部</option>
              <option>未开始</option>
              <option>未完成</option>
              <option>已完成</option>
              <option>超播</option>
            </select>
            <div className="date-range-filter">
              <CalendarRange size={16} />
              <input
                type="date"
                value={broadcastFilter.startDate}
                onChange={(e) => setBroadcastFilter({ ...broadcastFilter, startDate: e.target.value })}
                placeholder="开始日期"
              />
              <span className="date-range-sep">至</span>
              <input
                type="date"
                value={broadcastFilter.endDate}
                onChange={(e) => setBroadcastFilter({ ...broadcastFilter, endDate: e.target.value })}
                placeholder="结束日期"
              />
            </div>
            <button
              type="button"
              className="ghost compact"
              onClick={() => setBroadcastFilter({ query: '', status: '全部', startDate: '', endDate: '' })}
            >
              <RotateCcw size={14} />清空
            </button>
          </div>
          <div className="broadcast-records">
            {broadcastListData.map((item) => {
              const actual = getActualPlays(item);
              const planned = Number(item.plays || 0);
              const status = getBroadcastStatus(item);
              const progress = planned > 0 ? Math.min(100, (actual / planned) * 100) : 0;
              const isSelected = broadcastDetail?.id === item.id;
              return (
                <article
                  className={`broadcast-record ${isSelected ? 'selected' : ''}`}
                  key={item.id}
                  onClick={() => setBroadcastDetail(item)}
                >
                  <div className="broadcast-record-head">
                    <div>
                      <h3>{item.adName}</h3>
                      <p>{item.client} · {item.date} · {item.slot}</p>
                    </div>
                    <span className={'status ' + getBroadcastStatusClass(status)}>{status}</span>
                  </div>
                  <div className="broadcast-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${progress}%`,
                          background: status === '超播' ? '#dc2626' : status === '已完成' ? '#059669' : 'var(--accent)'
                        }}
                      />
                    </div>
                    <span className="progress-text">
                      {actual} / {planned} 次
                      {status === '超播' && <em>（超{actual - planned}次）</em>}
                    </span>
                  </div>
                  <div className="broadcast-record-actions" onClick={(e) => e.stopPropagation()}>
                    <button type="button" className="primary compact" onClick={() => openBroadcastModal(item)}>
                      <PlayCircle size={14} />登记播出
                    </button>
                    <span className="broadcast-log-count">
                      共{(item.broadcastLogs || []).length}条记录
                    </span>
                  </div>
                </article>
              );
            })}
            {broadcastListData.length === 0 && (
              <p className="empty">
                {hasBroadcastFilter
                  ? '当前筛选条件下没有匹配的广告记录，请调整筛选条件。'
                  : '暂无已排期的广告记录。'}
              </p>
            )}
          </div>
        </div>

        <aside className="panel broadcast-detail-panel">
          <div className="panel-title">
            <ListVideo size={18} />
            <h2>播出详情</h2>
          </div>
          {broadcastDetail ? (
            <div className="broadcast-detail">
              <h3>{broadcastDetail.adName}</h3>
              <p>{broadcastDetail.client} · {broadcastDetail.date} · {broadcastDetail.slot}</p>
              <div className="broadcast-detail-summary">
                <div className="bds-item">
                  <span className="bds-label">计划播放</span>
                  <span className="bds-value">{broadcastDetail.plays}次</span>
                </div>
                <div className="bds-item">
                  <span className="bds-label">实际播放</span>
                  <span className="bds-value">{getActualPlays(broadcastDetail)}次</span>
                </div>
                <div className="bds-item">
                  <span className="bds-label">播出状态</span>
                  <span className={'status ' + getBroadcastStatusClass(getBroadcastStatus(broadcastDetail))}>
                    {getBroadcastStatus(broadcastDetail)}
                  </span>
                </div>
              </div>
              <button className="primary" type="button" onClick={() => openBroadcastModal(broadcastDetail)}>
                <Plus size={16} />登记播出
              </button>
              <div className="detail-section-title">播出记录</div>
              {broadcastDetail.broadcastLogs && broadcastDetail.broadcastLogs.length > 0 ? (
                <div className="broadcast-log-list">
                  {[...broadcastDetail.broadcastLogs]
                    .sort((a, b) => new Date(b.broadcastTime) - new Date(a.broadcastTime))
                    .map((log, index) => (
                      <div className="broadcast-log-item" key={log.id}>
                        <div className="log-dot" />
                        <div className="log-content">
                          <div className="log-head">
                            <span className="log-time">{log.broadcastTime.replace('T', ' ')}</span>
                            <span className="log-plays">{log.plays}次</span>
                          </div>
                          {log.remark && <p className="log-remark">{log.remark}</p>}
                        </div>
                        <button
                          className="ghost-danger compact"
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('确定要删除这条播出记录吗？')) {
                              removeBroadcastLog(broadcastDetail.id, log.id);
                            }
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="empty">暂无播出记录，点击上方按钮开始登记。</p>
              )}
            </div>
          ) : (
            <p className="empty">点击左侧任意广告查看播出详情和记录。</p>
          )}
        </aside>
      </section>

      <section className="calendar-section">
        <div className="panel calendar-panel">
          <div className="calendar-header">
            <div className="panel-title" style={{ marginBottom: 0 }}>
              <Calendar size={18} />
              <h2>排期日历</h2>
            </div>
            <div className="calendar-nav">
              <button type="button" className="nav-btn" onClick={() => setWeekOffset(weekOffset - 1)}>
                <ChevronLeft size={18} />
              </button>
              <span className="week-label">{weekRangeLabel}</span>
              <button type="button" className="nav-btn" onClick={() => setWeekOffset(weekOffset + 1)}>
                <ChevronRight size={18} />
              </button>
              <button type="button" className="today-btn" onClick={() => { setWeekOffset(0); setSelectedDate(null); }}>
                今天
              </button>
            </div>
          </div>
          <div className="week-grid">
            {weekDays.map((day) => {
              const stats = dailyStats[day.date] || { count: 0, plays: 0, amount: 0 };
              const isSelected = selectedDate === day.date;
              return (
                <div
                  key={day.date}
                  className={`calendar-day ${day.isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${stats.count === 0 ? 'empty' : ''}`}
                  onClick={() => toggleDateFilter(day.date)}
                >
                  <div className="day-head">
                    <span className="day-name">{day.dayName}</span>
                    <span className="day-num">{day.dayNum}</span>
                  </div>
                  <div className="day-stats">
                    <div className="day-stat">
                      <span className="stat-label">广告数</span>
                      <span className="stat-value">{stats.count}</span>
                    </div>
                    <div className="day-stat">
                      <span className="stat-label">播放次</span>
                      <span className="stat-value">{stats.plays}</span>
                    </div>
                    <div className="day-stat">
                      <span className="stat-label">合同额</span>
                      <span className="stat-value amount">{money(stats.amount)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {selectedDate && (
            <div className="filter-hint">
              <span>已筛选：{selectedDate}</span>
              <button type="button" onClick={() => setSelectedDate(null)}>清除筛选</button>
            </div>
          )}
        </div>
      </section>

      <section className="analytics-section">
        <div className="panel analytics-panel">
          <div className="panel-title">
            <BarChart3 size={18} />
            <h2>经营分析</h2>
            <span className="analytics-hint">基于当前筛选结果实时统计</span>
          </div>

          <div className="analytics-tabs">
            <button
              type="button"
              className={`analytics-tab ${analyticsTab === 'ranking' ? 'active' : ''}`}
              onClick={() => setAnalyticsTab('ranking')}
            >
              <Users size={16} />
              客户维度排行
            </button>
            <button
              type="button"
              className={`analytics-tab ${analyticsTab === 'utilization' ? 'active' : ''}`}
              onClick={() => setAnalyticsTab('utilization')}
            >
              <PieChart size={16} />
              时段利用率
            </button>
            <button
              type="button"
              className={`analytics-tab ${analyticsTab === 'trend' ? 'active' : ''}`}
              onClick={() => setAnalyticsTab('trend')}
            >
              <TrendingUp size={16} />
              近7天收入趋势
            </button>
          </div>

          {!analyticsHasData ? (
            <div className="analytics-empty">
              <Inbox size={48} />
              <h3>暂无经营数据</h3>
              <p>当前筛选条件下没有排期记录，请调整筛选或添加新的排期。</p>
            </div>
          ) : (
            <>
              {analyticsTab === 'ranking' && (
                <div className="ranking-view">
                  <div className="ranking-summary">
                    <div className="ranking-summary-item">
                      <span className="rs-label">客户总数</span>
                      <span className="rs-value">{clientRankingStats.length}</span>
                    </div>
                    <div className="ranking-summary-item">
                      <span className="rs-label">合同总额</span>
                      <span className="rs-value amount">{money(clientRankingStats.reduce((s, c) => s + c.amount, 0))}</span>
                    </div>
                    <div className="ranking-summary-item">
                      <span className="rs-label">总播放次</span>
                      <span className="rs-value">{clientRankingStats.reduce((s, c) => s + c.plays, 0)}次</span>
                    </div>
                    <div className="ranking-summary-item">
                      <span className="rs-label">待确认</span>
                      <span className="rs-value pending">{clientRankingStats.reduce((s, c) => s + c.pendingCount, 0)}条</span>
                    </div>
                    <div className="ranking-summary-item">
                      <span className="rs-label">冲突数</span>
                      <span className="rs-value conflict">{clientRankingStats.reduce((s, c) => s + c.conflictCount, 0)}条</span>
                    </div>
                  </div>
                  <div className="ranking-list">
                    {clientRankingStats.map((client, index) => {
                      const maxAmount = clientRankingStats[0]?.amount || 1;
                      const barWidth = (client.amount / maxAmount) * 100;
                      return (
                        <div key={client.client} className="ranking-row">
                          <div className="ranking-rank">
                            <span className={`rank-badge ${index < 3 ? 'rank-top' : ''}`}>{index + 1}</span>
                          </div>
                          <div className="ranking-info">
                            <div className="ranking-name-row">
                              <strong className="ranking-client">{client.client}</strong>
                              <span className="ranking-amount">{money(client.amount)}</span>
                            </div>
                            <div className="ranking-bar">
                              <div className="ranking-bar-fill" style={{ width: `${barWidth}%` }} />
                            </div>
                            <div className="ranking-meta">
                              <span>{client.recordCount}条排期</span>
                              <span>播放{client.plays}次</span>
                              {client.pendingCount > 0 && <span className="meta-pending">{client.pendingCount}待确认</span>}
                              {client.conflictCount > 0 && <span className="meta-conflict"><AlertTriangle size={12} />{client.conflictCount}冲突</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {analyticsTab === 'utilization' && (
                <div className="utilization-view">
                  <div className="utilization-list">
                    {slotUtilizationStats.map((slot) => (
                      <div key={slot.slot} className="utilization-row">
                        <div className="utilization-slot">
                          <strong>{slot.slot}</strong>
                          <span className="utilization-percent">{slot.utilization.toFixed(1)}%</span>
                        </div>
                        <div className="utilization-bar">
                          <div
                            className="utilization-bar-fill"
                            style={{
                              width: `${Math.min(100, slot.utilization)}%`,
                              background: slot.conflictCount > 0 ? '#f59e0b' : 'var(--accent)',
                            }}
                          />
                        </div>
                        <div className="utilization-meta">
                          <div className="utilization-meta-item">
                            <span className="um-label">排期</span>
                            <span className="um-value">{slot.recordCount}条</span>
                          </div>
                          <div className="utilization-meta-item">
                            <span className="um-label">播放</span>
                            <span className="um-value">{slot.plays}次</span>
                          </div>
                          <div className="utilization-meta-item">
                            <span className="um-label">客户</span>
                            <span className="um-value">{slot.clientCount}个</span>
                          </div>
                          <div className="utilization-meta-item">
                            <span className="um-label">合同额</span>
                            <span className="um-value amount">{money(slot.amount)}</span>
                          </div>
                          {slot.conflictCount > 0 && (
                            <div className="utilization-meta-item">
                              <span className="um-label">冲突</span>
                              <span className="um-value conflict">{slot.conflictCount}条</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analyticsTab === 'trend' && (
                <div className="trend-view">
                  <div className="trend-summary">
                    <div className="trend-summary-item">
                      <span className="ts-label">7天总收入</span>
                      <span className="ts-value amount">{money(last7DaysRevenue.reduce((s, d) => s + d.amount, 0))}</span>
                    </div>
                    <div className="trend-summary-item">
                      <span className="ts-label">日均收入</span>
                      <span className="ts-value amount">{money(last7DaysRevenue.reduce((s, d) => s + d.amount, 0) / 7)}</span>
                    </div>
                    <div className="trend-summary-item">
                      <span className="ts-label">7天总排期</span>
                      <span className="ts-value">{last7DaysRevenue.reduce((s, d) => s + d.recordCount, 0)}条</span>
                    </div>
                    <div className="trend-summary-item">
                      <span className="ts-label">7天总播放</span>
                      <span className="ts-value">{last7DaysRevenue.reduce((s, d) => s + d.plays, 0)}次</span>
                    </div>
                  </div>
                  <div className="trend-chart">
                    {(() => {
                      const maxAmount = Math.max(...last7DaysRevenue.map((d) => d.amount), 1);
                      return last7DaysRevenue.map((day) => {
                        const height = (day.amount / maxAmount) * 100;
                        return (
                          <div key={day.date} className="trend-bar-col">
                            <div className="trend-bar-value">{day.amount > 0 ? money(day.amount) : ''}</div>
                            <div className="trend-bar-wrap">
                              <div
                                className="trend-bar-fill"
                                style={{ height: `${Math.max(height, day.amount > 0 ? 4 : 0)}%` }}
                              />
                            </div>
                            <div className="trend-bar-meta">
                              <span className="trend-day-name">{day.dayName}</span>
                              <span className="trend-day-num">{day.dayNum}</span>
                              <span className="trend-bar-count">{day.recordCount}条</span>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <section className="material-section">
        <div className="panel material-list-panel">
          <div className="panel-title">
            <Package size={18} />
            <h2>广告素材清单</h2>
            <span className="broadcast-hint">关联广告排期与素材准备状态</span>
          </div>

          <div className="metrics material-metrics">
            {materialMetrics.map((metric) => (
              <article className={`metric ${metric.highlight ? 'metric-highlight' : ''}`} key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
              </article>
            ))}
          </div>

          <div className="toolbar">
            <div className="search">
              <Search size={16} />
              <input
                value={materialFilter.query}
                onChange={(e) => setMaterialFilter({ ...materialFilter, query: e.target.value })}
                placeholder="搜索客户/广告名称"
              />
            </div>
            <select
              value={materialFilter.status}
              onChange={(e) => setMaterialFilter({ ...materialFilter, status: e.target.value })}
            >
              <option>全部</option>
              {materialStatuses.map((status) => <option key={status}>{status}</option>)}
            </select>
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={materialFilter.showUndeliveredOnly}
                onChange={(e) => setMaterialFilter({ ...materialFilter, showUndeliveredOnly: e.target.checked, showUpcomingUndeliveredOnly: e.target.checked ? false : materialFilter.showUpcomingUndeliveredOnly })}
              />
              <span>仅显示待交付</span>
            </label>
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={materialFilter.showUpcomingUndeliveredOnly}
                onChange={(e) => setMaterialFilter({ ...materialFilter, showUpcomingUndeliveredOnly: e.target.checked, showUndeliveredOnly: e.target.checked ? false : materialFilter.showUndeliveredOnly })}
              />
              <span>临近投放未交付（3天内）</span>
            </label>
          </div>

          <div className="material-records">
            {materialListData.length === 0 ? (
              <p className="empty">暂无匹配的广告排期记录。</p>
            ) : (
              materialListData.map((schedule) => {
                const material = getMaterialByScheduleId(schedule.id);
                const needsMaterial = isMaterialUndeliveredWarning(schedule, material);
                return (
                  <article
                    key={schedule.id}
                    className={`material-record ${needsMaterial ? 'needs-material' : ''}`}
                    onClick={() => setMaterialDetail(schedule)}
                  >
                    <div className="material-record-head">
                      <div>
                        <h3>{schedule.adName}</h3>
                        <p>{schedule.client} · {schedule.date} · {schedule.slot}</p>
                      </div>
                      <span className={'status ' + statusClass(schedule.status)}>{schedule.status}</span>
                    </div>

                    {material ? (
                      <div className="material-info">
                        <div className="material-info-row">
                          <span className="material-info-label"><FileText size={14} />文案</span>
                          <span className="material-info-value">{material.copyTitle || '-'}</span>
                        </div>
                        <div className="material-info-row">
                          <span className="material-info-label"><Clock size={14} />时长</span>
                          <span className="material-info-value">{material.durationSeconds ? `${material.durationSeconds}秒` : '-'}</span>
                        </div>
                        <div className="material-info-row">
                          <span className="material-info-label"><CalendarDays size={14} />交付日期</span>
                          <span className="material-info-value">{material.deliveryDate || '-'}</span>
                        </div>
                        <div className="material-status-row">
                          <span className="material-info-label">制作状态</span>
                          <span className={'status ' + getMaterialStatusClass(material.productionStatus)}>
                            {material.productionStatus}
                          </span>
                        </div>
                        {material.remarks && (
                          <div className="material-info-row">
                            <span className="material-info-label">备注</span>
                            <span className="material-info-value">{material.remarks}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="no-material-warning">
                        <AlertTriangle size={16} />
                        <span>尚未绑定素材记录</span>
                      </div>
                    )}

                    <div className="material-actions" onClick={(e) => e.stopPropagation()}>
                      {material ? (
                        <>
                          <button type="button" className="primary compact" onClick={() => openMaterialModal(schedule, material)}>
                            <Pencil size={14} />编辑素材
                          </button>
                          <button type="button" className="ghost-danger compact" onClick={() => removeMaterial(material.id)}>
                            <Trash2 size={14} />
                          </button>
                        </>
                      ) : (
                        <button type="button" className="primary compact" onClick={() => openMaterialModal(schedule)}>
                          <Plus size={14} />绑定素材
                        </button>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>

        <aside className="panel material-detail-panel">
          <div className="panel-title">
            <FileText size={18} />
            <h2>素材详情</h2>
          </div>
          {materialDetail ? (
            <div className="material-detail">
              <h3>{materialDetail.adName}</h3>
              <p>{materialDetail.client} · {materialDetail.date} · {materialDetail.slot}</p>
              <p><span className={'status ' + statusClass(materialDetail.status)}>{materialDetail.status}</span></p>

              {(() => {
                const material = getMaterialByScheduleId(materialDetail.id);
                if (!material) {
                  return (
                    <div className="material-detail-empty">
                      <AlertTriangle size={24} />
                      <p>此广告尚未绑定素材记录</p>
                      <button type="button" className="primary" onClick={() => openMaterialModal(materialDetail)}>
                        <Plus size={16} />绑定素材
                      </button>
                    </div>
                  );
                }
                return (
                  <>
                    <div className="material-detail-summary">
                      <div className="bds-item">
                        <span className="bds-label">文案标题</span>
                        <span className="bds-value">{material.copyTitle || '-'}</span>
                      </div>
                      <div className="bds-item">
                        <span className="bds-label">时长</span>
                        <span className="bds-value">{material.durationSeconds ? `${material.durationSeconds}秒` : '-'}</span>
                      </div>
                      <div className="bds-item">
                        <span className="bds-label">制作状态</span>
                        <span className={'status ' + getMaterialStatusClass(material.productionStatus)}>
                          {material.productionStatus}
                        </span>
                      </div>
                      <div className="bds-item">
                        <span className="bds-label">交付日期</span>
                        <span className="bds-value">{material.deliveryDate || '-'}</span>
                      </div>
                    </div>

                    {material.remarks && (
                      <div className="material-detail-remarks">
                        <div className="detail-section-title">备注</div>
                        <p>{material.remarks}</p>
                      </div>
                    )}

                    <div className="material-detail-actions">
                      <button type="button" className="primary" onClick={() => openMaterialModal(materialDetail, material)}>
                        <Pencil size={16} />编辑素材
                      </button>
                      <button type="button" className="ghost-danger" onClick={() => removeMaterial(material.id)}>
                        <Trash2 size={16} />删除
                      </button>
                    </div>

                    <div className="detail-section-title">
                      <History size={14} />状态变更历史
                    </div>
                    {material.statusHistory && material.statusHistory.length > 0 ? (
                      <div className="material-timeline">
                        {[...material.statusHistory]
                          .sort((a, b) => new Date(b.at) - new Date(a.at))
                          .map((step, index) => (
                            <div className="material-timeline-item" key={index}>
                              <div className="timeline-dot" />
                              <div className="timeline-content">
                                <div className="timeline-head">
                                  <span className={'status small ' + getMaterialStatusClass(step.status)}>
                                    {step.status}
                                  </span>
                                  <span className="timeline-time">
                                    {step.at.replace('T', ' ').slice(0, 19)}
                                  </span>
                                </div>
                                <div className="timeline-meta">
                                  <span>操作人：{step.by}</span>
                                  {step.remark && <span className="timeline-remark">{step.remark}</span>}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="empty">暂无状态变更记录</p>
                    )}
                  </>
                );
              })()}
            </div>
          ) : (
            <p className="empty">点击左侧任意广告查看素材详情。</p>
          )}
        </aside>
      </section>

      <section className="insights">
        <div className="panel">
          <div className="panel-title">
            <CalendarDays size={18} />
            <h2>{appConfig.directory ? '证据目录预览' : appConfig.board ? '床位看板' : '分组视图'}</h2>
          </div>
          {appConfig.directory ? (
            <div className="directory">
              {Object.entries(directory).map(([issue, items]) => (
                <div key={issue} className="directory-group">
                  <strong>{issue}</strong>
                  {items.map((item, index) => <span key={item.id}>{index + 1}. {item.evidence}｜{item.purpose}</span>)}
                </div>
              ))}
            </div>
          ) : (
            <div className="date-groups">
              {Object.entries(groupedByDateSlot).map(([date, slots]) => (
                <div key={date} className="date-group">
                  <div className="date-group-head">
                    <strong>{date}</strong>
                    <span className="date-group-total">{Object.values(slots).flat().length}条记录</span>
                  </div>
                  <div className="slot-groups">
                    {Object.entries(slots).map(([slot, slotItems]) => {
                      const nonCoPlayItems = slotItems.filter((r) => !r.coPlay);
                      const usageByChannel = nonCoPlayItems.reduce((acc, item) => {
                        const channelId = item.channelId || 'channel-news';
                        acc[channelId] = (acc[channelId] || 0) + 1;
                        return acc;
                      }, {});
                      const conflictCount = Object.entries(usageByChannel).reduce((total, [channelId, count]) => {
                        return total + (getSlotCapacityState(channelId, slot, count, inventory).isOverCapacity ? count : 0);
                      }, 0);
                      const hasConflict = conflictCount > 0;
                      const hasCoPlay = slotItems.some((r) => r.coPlay);
                      return (
                        <div key={slot} className={`slot-group ${hasConflict ? 'slot-conflict' : ''} ${hasCoPlay ? 'slot-coplay' : ''}`}>
                          <div className="slot-group-head">
                            <span className="slot-name">{slot}</span>
                            {hasConflict && (
                              <span className="slot-conflict-tag">
                                <AlertTriangle size={12} />{conflictCount}条冲突
                              </span>
                            )}
                            {hasCoPlay && (
                              <span className="slot-coplay-tag">
                                <Layers size={12} />可并播
                              </span>
                            )}
                          </div>
                          <div className="slot-ad-list">
                            {slotItems.map((item) => (
                              <div
                                key={item.id}
                                className={`slot-ad-item ${isConflicted.has(item.id) ? 'ad-conflict' : ''} ${item.coPlay ? 'ad-coplay' : ''}`}
                                onClick={() => setSelected(item)}
                              >
                                <div className="ad-item-header">
                                  <span className="ad-name">{item.adName}</span>
                                  {item.channelId && (
                                    <span
                                      className="channel-badge channel-news"
                                      style={{ backgroundColor: `${getChannelColor(item.channelId)}20`, color: getChannelColor(item.channelId) }}
                                    >
                                      {getChannelById(item.channelId)?.name}
                                    </span>
                                  )}
                                </div>
                                <span className="ad-client">{item.client}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="panel detail-panel">
          <div className="panel-title">
            <CheckCircle2 size={18} />
            <h2>详情</h2>
          </div>
          {selected ? (
            <div className="detail">
              <h3>{selected.adName}</h3>
              <p>{`${selected.client} · ${selected.date} · ${selected.slot}`}</p>
              {selected.channelId && (
                <p style={{ margin: '4px 0' }}>
                  <span className={`channel-badge channel-badge-${selected.channelId.replace('channel-', '')}`}>
                    {getChannelById(selected.channelId)?.name || '未知频道'}
                  </span>
                </p>
              )}
              <p>{`播放${selected.plays}次｜合同${money(Number(selected.amount || 0))}`}</p>
              <p><span className={'status ' + statusClass(selected.status)}>{selected.status}</span></p>
              {isConflicted.has(selected.id) && <div className="warning"><AlertTriangle size={15} />时段冲突</div>}
              {selected.coPlay && <div className="conflict-badge-co"><Layers size={12} />已标记可并播</div>}
              {selected.batchFlag && <div className="batch-flag-badge"><Flag size={12} />批量生成（含冲突）</div>}

              {isConflicted.has(selected.id) && (
                <div className="detail-conflict-actions">
                  <div className="detail-section-title">冲突处理</div>
                  {reslotTarget === selected.id ? (
                    <div className="reslot-inline">
                      <select value={reslotValue} onChange={(e) => setReslotValue(e.target.value)}>
                        <option value="">选择新时段</option>
                        {getEnabledInventorySlots(selected.channelId || selectedChannel, inventory)
                          .filter((opt) => opt !== selected.slot)
                          .map((opt) => <option key={opt}>{opt}</option>)}
                      </select>
                      <button className="primary compact" type="button" onClick={confirmReslot} disabled={!reslotValue}>
                        <CheckCircle2 size={14} />确认
                      </button>
                      <button className="cancel-btn compact" type="button" onClick={() => { setReslotTarget(null); setReslotValue(''); }}>
                        <X size={14} />取消
                      </button>
                    </div>
                  ) : (
                    <div className="detail-action-btns">
                      <button type="button" className="reslot-btn" onClick={() => resolveByReslot(selected.id)}>
                        <Clock size={14} />改时段
                      </button>
                      <button type="button" className="co-play-single-btn" onClick={() => {
                        const next = records.map((r) => r.id === selected.id ? { ...r, coPlay: true } : r);
                        persist(next);
                        setSelected(next.find((r) => r.id === selected.id));
                      }}>
                        <Layers size={14} />标记可并播
                      </button>
                      <button type="button" className="delete-btn" onClick={() => resolveByDelete(selected.id)}>
                        <MinusCircle size={14} />删除
                      </button>
                    </div>
                  )}
                </div>
              )}

              {selected.coPlay && !isConflicted.has(selected.id) && (
                <div className="detail-conflict-actions">
                  <div className="detail-section-title">可并播管理</div>
                  <div className="detail-action-btns">
                    <button type="button" className="co-play-single-btn" onClick={() => {
                      const next = records.map((r) => r.id === selected.id ? { ...r, coPlay: false } : r);
                      persist(next);
                      setSelected(next.find((r) => r.id === selected.id));
                    }}>
                      <XCircle size={14} />取消可并播
                    </button>
                  </div>
                </div>
              )}

              {selected.temps && (
                <div className="temp-chart">
                  {selected.temps.map((value, index) => <i key={index} style={{ height: Math.max(10, 56 + Number(value) * 8) }} title={String(value)} />)}
                </div>
              )}

              {selected.status !== '待确认' && (
                <div className="detail-broadcast-section">
                  <div className="detail-section-title">播出进度</div>
                  <div className="detail-broadcast-summary">
                    <div className="dbs-item">
                      <span className="dbs-label">计划</span>
                      <span className="dbs-value">{selected.plays}次</span>
                    </div>
                    <div className="dbs-item">
                      <span className="dbs-label">实际</span>
                      <span className="dbs-value">{getActualPlays(selected)}次</span>
                    </div>
                    <div className="dbs-item">
                      <span className="dbs-label">状态</span>
                      <span className={'status ' + getBroadcastStatusClass(getBroadcastStatus(selected))}>
                        {getBroadcastStatus(selected)}
                      </span>
                    </div>
                  </div>
                  <div className="detail-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${Number(selected.plays) > 0 ? Math.min(100, (getActualPlays(selected) / Number(selected.plays)) * 100) : 0}%`,
                          background: getBroadcastStatus(selected) === '超播' ? '#dc2626' : getBroadcastStatus(selected) === '已完成' ? '#059669' : 'var(--accent)'
                        }}
                      />
                    </div>
                  </div>
                  <button type="button" className="primary compact" onClick={() => openBroadcastModal(selected)}>
                    <PlayCircle size={14} />登记播出
                  </button>

                  {(selected.broadcastLogs || []).length > 0 && (
                    <>
                      <div className="detail-section-title">播出记录</div>
                      <div className="detail-broadcast-logs">
                        {[...selected.broadcastLogs]
                          .sort((a, b) => new Date(b.broadcastTime) - new Date(a.broadcastTime))
                          .slice(0, 5)
                          .map((log) => (
                            <div className="detail-log-item" key={log.id}>
                              <span className="detail-log-time">{log.broadcastTime.replace('T', ' ')}</span>
                              <span className="detail-log-plays">{log.plays}次</span>
                              {log.remark && <span className="detail-log-remark">{log.remark}</span>}
                            </div>
                          ))}
                        {(selected.broadcastLogs || []).length > 5 && (
                          <span className="detail-log-more">共{(selected.broadcastLogs || []).length}条记录，请到播出回填模块查看详情</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="detail-material-section">
                <div className="detail-section-title">
                  <Package size={14} />素材信息
                </div>
                {(() => {
                  const material = getMaterialByScheduleId(selected.id);
                  if (!material) {
                    const needsMaterial = isMaterialUndeliveredWarning(selected, material);
                    return (
                      <div className="detail-material-empty">
                        {needsMaterial && (
                          <div className="material-warning inline">
                            <AlertTriangle size={14} />素材未交付
                          </div>
                        )}
                        <p>此广告尚未绑定素材记录</p>
                        <button type="button" className="primary compact" onClick={() => openMaterialModal(selected)}>
                          <Plus size={14} />绑定素材
                        </button>
                      </div>
                    );
                  }
                  return (
                    <>
                      <div className="detail-material-summary">
                        <div className="dbs-item">
                          <span className="dbs-label">文案标题</span>
                          <span className="dbs-value">{material.copyTitle || '-'}</span>
                        </div>
                        <div className="dbs-item">
                          <span className="dbs-label">时长</span>
                          <span className="dbs-value">{material.durationSeconds ? `${material.durationSeconds}秒` : '-'}</span>
                        </div>
                        <div className="dbs-item">
                          <span className="dbs-label">制作状态</span>
                          <span className={'status ' + getMaterialStatusClass(material.productionStatus)}>
                            {material.productionStatus}
                          </span>
                        </div>
                        <div className="dbs-item">
                          <span className="dbs-label">交付日期</span>
                          <span className="dbs-value">{material.deliveryDate || '-'}</span>
                        </div>
                      </div>
                      {material.remarks && (
                        <div className="detail-material-remarks">
                          <div className="detail-section-title">备注</div>
                          <p>{material.remarks}</p>
                        </div>
                      )}
                      <div className="detail-material-actions">
                        <button type="button" className="primary compact" onClick={() => openMaterialModal(selected, material)}>
                          <Pencil size={14} />编辑素材
                        </button>
                      </div>
                      <div className="detail-section-title">
                        <History size={14} />素材状态变更历史
                      </div>
                      {material.statusHistory && material.statusHistory.length > 0 ? (
                        <div className="detail-material-timeline">
                          {[...material.statusHistory]
                            .sort((a, b) => new Date(b.at) - new Date(a.at))
                            .map((step, index) => (
                              <div className="material-timeline-item" key={index}>
                                <div className="timeline-dot" />
                                <div className="timeline-content">
                                  <div className="timeline-head">
                                    <span className={'status small ' + getMaterialStatusClass(step.status)}>
                                      {step.status}
                                    </span>
                                    <span className="timeline-time">
                                      {step.at.replace('T', ' ').slice(0, 19)}
                                    </span>
                                  </div>
                                  <div className="timeline-meta">
                                    <span>操作人：{step.by}</span>
                                    {step.remark && <span className="timeline-remark">{step.remark}</span>}
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="empty small">暂无状态变更记录</p>
                      )}
                    </>
                  );
                })()}
              </div>

              <div className="timeline">
                {(selected.timeline || []).map((step, index) => (
                  <span key={index}>{step.at} · {step.status} · {step.by}</span>
                ))}
              </div>
            </div>
          ) : (
            <p className="empty">点击任意记录查看详情和状态流转。</p>
          )}
        </aside>
      </section>

      {broadcastModalOpen && broadcastTarget && (
        <div className="modal-overlay" onClick={closeBroadcastModal}>
          <div className="modal-content broadcast-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="panel-title" style={{ marginBottom: 0 }}>
                <PlayCircle size={18} />
                <h2>登记播出</h2>
              </div>
              <button type="button" className="modal-close" onClick={closeBroadcastModal}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="broadcast-modal-info">
                <p><strong>广告：</strong>{broadcastTarget.adName}</p>
                <p><strong>客户：</strong>{broadcastTarget.client}</p>
                <p><strong>计划播放：</strong>{broadcastTarget.plays}次</p>
                <p><strong>已播放：</strong>{getActualPlays(broadcastTarget)}次</p>
              </div>
              <form onSubmit={addBroadcastLog}>
                <div className="form-grid">
                  <label>
                    <span>播出时间</span>
                    <input
                      type="datetime-local"
                      value={broadcastForm.broadcastTime}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, broadcastTime: e.target.value })}
                      required
                    />
                  </label>
                  <label>
                    <span>播出次数</span>
                    <input
                      type="number"
                      min="1"
                      value={broadcastForm.plays}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, plays: e.target.value })}
                      placeholder="1"
                      required
                    />
                  </label>
                  <label className="wide">
                    <span>备注</span>
                    <textarea
                      value={broadcastForm.remark}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, remark: e.target.value })}
                      placeholder="可选，填写播出说明或特殊情况"
                      rows={3}
                    />
                  </label>
                </div>
                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={closeBroadcastModal}>
                    取消
                  </button>
                  <button type="submit" className="primary">
                    <CheckCircle2 size={16} />确认登记
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {materialModalOpen && materialTargetSchedule && (
        <div className="modal-overlay" onClick={closeMaterialModal}>
          <div className="modal-content material-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="panel-title" style={{ marginBottom: 0 }}>
                <Package size={18} />
                <h2>{editingMaterial ? '编辑素材' : '绑定素材'}</h2>
              </div>
              <button type="button" className="modal-close" onClick={closeMaterialModal}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="broadcast-modal-info">
                <p><strong>广告：</strong>{materialTargetSchedule.adName}</p>
                <p><strong>客户：</strong>{materialTargetSchedule.client}</p>
                <p><strong>投放日期：</strong>{materialTargetSchedule.date}</p>
                <p><strong>时段：</strong>{materialTargetSchedule.slot}</p>
              </div>
              <form onSubmit={saveMaterial}>
                <div className="form-grid">
                  <label className="wide">
                    <span>文案标题</span>
                    <input
                      type="text"
                      value={materialForm.copyTitle}
                      onChange={(e) => setMaterialForm({ ...materialForm, copyTitle: e.target.value })}
                      placeholder="618门店促销宣传语"
                      required
                    />
                  </label>
                  <label>
                    <span>时长（秒）</span>
                    <input
                      type="number"
                      min="1"
                      max="3600"
                      value={materialForm.durationSeconds}
                      onChange={(e) => setMaterialForm({ ...materialForm, durationSeconds: e.target.value })}
                      placeholder="30"
                      required
                    />
                  </label>
                  <label>
                    <span>制作状态</span>
                    <select
                      value={materialForm.productionStatus}
                      onChange={(e) => setMaterialForm({ ...materialForm, productionStatus: e.target.value })}
                    >
                      {materialStatuses.map((status) => <option key={status}>{status}</option>)}
                    </select>
                  </label>
                  <label>
                    <span>交付日期</span>
                    <input
                      type="date"
                      value={materialForm.deliveryDate}
                      onChange={(e) => setMaterialForm({ ...materialForm, deliveryDate: e.target.value })}
                    />
                  </label>
                  {editingMaterial && editingMaterial.productionStatus !== materialForm.productionStatus && (
                    <label className="wide">
                      <span>状态变更说明</span>
                      <textarea
                        value={materialForm.statusRemark}
                        onChange={(e) => setMaterialForm({ ...materialForm, statusRemark: e.target.value })}
                        placeholder="可选，填写本次状态变更的原因或说明"
                        rows={2}
                      />
                    </label>
                  )}
                  <label className="wide">
                    <span>备注</span>
                    <textarea
                      value={materialForm.remarks}
                      onChange={(e) => setMaterialForm({ ...materialForm, remarks: e.target.value })}
                      placeholder="可选，填写素材相关的其他说明"
                      rows={3}
                    />
                  </label>
                </div>
                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={closeMaterialModal}>
                    取消
                  </button>
                  <button type="submit" className="primary">
                    <CheckCircle2 size={16} />
                    {editingMaterial ? '保存修改' : '绑定素材'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {inventoryModalOpen && inventoryEditChannel && (
        <div className="modal-overlay" onClick={closeInventoryModal}>
          <div className="modal-content inventory-edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="panel-title" style={{ marginBottom: 0 }}>
                <Layers size={18} />
                <h2>配置频道库存 - {getChannelById(inventoryEditChannel)?.name}</h2>
              </div>
              <button type="button" className="modal-close" onClick={closeInventoryModal}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p className="hint">配置该频道的可售时段和容量。设置容量为0可禁用该时段。</p>
              <div className="inventory-form-grid">
                <div className="slot-editor-list">
                  {getChannelInventory(inventoryEditChannel, inventory).slots.map((slotConfig, idx) => (
                    <div key={idx} className="slot-editor-row">
                      <label>
                        <span>时段</span>
                        <input
                          type="text"
                          value={slotConfig.slot}
                          onChange={(e) => updateSlotCapacity(inventoryEditChannel, idx, 'slot', e.target.value)}
                          placeholder="08:00-09:00"
                        />
                      </label>
                      <label>
                        <span>容量</span>
                        <input
                          type="number"
                          min="0"
                          value={slotConfig.capacity}
                          onChange={(e) => updateSlotCapacity(inventoryEditChannel, idx, 'capacity', e.target.value)}
                        />
                      </label>
                      <label>
                        <span>启用</span>
                        <select
                          value={slotConfig.enabled ? 'true' : 'false'}
                          onChange={(e) => updateSlotCapacity(inventoryEditChannel, idx, 'enabled', e.target.value === 'true')}
                        >
                          <option value="true">是</option>
                          <option value="false">否</option>
                        </select>
                      </label>
                      <button
                        type="button"
                        className="ghost-danger compact"
                        onClick={() => removeSlot(inventoryEditChannel, idx)}
                        style={{ alignSelf: 'flex-end' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="add-slot-btn"
                  onClick={() => addSlot(inventoryEditChannel)}
                >
                  <Plus size={16} /> 添加时段
                </button>
              </div>
              <div className="modal-actions">
                <button type="button" className="primary" onClick={closeInventoryModal}>
                  <CheckCircle2 size={16} />完成
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
