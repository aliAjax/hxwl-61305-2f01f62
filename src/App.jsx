import { useMemo, useState } from 'react';
import { Radio, Plus, Search, Trash2, RotateCcw, CheckCircle2, AlertTriangle, ClipboardList, CalendarDays, Users, UserPlus, Phone, Pencil, X, ChevronLeft, ChevronRight, Calendar, FileUp, XCircle, ShieldAlert, Clock, Layers, MinusCircle, Zap, CalendarRange, SkipForward, Flag, PlayCircle, ListVideo, Mic2, BarChart3, TrendingUp, PieChart, Inbox, FileText, Package, History } from 'lucide-react';
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

const customerStorage = 'hxwl-61305-customer-archive';

const defaultCustomers = [
  { name: '蓝海家居', contact: '张经理', phone: '138-0001-0001', preferredSlot: '08:00-09:00', historicalAmount: 3600 },
  { name: '北城眼镜', contact: '李总', phone: '139-0002-0002', preferredSlot: '18:00-19:00', historicalAmount: 2800 },
  { name: '云上烘焙', contact: '王店长', phone: '137-0003-0003', preferredSlot: '12:00-13:00', historicalAmount: 1600 },
];

const materialStorage = 'hxwl-61305-ad-materials';

const materialStatuses = ['待制作', '制作中', '审核中', '已交付', '已退回'];

const defaultMaterials = [];

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
      return JSON.parse(raw);
    } catch {
      return withIds(appConfig.seed);
    }
  }
  return withIds(appConfig.seed);
}

