import { getSupabaseClient, SUPABASE_BUCKET_NAME, isSupabaseConfigured } from './supabase';
import { BundledExecutive } from './database-store';

const CLOUD_OVERRIDES_PATH = 'database/overrides.json';
const CLOUD_DELETED_PATH = 'database/deleted_ids.json';
const CLOUD_CREATED_PATH = 'database/created_execs.json';

interface CachedCloudState {
  overrides: Record<string, any>;
  deletedIds: string[];
  createdExecs: BundledExecutive[];
  fetchedAt: number;
}

let memoryCloudCache: CachedCloudState | null = null;
const CACHE_TTL_MS = 2000; // 2 seconds TTL for low latency and instant cross-device updates

/**
 * Fetch all live cloud state from Supabase Public Storage
 */
export async function getCloudState(): Promise<{
  overrides: Record<string, any>;
  deletedIds: string[];
  createdExecs: BundledExecutive[];
}> {
  const now = Date.now();
  if (memoryCloudCache && now - memoryCloudCache.fetchedAt < CACHE_TTL_MS) {
    return {
      overrides: memoryCloudCache.overrides,
      deletedIds: memoryCloudCache.deletedIds,
      createdExecs: memoryCloudCache.createdExecs,
    };
  }

  if (!isSupabaseConfigured) {
    return { overrides: {}, deletedIds: [], createdExecs: [] };
  }

  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { overrides: {}, deletedIds: [], createdExecs: [] };
    }

    const [overridesRes, deletedRes, createdRes] = await Promise.allSettled([
      (async () => {
        const { data } = supabase.storage.from(SUPABASE_BUCKET_NAME).getPublicUrl(CLOUD_OVERRIDES_PATH);
        const res = await fetch(`${data.publicUrl}?_t=${now}`);
        return res.ok ? await res.json() : {};
      })(),
      (async () => {
        const { data } = supabase.storage.from(SUPABASE_BUCKET_NAME).getPublicUrl(CLOUD_DELETED_PATH);
        const res = await fetch(`${data.publicUrl}?_t=${now}`);
        return res.ok ? await res.json() : [];
      })(),
      (async () => {
        const { data } = supabase.storage.from(SUPABASE_BUCKET_NAME).getPublicUrl(CLOUD_CREATED_PATH);
        const res = await fetch(`${data.publicUrl}?_t=${now}`);
        return res.ok ? await res.json() : [];
      })(),
    ]);

    const overrides = overridesRes.status === 'fulfilled' ? overridesRes.value || {} : {};
    const deletedIds = deletedRes.status === 'fulfilled' && Array.isArray(deletedRes.value) ? deletedRes.value : [];
    const createdExecs = createdRes.status === 'fulfilled' && Array.isArray(createdRes.value) ? createdRes.value : [];

    memoryCloudCache = {
      overrides,
      deletedIds,
      createdExecs,
      fetchedAt: now,
    };

    return { overrides, deletedIds, createdExecs };
  } catch (err) {
    console.error('Failed to fetch cloud state from Supabase:', err);
    return { overrides: {}, deletedIds: [], createdExecs: [] };
  }
}

/**
 * Save / Update an executive override in Supabase Public Storage
 */
export async function saveCloudExecutiveOverride(id: string, updatedData: any): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const { overrides } = await getCloudState();
    overrides[id] = {
      ...(overrides[id] || {}),
      ...updatedData,
      id,
      updatedAt: new Date().toISOString(),
    };

    // Update memory cache immediately
    if (memoryCloudCache) {
      memoryCloudCache.overrides = overrides;
      memoryCloudCache.fetchedAt = Date.now();
    }

    const buf = Buffer.from(JSON.stringify(overrides, null, 2));
    await supabase.storage.from(SUPABASE_BUCKET_NAME).upload(CLOUD_OVERRIDES_PATH, buf, {
      contentType: 'application/json',
      upsert: true,
    });
  } catch (err) {
    console.error('Failed to save cloud executive override:', err);
  }
}

/**
 * Save a newly created executive in Supabase Public Storage
 */
export async function saveCloudExecutiveCreate(newItem: BundledExecutive): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const { createdExecs } = await getCloudState();
    const filtered = createdExecs.filter((c) => c.id !== newItem.id);
    filtered.unshift(newItem);

    if (memoryCloudCache) {
      memoryCloudCache.createdExecs = filtered;
      memoryCloudCache.fetchedAt = Date.now();
    }

    const buf = Buffer.from(JSON.stringify(filtered, null, 2));
    await supabase.storage.from(SUPABASE_BUCKET_NAME).upload(CLOUD_CREATED_PATH, buf, {
      contentType: 'application/json',
      upsert: true,
    });
  } catch (err) {
    console.error('Failed to save cloud executive create:', err);
  }
}

/**
 * Save a delete action in Supabase Public Storage
 */
export async function saveCloudExecutiveDelete(id: string): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const { deletedIds, overrides, createdExecs } = await getCloudState();
    if (!deletedIds.includes(id)) {
      deletedIds.push(id);
    }
    delete overrides[id];
    const filteredCreated = createdExecs.filter((c) => c.id !== id);

    if (memoryCloudCache) {
      memoryCloudCache.deletedIds = deletedIds;
      memoryCloudCache.overrides = overrides;
      memoryCloudCache.createdExecs = filteredCreated;
      memoryCloudCache.fetchedAt = Date.now();
    }

    await Promise.allSettled([
      supabase.storage.from(SUPABASE_BUCKET_NAME).upload(
        CLOUD_DELETED_PATH,
        Buffer.from(JSON.stringify(deletedIds, null, 2)),
        { contentType: 'application/json', upsert: true }
      ),
      supabase.storage.from(SUPABASE_BUCKET_NAME).upload(
        CLOUD_OVERRIDES_PATH,
        Buffer.from(JSON.stringify(overrides, null, 2)),
        { contentType: 'application/json', upsert: true }
      ),
      supabase.storage.from(SUPABASE_BUCKET_NAME).upload(
        CLOUD_CREATED_PATH,
        Buffer.from(JSON.stringify(filteredCreated, null, 2)),
        { contentType: 'application/json', upsert: true }
      ),
    ]);
  } catch (err) {
    console.error('Failed to save cloud executive delete:', err);
  }
}

/**
 * Apply live cloud state on top of the initial base executive list
 */
export async function mergeExecutivesWithCloudState(
  baseExecutives: BundledExecutive[]
): Promise<BundledExecutive[]> {
  const { overrides, deletedIds, createdExecs } = await getCloudState();

  // 1. Filter out deleted
  let result = baseExecutives.filter((e) => !deletedIds.includes(e.id));

  // 2. Apply overrides
  result = result.map((e) => {
    if (overrides[e.id]) {
      const ov = overrides[e.id];
      return {
        ...e,
        ...ov,
        organization: ov.organization || e.organization,
      };
    }
    return e;
  });

  // 3. Prepend newly created
  const existingIds = new Set(result.map((e) => e.id));
  const toAdd = createdExecs.filter((c) => !existingIds.has(c.id) && !deletedIds.includes(c.id));

  return [...toAdd, ...result];
}
