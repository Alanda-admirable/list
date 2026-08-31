'use client';

import { Executive } from '@/components/ExecutiveCard';

const STORAGE_KEY_OVERRIDES = 'thaigov_executive_overrides';
const STORAGE_KEY_DELETED = 'thaigov_executive_deleted';
const STORAGE_KEY_CREATED = 'thaigov_executive_created';

export interface ExecutiveOverride {
  id: string;
  prefix?: string;
  firstName?: string;
  lastName?: string;
  position?: string;
  positionLevel?: string | null;
  organizationId?: string;
  organization?: any;
  status?: string;
  appointmentDate?: string | null;
  endDate?: string | null;
  orderReference?: string | null;
  phone?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  photoVerified?: boolean;
  photoSource?: string | null;
  bio?: string | null;
  orderIndex?: number;
  updatedAt?: string;
}

// Get all stored overrides from localStorage
export function getLocalOverrides(): Record<string, ExecutiveOverride> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_OVERRIDES);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// Get all deleted IDs
export function getLocalDeletedIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DELETED);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Get all newly created items
export function getLocalCreatedItems(): Executive[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CREATED);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Save an update/edit for an executive
export function saveExecutiveUpdateLocally(id: string, updatedData: Partial<Executive>) {
  if (typeof window === 'undefined') return;
  try {
    const overrides = getLocalOverrides();
    overrides[id] = {
      ...(overrides[id] || {}),
      ...updatedData,
      id,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY_OVERRIDES, JSON.stringify(overrides));

    // Also update in created list if it was locally created
    const created = getLocalCreatedItems();
    const createdIdx = created.findIndex((c) => c.id === id);
    if (createdIdx !== -1) {
      created[createdIdx] = { ...created[createdIdx], ...updatedData };
      localStorage.setItem(STORAGE_KEY_CREATED, JSON.stringify(created));
    }

    window.dispatchEvent(new CustomEvent('thaigov_data_changed', { detail: { id, type: 'UPDATE' } }));
  } catch (err) {
    console.error('Failed to save local update', err);
  }
}

// Save a newly created executive locally
export function saveExecutiveCreateLocally(newItem: Executive) {
  if (typeof window === 'undefined') return;
  try {
    const created = getLocalCreatedItems();
    // Filter out duplicate
    const filtered = created.filter((c) => c.id !== newItem.id);
    filtered.unshift(newItem);
    localStorage.setItem(STORAGE_KEY_CREATED, JSON.stringify(filtered));

    window.dispatchEvent(new CustomEvent('thaigov_data_changed', { detail: { id: newItem.id, type: 'CREATE' } }));
  } catch (err) {
    console.error('Failed to save local create', err);
  }
}

// Save a delete action locally
export function saveExecutiveDeleteLocally(id: string) {
  if (typeof window === 'undefined') return;
  try {
    const deleted = getLocalDeletedIds();
    if (!deleted.includes(id)) {
      deleted.push(id);
      localStorage.setItem(STORAGE_KEY_DELETED, JSON.stringify(deleted));
    }

    // Remove from created and overrides
    const created = getLocalCreatedItems().filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEY_CREATED, JSON.stringify(created));

    const overrides = getLocalOverrides();
    delete overrides[id];
    localStorage.setItem(STORAGE_KEY_OVERRIDES, JSON.stringify(overrides));

    window.dispatchEvent(new CustomEvent('thaigov_data_changed', { detail: { id, type: 'DELETE' } }));
  } catch (err) {
    console.error('Failed to save local delete', err);
  }
}

// Merge server executive array with client local overrides
export function mergeWithLocalData(serverExecutives: Executive[]): Executive[] {
  if (typeof window === 'undefined') return serverExecutives;

  const overrides = getLocalOverrides();
  const deletedIds = getLocalDeletedIds();
  const createdItems = getLocalCreatedItems();

  // 1. Filter out deleted items
  let result = serverExecutives.filter((e) => !deletedIds.includes(e.id));

  // 2. Apply overrides
  result = result.map((e) => {
    if (overrides[e.id]) {
      return {
        ...e,
        ...overrides[e.id],
        organization: overrides[e.id].organization || e.organization,
      } as Executive;
    }
    return e;
  });

  // 3. Prepend locally created items not in server array
  const existingIds = new Set(result.map((e) => e.id));
  const newItemsToAdd = createdItems.filter((c) => !existingIds.has(c.id) && !deletedIds.includes(c.id));

  return [...newItemsToAdd, ...result];
}
