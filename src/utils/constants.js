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

const DATA_BACKUP_VERSION = '1.0.0';

const backupStorageKeys = {
  records: appConfig.storage,
  customers: customerStorage,
  inventory: inventoryStorage,
  materials: materialStorage,
  proposals: 'hxwl-61305-proposal-plans',
};

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

export {
  appConfig,
  channels,
  inventoryStorage,
  defaultInventory,
  customerStorage,
  customerLevels,
  customerIndustries,
  defaultCustomers,
  materialStorage,
  materialStatuses,
  defaultMaterials,
  DATA_BACKUP_VERSION,
  backupStorageKeys,
  proposalStorage,
  discountStrategies,
  tieredRules,
  earlybirdRules,
  slotPriceTiers,
  planTypeLabels,
};
