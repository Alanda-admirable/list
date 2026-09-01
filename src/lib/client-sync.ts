'use client';

import { useEffect } from 'react';
import { Executive } from '@/components/ExecutiveCard';

const STORAGE_KEY_OVERRIDES = 'thaigov_executive_overrides';
const STORAGE_KEY_DELETED = 'thaigov_executive_deleted';
const STORAGE_KEY_CREATED = 'thaigov_executive_created';

export const SUPABASE_STORAGE_OVERRIDES_URL =
  'https://lygsmthmtaqchldoiovu.supabase.co/storage/v1/object/public/avatars/database/overrides.json';

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

// Direct client-side fetch of cloud overrides from Supabase Public Storage
export async function fetchCloudOverridesClient(): Promise<Record<string, ExecutiveOverride>> {
  if (typeof window === 'undefined') return {};
  try {
    const res = await fetch(`${SUPABASE_STORAGE_OVERRIDES_URL}?_t=${Date.now()}`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return data && typeof data === 'object' ? data : {};
    }
    return {};
  } catch (err) {
    console.warn('Could not fetch cloud overrides directly on client:', err);
    return {};
  }
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

// Merge server executive array with client local & cloud overrides
export function mergeWithLocalData(
  serverExecutives: Executive[],
  cloudOverrides: Record<string, any> = {}
): Executive[] {
  if (typeof window === 'undefined') return serverExecutives;

  const localOverrides = getLocalOverrides();
  const deletedIds = getLocalDeletedIds();
  const createdItems = getLocalCreatedItems();

  const combinedOverrides = {
    ...cloudOverrides,
    ...localOverrides,
  };

  // 1. Filter out deleted items
  let result = serverExecutives.filter((e) => !deletedIds.includes(e.id));

  // 2. Apply combined overrides
  result = result.map((e) => {
    if (combinedOverrides[e.id]) {
      const ov = combinedOverrides[e.id];
      return {
        ...e,
        ...ov,
        organization: ov.organization || e.organization,
      } as Executive;
    }
    return e;
  });

  // 3. Prepend locally created items not in server array
  const existingIds = new Set(result.map((e) => e.id));
  const newItemsToAdd = createdItems.filter((c) => !existingIds.has(c.id) && !deletedIds.includes(c.id));

  return [...newItemsToAdd, ...result];
}

/**
 * Custom React Hook that automatically subscribes to executive data changes
 * both within the current tab (CustomEvent) and across different browser tabs (storage event).
 */
export function useExecutiveSync(onSync: () => void) {
  useEffect(() => {
    const handleLocalEvent = () => onSync();
    const handleStorageEvent = (e: StorageEvent) => {
      if (
        e.key === STORAGE_KEY_OVERRIDES ||
        e.key === STORAGE_KEY_CREATED ||
        e.key === STORAGE_KEY_DELETED
      ) {
        onSync();
      }
    };

    window.addEventListener('thaigov_data_changed', handleLocalEvent);
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      window.removeEventListener('thaigov_data_changed', handleLocalEvent);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, [onSync]);
}
