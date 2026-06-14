import { channels, defaultInventory } from './constants';

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

function getSlotUsage(channelId, slotName, recordsList) {
  return recordsList.filter((r) => r.channelId === channelId && r.slot === slotName && !r.coPlay).length;
}

function getAvailableMoveTargets(recordId, currentChannelId, currentDate, currentSlot, records, inventory) {
  const targets = [];
  channels.forEach((channel) => {
    if (channel.id === currentChannelId) return;
    const channelSlots = getEnabledInventorySlots(channel.id, inventory);
    channelSlots.forEach((slot) => {
      const usage = records.filter(
        (r) => r.id !== recordId && r.channelId === channel.id && r.date === currentDate && r.slot === slot && !r.coPlay
      ).length;
      const { capacity, isEnabled } = getSlotCapacityState(channel.id, slot, usage, inventory);
      if (isEnabled && usage < capacity) {
        targets.push({
          channelId: channel.id,
          channelName: channel.name,
          channelColor: channel.color,
          slot,
          usage,
          capacity
        });
      }
    });
  });
  return targets;
}

export {
  getChannelById,
  getChannelColor,
  getChannelSlots,
  getChannelInventory,
  getEnabledInventorySlots,
  getInventorySlotConfig,
  getSlotCapacityState,
  getSlotUsage,
  getAvailableMoveTargets,
};
