import {
  tieredRules,
  earlybirdRules,
  materialStatuses,
} from './constants';

import {
  parseDateKey,
  today,
  money,
} from './dateMoneyUtils';

import {
  getSlotCapacityState,
  getInventorySlotConfig,
  getEnabledInventorySlots,
} from './inventory';

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

function assessMaterialRisk(firstPlayDate, client, adName, records, materials) {
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

function buildPlanRows(channelId, dates, slots, playsPerSlot, client, adName, records, inventory) {
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

function buildPlanSummary(rows, baseUnitPrice, discountStrategy, discountValue, channelId, client, adName, records, materials, inventory) {
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
  const materialRisk = assessMaterialRisk(firstPlayDate, client, adName, records, materials);

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

export {
  calculateDiscount,
  assessConflictRisk,
  assessMaterialRisk,
  riskLevelClass,
  riskLevelLabel,
  buildPlanRows,
  buildPlanSummary,
};
