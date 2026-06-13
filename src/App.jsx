import { useMemo, useState } from 'react';
import { Radio, Plus, Search, Trash2, RotateCcw, CheckCircle2, AlertTriangle, ClipboardList, CalendarDays, Users, UserPlus, Phone, Pencil, X, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
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
      "slot": "18:00-19:00",
      "plays": "3",
      "amount": "2800",
      "status": "待确认"
    },
    {
      "client": "云上烘焙",
      "adName": "新品上线",
      "date": "2026-06-14",
      "slot": "12:00-13:00",
      "plays": "2",
      "amount": "1600",
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

    if (appConfig.conflict === 'date-slot' && records.some((item) => item.date === nextRecord.date && item.slot === nextRecord.slot)) {
      nextRecord.conflict = true;
    }
    if (appConfig.conflict === 'bed-time' && hasOverlap(nextRecord, records)) {
      nextRecord.conflict = true;
    }
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

  const metrics = [
    { label: "排期数", value: records.length },
    { label: "今日广告", value: records.filter((item) => item.date === today).length },
    { label: "合同额", value: money(records.reduce((sum, item) => sum + Number(item.amount || 0), 0)) },
  ];

  const groupedByDate = useMemo(() => {
    return filteredRecords.reduce((acc, item) => {
      const key = item[appConfig.dateKey] || item.date || item.enrollDate || '未排期';
      (acc[key] ||= []).push(item);
      return acc;
    }, {});
  }, [filteredRecords]);

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

  function toggleDateFilter(date) {
    if (selectedDate === date) {
      setSelectedDate(null);
    } else {
      setSelectedDate(date);
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
              <article className={'record ' + (item.conflict || hasOverlap(item, records) ? 'conflict' : '')} key={item.id} onClick={() => setSelected(item)}>
                <div className="record-head">
                  <div>
                    <h3>{item.adName}</h3>
                    <p>{`${item.client} · ${item.date} · ${item.slot}`}</p>
                  </div>
                  <span className={'status ' + statusClass(item.status)}>{item.status}</span>
                </div>
                <p className="record-detail">{`播放${item.plays}次｜合同${money(Number(item.amount || 0))}`}</p>
                {(item.conflict || hasOverlap(item, records)) && <div className="warning"><AlertTriangle size={15} />发现冲突</div>}
                <div className="actions" onClick={(event) => event.stopPropagation()}>
                  {appConfig.statuses.map((status) => (
                    <button key={status} type="button" onClick={() => updateStatus(item.id, status)}>{status}</button>
                  ))}
                  {appConfig.action === 'copyRecipe' && <button type="button" onClick={() => duplicateRecord(item)}><RotateCcw size={14} />复制</button>}
                  {appConfig.chart && <button type="button" onClick={() => addTemperature(item)}>加温度</button>}
                  <button className="ghost-danger" type="button" onClick={() => removeRecord(item.id)}><Trash2 size={14} /></button>
                </div>
              </article>
            ))}
          </div>
        </section>
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
              {Object.entries(groupedByDate).map(([date, items]) => (
                <div key={date} className="date-group">
                  <strong>{date}</strong>
                  <span>{items.length}条记录</span>
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
