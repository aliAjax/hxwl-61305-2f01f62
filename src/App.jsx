import { useMemo, useState } from 'react';
import { Radio, Plus, Search, Trash2, RotateCcw, CheckCircle2, AlertTriangle, ClipboardList, CalendarDays, Users, UserPlus, Phone, Pencil, X, ChevronLeft, ChevronRight, Calendar, FileUp, XCircle, ShieldAlert, Clock, Layers, MinusCircle, Zap, CalendarRange, SkipForward, Flag } from 'lucide-react';
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

const today = new Date().toISOString().slice(0, 10);

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
  const date = new Date(dateText);
  const now = new Date(today);
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

  function persist(next) {
    setRecords(next);
    localStorage.setItem(appConfig.storage, JSON.stringify(next));
  }

  function persistCustomers(next) {
    setCustomers(next);
    localStorage.setItem(customerStorage, JSON.stringify(next));
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
    const baseDate = new Date(today);
    baseDate.setDate(baseDate.getDate() + weekOffset * 7);
    const dayOfWeek = baseDate.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(baseDate);
    monday.setDate(baseDate.getDate() + mondayOffset);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().slice(0, 10);
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
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return dates;
    const current = new Date(start);
    while (current <= end) {
      const dayOfWeek = current.getDay();
      if (weekdays.includes(dayOfWeek)) {
        dates.push(current.toISOString().slice(0, 10));
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
            {filteredRecords.map((item) => (
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
                {item.coPlay && <div className="conflict-badge-co"><Layers size={12} />可并播</div>}
                {item.batchFlag && <div className="batch-flag-badge"><Flag size={12} />批量冲突</div>}
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
    </main>
  );
}

export default App;
