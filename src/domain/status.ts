import type { ItemStatus } from './types';

const transitions: Record<ItemStatus, ItemStatus[]> = {
  inbox: ['active', 'blocked', 'waiting', 'done', 'canceled'],
  active: ['blocked', 'waiting', 'done', 'canceled', 'inbox'],
  blocked: ['active', 'waiting', 'done', 'canceled'],
  waiting: ['active', 'blocked', 'done', 'canceled'],
  done: ['active'],
  canceled: ['active']
};

export const canTransitionStatus = (from: ItemStatus, to: ItemStatus): boolean => {
  if (from === to) {
    return true;
  }

  return transitions[from].includes(to);
};

export const isTerminalStatus = (status: ItemStatus): boolean => status === 'done' || status === 'canceled';