function loadCustomers() {
  const raw = localStorage.getItem(customerStorage);
  if (raw) {
    try {
      return JSON.parse(raw);
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

function App() {
  const [records, setRecords] = useState(loadRecords);
  const [form, setForm] = useState(appConfig.defaultValues);
  const [filters, setFilters] = useState({ query: '', status: '全部' });
  const [selected, setSelected] = useState(null);
  const [customers, setCustomers] = useState(loadCustomers);
  const [customerForm, setCustomerForm] = useState({ name: '', contact: '', phone: '', preferredSlot: '', historicalAmount: '' });
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [importCsv, setImportCsv] = useState('');
  const [importResult, setImportResult] = useState(null);

  const [batchForm, setBatchForm] = useState({
    client: '',
    adName: '',
    startDate: '',
    endDate: '',
    weekdays: [1, 2, 3, 4, 5],
    slots: [],
    playsPerDay: '4',
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
  const [broadcastFilter, setBroadcastFilter] = useState({ query: '', status: '全部' });
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
  const [materialFilter, setMaterialFilter] = useState({ query: '', status: '全部', showUndeliveredOnly: false });
  const [materialDetail, setMaterialDetail] = useState(null);

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
    setCustomerForm({ name: '', contact: '', phone: '', preferredSlot: '', historicalAmount: '' });
  }

  function startEditCustomer(customer) {
    setEditingCustomer(customer.id);
    setCustomerForm({
      name: customer.name,
      contact: customer.contact,
      phone: customer.phone,
      preferredSlot: customer.preferredSlot || '',
      historicalAmount: customer.historicalAmount || ''
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
    setCustomerForm({ name: '', contact: '', phone: '', preferredSlot: '', historicalAmount: '' });
  }

  function cancelEditCustomer() {
    setEditingCustomer(null);
    setCustomerForm({ name: '', contact: '', phone: '', preferredSlot: '', historicalAmount: '' });
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
    const nextRecord = {
      id: uid(),
      ...form,
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
    setForm(appConfig.defaultValues);
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
    records.forEach((item) => {
      const dateKey = item.date || '未排期';
      const slotKey = item.slot || '未排期';
      if (!result[dateKey]) result[dateKey] = {};
      if (!result[dateKey][slotKey]) result[dateKey][slotKey] = [];
      result[dateKey][slotKey].push(item);
    });
    return result;
  }, [records]);

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
    records.forEach((item) => {
      const d = item.date;
      if (!stats[d]) {
        stats[d] = { count: 0, plays: 0, amount: 0 };
      }
      stats[d].count += 1;
      stats[d].plays += Number(item.plays || 0);
      stats[d].amount += Number(item.amount || 0);
    });
    return stats;
  }, [records]);

  const conflictGroups = useMemo(() => {
    const slotMap = {};
    records.forEach((item) => {
      if (!item.date || !item.slot) return;
      const key = `${item.date}::${item.slot}`;
      (slotMap[key] ||= []).push(item);
    });
    const groups = [];
    Object.entries(slotMap).forEach(([key, items]) => {
      const nonCoPlay = items.filter((r) => !r.coPlay);
      if (nonCoPlay.length > 1) {
        const [date, slot] = key.split('::');
        const totalPlays = nonCoPlay.reduce((sum, r) => sum + Number(r.plays || 0), 0);
        const totalAmount = nonCoPlay.reduce((sum, r) => sum + Number(r.amount || 0), 0);
        const clients = [...new Set(nonCoPlay.map((r) => r.client))];
        groups.push({
          key,
          date,
          slot,
          items: nonCoPlay,
          totalPlays,
          totalAmount,
          clients,
          conflictCount: nonCoPlay.length
        });
      }
    });
    groups.sort((a, b) => a.date.localeCompare(b.date) || a.slot.localeCompare(b.slot));
    return groups;
  }, [records]);

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
    const slotOptions = appConfig.fields.find((f) => f.key === 'slot')?.options || [];
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
  }, [filteredRecords, isConflicted]);

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
    return [
      { label: '已排期广告', value: scheduledCount },
      { label: '已绑定素材', value: withMaterial },
      { label: '已交付', value: deliveredCount },
      { label: '待交付', value: undeliveredCount }
    ];
  }, [records, materials]);

  const metrics = [
    { label: "排期数", value: records.length },
    { label: "今日广告", value: records.filter((item) => item.date === today).length },
    { label: "冲突", value: conflictGroups.length },
    { label: "合同额", value: money(records.reduce((sum, item) => sum + Number(item.amount || 0), 0)) },
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
    result.rows.forEach((row, idx) => {
      if (row.date && row.slot) {
        const existingConflict = records.some(
          (r) => r.date === row.date && r.slot === row.slot
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
    const newRecords = importResult.rows.map((row) => ({
      id: uid(),
      client: row.client || '',
      adName: row.adName || '',
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

  function generateBatchPreview() {
    const { client, adName, startDate, endDate, weekdays, slots, playsPerDay, totalAmount, status } = batchForm;

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
    const perRecordPlays = playsPerDay && Number(playsPerDay) > 0
      ? String(Math.max(1, Math.round(Number(playsPerDay) / slots.length)))
      : '1';

    const previewRows = [];
    let rowIndex = 0;
    dates.forEach((date, dateIdx) => {
      slots.forEach((slot, slotIdx) => {
        const key = `${date}::${slot}`;
        const existingRecords = records.filter((r) => r.date === date && r.slot === slot && !r.coPlay);
        const hasConflict = existingRecords.length > 0;
        previewRows.push({
          previewId: `p-${dateIdx}-${slotIdx}`,
          client,
          adName,
          date,
          slot,
          plays: perRecordPlays,
          amount: amountValues[rowIndex] || '0',
          status,
          hasConflict,
          conflictWith: existingRecords.map((r) => ({
            id: r.id,
            client: r.client,
            adName: r.adName,
          })),
        });
        rowIndex += 1;
      });
    });

    const conflictCount = previewRows.filter((r) => r.hasConflict).length;
    const normalCount = previewRows.length - conflictCount;
    const amountNumbers = previewRows.map((r) => Number(r.amount || 0));
    const minAmount = Math.min(...amountNumbers);
    const maxAmount = Math.max(...amountNumbers);

    setBatchPreview({
      rows: previewRows,
      totalCount: previewRows.length,
      normalCount,
      conflictCount,
      totalAmount: amountNumbers.reduce((sum, value) => sum + value, 0),
      totalPlays: Number(perRecordPlays) * previewRows.length,
      dates,
      slots,
      perRecordAmount: minAmount === maxAmount ? money(minAmount) : `${money(minAmount)}-${money(maxAmount)}`,
      perRecordPlays,
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
      startDate: '',
      endDate: '',
      weekdays: [1, 2, 3, 4, 5],
      slots: [],
      playsPerDay: '4',
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
      return {
        ...prev,
        slots: exists
          ? prev.slots.filter((s) => s !== slot)
          : [...prev.slots, slot],
      };
    });
  }

  function handleBatchClientSelect(event) {
    const name = event.target.value;
    if (!name) return;
    const customer = customers.find((c) => c.name === name);
    if (customer) {
      setBatchForm({
        ...batchForm,
        client: customer.name,
        slots: customer.preferredSlot && !batchForm.slots.includes(customer.preferredSlot)
          ? [...batchForm.slots, customer.preferredSlot]
          : batchForm.slots,
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
      const key = `${item.date}::${item.slot}`;
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

      <section className="metrics">
        {metrics.map((metric) => (
          <article className="metric" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </section>

      <section className="workspace">
        <form className="panel form-panel" onSubmit={addRecord}>
          <div className="panel-title">
            <ClipboardList size={18} />
            <h2>新增记录</h2>
          </div>
          <div className="form-grid">
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
          <button className="primary" type="submit"><Plus size={18} />新增</button>
          <p className="hint">{appConfig.note}</p>
        </form>

        <section className="panel list-panel">
          <div className="toolbar">
            <div className="search">
              <Search size={16} />
              <input value={filters.query} onChange={(event) => setFilters({ ...filters, query: event.target.value })} placeholder={appConfig.filters[0]?.label || '搜索'} />
            </div>
            <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
              <option>全部</option>
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
                  <span className={'status ' + statusClass(item.status)}>{item.status}</span>
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
                            {appConfig.fields.find((f) => f.key === 'slot')?.options
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
            ))}
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
                {appConfig.fields.find((f) => f.key === 'slot')?.options.map((slot) => (
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

            <div className="batch-meta-row">
              <label className="batch-label">
                <span>每日播放次数</span>
                <input
                  type="number"
                  min="1"
                  value={batchForm.playsPerDay}
                  onChange={(e) => setBatchForm({ ...batchForm, playsPerDay: e.target.value })}
                  placeholder="4"
                />
                <span className="batch-sub-hint">将平均分配到各时段</span>
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
                <span className="bs-value">{batchPreview.perRecordPlays}次</span>
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
                                {appConfig.fields.find((f) => f.key === 'slot')?.options
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
          <div className="toolbar">
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
          </div>
          <div className="broadcast-records">
            {records
              .filter((item) => !broadcastFilter.query || `${item.client}${item.adName}`.includes(broadcastFilter.query))
              .filter((item) => {
                if (broadcastFilter.status === '全部') return true;
                return getBroadcastStatus(item) === broadcastFilter.status;
              })
              .filter((item) => item.status !== '待确认')
              .sort((a, b) => {
                const statusOrder = { '未开始': 0, '未完成': 1, '超播': 2, '已完成': 3 };
                const orderA = statusOrder[getBroadcastStatus(a)] ?? 9;
                const orderB = statusOrder[getBroadcastStatus(b)] ?? 9;
                if (orderA !== orderB) return orderA - orderB;
                return (b.date || '').localeCompare(a.date || '');
              })
              .map((item) => {
                const actual = getActualPlays(item);
                const planned = Number(item.plays || 0);
                const status = getBroadcastStatus(item);
                const progress = planned > 0 ? Math.min(100, (actual / planned) * 100) : 0;
                return (
                  <article
                    className="broadcast-record"
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
            {records.filter((item) => item.status !== '待确认').length === 0 && (
              <p className="empty">暂无已排期的广告记录。</p>
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
              <article className="metric" key={metric.label}>
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
                onChange={(e) => setMaterialFilter({ ...materialFilter, showUndeliveredOnly: e.target.checked })}
              />
              <span>仅显示待交付</span>
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
                      const hasConflict = nonCoPlayItems.length > 1;
                      const hasCoPlay = slotItems.some((r) => r.coPlay);
                      return (
                        <div key={slot} className={`slot-group ${hasConflict ? 'slot-conflict' : ''} ${hasCoPlay ? 'slot-coplay' : ''}`}>
                          <div className="slot-group-head">
                            <span className="slot-name">{slot}</span>
                            {hasConflict && (
                              <span className="slot-conflict-tag">
                                <AlertTriangle size={12} />{nonCoPlayItems.length}条冲突
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
                                <span className="ad-name">{item.adName}</span>
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
                        {appConfig.fields.find((f) => f.key === 'slot')?.options
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
    </main>
  );
}

export default App;
