import { appConfig } from './constants';

function uid() {
  return Math.random().toString(36).slice(2, 10);
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

function statusClass(status) {
  const index = appConfig.statuses.indexOf(status);
  return ['status-a', 'status-b', 'status-c', 'status-d'][index] || 'status-a';
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

export {
  uid,
  localDateKey,
  parseDateKey,
  today,
  avg,
  money,
  inNextDays,
  latestTemp,
  hasHotTemp,
  priorityRank,
  hasOverlap,
  statusClass,
  getDatesInRange,
  distributeTotalAmount,
  getEffectiveSlotPlays,
};
