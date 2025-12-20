// Offline-First PWA Service
// Handles IndexedDB caching, background sync, and offline queue management

import { supabase } from '@/integrations/supabase/client';
import type { OfflineSyncQueue, OfflineCache } from '@/types/enterprise';

// ============================================================================
// INDEXEDDB SETUP
// ============================================================================

const DB_NAME = 'zavira-offline-db';
const DB_VERSION = 1;

interface StoreConfig {
  name: string;
  keyPath: string;
  indexes?: { name: string; keyPath: string; unique: boolean }[];
}

const STORES: StoreConfig[] = [
  {
    name: 'appointments',
    keyPath: 'id',
    indexes: [
      { name: 'start_time', keyPath: 'start_time', unique: false },
      { name: 'staff_id', keyPath: 'staff_id', unique: false },
      { name: 'customer_id', keyPath: 'customer_id', unique: false },
      { name: 'status', keyPath: 'status', unique: false }
    ]
  },
  {
    name: 'customers',
    keyPath: 'id',
    indexes: [
      { name: 'email', keyPath: 'email', unique: true },
      { name: 'phone', keyPath: 'phone', unique: false }
    ]
  },
  {
    name: 'services',
    keyPath: 'id',
    indexes: [
      { name: 'category', keyPath: 'category', unique: false }
    ]
  },
  {
    name: 'staff',
    keyPath: 'id',
    indexes: [
      { name: 'email', keyPath: 'email', unique: true }
    ]
  },
  {
    name: 'inventory',
    keyPath: 'id',
    indexes: [
      { name: 'sku', keyPath: 'sku', unique: true },
      { name: 'category', keyPath: 'category', unique: false }
    ]
  },
  {
    name: 'sync_queue',
    keyPath: 'id',
    indexes: [
      { name: 'entity_type', keyPath: 'entity_type', unique: false },
      { name: 'status', keyPath: 'sync_status', unique: false },
      { name: 'created_at', keyPath: 'created_at', unique: false }
    ]
  },
  {
    name: 'cache_metadata',
    keyPath: 'key'
  }
];

let db: IDBDatabase | null = null;

export const initializeOfflineDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      STORES.forEach((storeConfig) => {
        if (!database.objectStoreNames.contains(storeConfig.name)) {
          const store = database.createObjectStore(storeConfig.name, {
            keyPath: storeConfig.keyPath
          });

          storeConfig.indexes?.forEach((index) => {
            store.createIndex(index.name, index.keyPath, { unique: index.unique });
          });
        }
      });
    };
  });
};

// ============================================================================
// GENERIC INDEXEDDB OPERATIONS
// ============================================================================

const getStore = (storeName: string, mode: IDBTransactionMode = 'readonly'): IDBObjectStore => {
  if (!db) throw new Error('Database not initialized');
  const transaction = db.transaction(storeName, mode);
  return transaction.objectStore(storeName);
};

export const putItem = <T extends { id: string }>(
  storeName: string,
  item: T
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const store = getStore(storeName, 'readwrite');
    const request = store.put(item);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getItem = <T>(
  storeName: string,
  key: string
): Promise<T | undefined> => {
  return new Promise((resolve, reject) => {
    const store = getStore(storeName);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getAllItems = <T>(storeName: string): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    const store = getStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const deleteItem = (storeName: string, key: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const store = getStore(storeName, 'readwrite');
    const request = store.delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const clearStore = (storeName: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const store = getStore(storeName, 'readwrite');
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const queryByIndex = <T>(
  storeName: string,
  indexName: string,
  value: IDBValidKey
): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    const store = getStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const queryByRange = <T>(
  storeName: string,
  indexName: string,
  lower: IDBValidKey,
  upper: IDBValidKey
): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    const store = getStore(storeName);
    const index = store.index(indexName);
    const range = IDBKeyRange.bound(lower, upper);
    const request = index.getAll(range);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// ============================================================================
// SYNC QUEUE MANAGEMENT
// ============================================================================

interface SyncQueueItem {
  id: string;
  entity_type: string;
  entity_id: string;
  operation: 'create' | 'update' | 'delete';
  payload: any;
  sync_status: 'pending' | 'syncing' | 'synced' | 'failed';
  retry_count: number;
  created_at: string;
  error_message?: string;
}

export const addToSyncQueue = async (
  entityType: string,
  entityId: string,
  operation: 'create' | 'update' | 'delete',
  payload: any
): Promise<void> => {
  const item: SyncQueueItem = {
    id: crypto.randomUUID(),
    entity_type: entityType,
    entity_id: entityId,
    operation,
    payload,
    sync_status: 'pending',
    retry_count: 0,
    created_at: new Date().toISOString()
  };

  await putItem('sync_queue', item);

  // Try immediate sync if online
  if (navigator.onLine) {
    processSyncQueue();
  }
};

export const getSyncQueue = async (): Promise<SyncQueueItem[]> => {
  return getAllItems<SyncQueueItem>('sync_queue');
};

export const getPendingSyncItems = async (): Promise<SyncQueueItem[]> => {
  return queryByIndex<SyncQueueItem>('sync_queue', 'status', 'pending');
};

export const updateSyncItemStatus = async (
  id: string,
  status: SyncQueueItem['sync_status'],
  errorMessage?: string
): Promise<void> => {
  const item = await getItem<SyncQueueItem>('sync_queue', id);
  if (item) {
    item.sync_status = status;
    if (errorMessage) {
      item.error_message = errorMessage;
    }
    if (status === 'failed') {
      item.retry_count++;
    }
    await putItem('sync_queue', item);
  }
};

export const removeSyncedItems = async (): Promise<void> => {
  const items = await queryByIndex<SyncQueueItem>('sync_queue', 'status', 'synced');
  for (const item of items) {
    await deleteItem('sync_queue', item.id);
  }
};

// ============================================================================
// SYNC PROCESSING
// ============================================================================

let isSyncing = false;
let syncListeners: ((status: { pending: number; syncing: boolean; lastSync: string | null }) => void)[] = [];
let lastSyncTime: string | null = null;

const TABLE_MAP: Record<string, string> = {
  appointments: 'appointments',
  customers: 'customers',
  services: 'services',
  staff: 'staff',
  inventory: 'inventory_items'
};

export const processSyncQueue = async (): Promise<{
  synced: number;
  failed: number;
  remaining: number;
}> => {
  if (isSyncing || !navigator.onLine) {
    return { synced: 0, failed: 0, remaining: 0 };
  }

  isSyncing = true;
  notifySyncListeners();

  let synced = 0;
  let failed = 0;

  try {
    const pendingItems = await queryByIndex<SyncQueueItem>('sync_queue', 'status', 'pending');

    for (const item of pendingItems) {
      // Skip items that have failed too many times
      if (item.retry_count >= 5) {
        continue;
      }

      await updateSyncItemStatus(item.id, 'syncing');

      try {
        const tableName = TABLE_MAP[item.entity_type] || item.entity_type;

        switch (item.operation) {
          case 'create':
            await supabase.from(tableName).insert(item.payload);
            break;

          case 'update':
            await supabase
              .from(tableName)
              .update(item.payload)
              .eq('id', item.entity_id);
            break;

          case 'delete':
            await supabase.from(tableName).delete().eq('id', item.entity_id);
            break;
        }

        await updateSyncItemStatus(item.id, 'synced');
        synced++;
      } catch (error) {
        await updateSyncItemStatus(item.id, 'failed', String(error));
        failed++;
      }
    }

    // Clean up synced items
    await removeSyncedItems();

    lastSyncTime = new Date().toISOString();

    // Record sync in database when online
    await supabase.from('offline_sync_queue').insert({
      device_id: getDeviceId(),
      entity_type: 'batch',
      entity_id: 'sync',
      operation: 'sync',
      payload: { synced, failed },
      sync_status: 'synced',
      synced_at: lastSyncTime
    });

  } finally {
    isSyncing = false;
    notifySyncListeners();
  }

  const remaining = (await getPendingSyncItems()).length;
  return { synced, failed, remaining };
};

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

interface CacheMetadata {
  key: string;
  store: string;
  lastUpdated: string;
  ttl: number; // Time to live in milliseconds
  version: number;
}

export const setCacheMetadata = async (
  store: string,
  ttl: number = 24 * 60 * 60 * 1000 // Default 24 hours
): Promise<void> => {
  const metadata: CacheMetadata = {
    key: store,
    store,
    lastUpdated: new Date().toISOString(),
    ttl,
    version: 1
  };

  await putItem('cache_metadata', metadata);
};

export const getCacheMetadata = async (store: string): Promise<CacheMetadata | undefined> => {
  return getItem<CacheMetadata>('cache_metadata', store);
};

export const isCacheValid = async (store: string): Promise<boolean> => {
  const metadata = await getCacheMetadata(store);
  if (!metadata) return false;

  const age = Date.now() - new Date(metadata.lastUpdated).getTime();
  return age < metadata.ttl;
};

export const invalidateCache = async (store: string): Promise<void> => {
  await deleteItem('cache_metadata', store);
  await clearStore(store);
};

export const invalidateAllCaches = async (): Promise<void> => {
  await clearStore('cache_metadata');
  for (const store of ['appointments', 'customers', 'services', 'staff', 'inventory']) {
    await clearStore(store);
  }
};

// ============================================================================
// DATA FETCHING WITH OFFLINE SUPPORT
// ============================================================================

export const fetchWithOfflineSupport = async <T>(
  storeName: string,
  fetchFn: () => Promise<T[]>,
  options: {
    ttl?: number;
    forceRefresh?: boolean;
  } = {}
): Promise<{ data: T[]; fromCache: boolean }> => {
  const { ttl = 24 * 60 * 60 * 1000, forceRefresh = false } = options;

  // Check if we have valid cached data
  if (!forceRefresh && await isCacheValid(storeName)) {
    const cachedData = await getAllItems<T>(storeName);
    if (cachedData.length > 0) {
      return { data: cachedData, fromCache: true };
    }
  }

  // If online, fetch fresh data
  if (navigator.onLine) {
    try {
      const freshData = await fetchFn();

      // Store in cache
      for (const item of freshData) {
        await putItem(storeName, item as T & { id: string });
      }
      await setCacheMetadata(storeName, ttl);

      return { data: freshData, fromCache: false };
    } catch (error) {
      console.error(`Error fetching ${storeName}:`, error);
      // Fall back to cached data on error
      const cachedData = await getAllItems<T>(storeName);
      return { data: cachedData, fromCache: true };
    }
  }

  // Offline - return cached data
  const cachedData = await getAllItems<T>(storeName);
  return { data: cachedData, fromCache: true };
};

// ============================================================================
// ENTITY-SPECIFIC OFFLINE OPERATIONS
// ============================================================================

export const getAppointmentsOffline = async (
  startDate: string,
  endDate: string
): Promise<{ data: any[]; fromCache: boolean }> => {
  return fetchWithOfflineSupport(
    'appointments',
    async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .gte('start_time', startDate)
        .lte('start_time', endDate);

      if (error) throw error;
      return data || [];
    },
    { ttl: 60 * 60 * 1000 } // 1 hour TTL for appointments
  );
};

export const getCustomersOffline = async (): Promise<{ data: any[]; fromCache: boolean }> => {
  return fetchWithOfflineSupport(
    'customers',
    async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) throw error;
      return data || [];
    }
  );
};

export const getServicesOffline = async (): Promise<{ data: any[]; fromCache: boolean }> => {
  return fetchWithOfflineSupport(
    'services',
    async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
    }
  );
};

export const getStaffOffline = async (): Promise<{ data: any[]; fromCache: boolean }> => {
  return fetchWithOfflineSupport(
    'staff',
    async () => {
      const { data, error } = await supabase
        .from('staff')
        .select('*');

      if (error) throw error;
      return data || [];
    }
  );
};

export const getInventoryOffline = async (): Promise<{ data: any[]; fromCache: boolean }> => {
  return fetchWithOfflineSupport(
    'inventory',
    async () => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*');

      if (error) throw error;
      return data || [];
    }
  );
};

// ============================================================================
// OFFLINE-AWARE MUTATIONS
// ============================================================================

export const createOffline = async <T extends { id?: string }>(
  storeName: string,
  item: T
): Promise<T & { id: string; _offline?: boolean }> => {
  const id = item.id || crypto.randomUUID();
  const itemWithId = { ...item, id } as T & { id: string };

  // Always save locally first
  await putItem(storeName, itemWithId);

  if (navigator.onLine) {
    // Try to sync immediately
    try {
      const tableName = TABLE_MAP[storeName] || storeName;
      const { data, error } = await supabase
        .from(tableName)
        .insert(itemWithId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      // Queue for later sync
      await addToSyncQueue(storeName, id, 'create', itemWithId);
      return { ...itemWithId, _offline: true };
    }
  } else {
    // Queue for later sync
    await addToSyncQueue(storeName, id, 'create', itemWithId);
    return { ...itemWithId, _offline: true };
  }
};

export const updateOffline = async <T extends { id: string }>(
  storeName: string,
  id: string,
  updates: Partial<T>
): Promise<T & { _offline?: boolean }> => {
  // Get current local data
  const current = await getItem<T>(storeName, id);
  if (!current) throw new Error('Item not found');

  const updated = { ...current, ...updates };

  // Save locally
  await putItem(storeName, updated);

  if (navigator.onLine) {
    try {
      const tableName = TABLE_MAP[storeName] || storeName;
      const { data, error } = await supabase
        .from(tableName)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      await addToSyncQueue(storeName, id, 'update', updates);
      return { ...updated, _offline: true };
    }
  } else {
    await addToSyncQueue(storeName, id, 'update', updates);
    return { ...updated, _offline: true };
  }
};

export const deleteOffline = async (
  storeName: string,
  id: string
): Promise<{ success: boolean; _offline?: boolean }> => {
  // Delete locally
  await deleteItem(storeName, id);

  if (navigator.onLine) {
    try {
      const tableName = TABLE_MAP[storeName] || storeName;
      const { error } = await supabase.from(tableName).delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      await addToSyncQueue(storeName, id, 'delete', null);
      return { success: true, _offline: true };
    }
  } else {
    await addToSyncQueue(storeName, id, 'delete', null);
    return { success: true, _offline: true };
  }
};

// ============================================================================
// NETWORK STATUS & SYNC LISTENERS
// ============================================================================

let onlineListeners: ((online: boolean) => void)[] = [];

export const initializeNetworkListeners = (): void => {
  window.addEventListener('online', () => {
    onlineListeners.forEach(l => l(true));
    // Automatically process sync queue when back online
    processSyncQueue();
  });

  window.addEventListener('offline', () => {
    onlineListeners.forEach(l => l(false));
  });
};

export const onNetworkStatusChange = (
  callback: (online: boolean) => void
): (() => void) => {
  onlineListeners.push(callback);
  return () => {
    onlineListeners = onlineListeners.filter(l => l !== callback);
  };
};

export const onSyncStatusChange = (
  callback: (status: { pending: number; syncing: boolean; lastSync: string | null }) => void
): (() => void) => {
  syncListeners.push(callback);
  return () => {
    syncListeners = syncListeners.filter(l => l !== callback);
  };
};

const notifySyncListeners = async (): Promise<void> => {
  const pending = (await getPendingSyncItems()).length;
  syncListeners.forEach(l => l({
    pending,
    syncing: isSyncing,
    lastSync: lastSyncTime
  }));
};

// ============================================================================
// DEVICE IDENTIFICATION
// ============================================================================

const DEVICE_ID_KEY = 'zavira-device-id';

export const getDeviceId = (): string => {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
};

// ============================================================================
// SERVICE WORKER REGISTRATION
// ============================================================================

export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('ServiceWorker registered:', registration.scope);

      // Handle updates
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker) {
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                console.log('New content available; please refresh.');
              } else {
                console.log('Content cached for offline use.');
              }
            }
          };
        }
      };

      return registration;
    } catch (error) {
      console.error('ServiceWorker registration failed:', error);
      return null;
    }
  }
  return null;
};

// ============================================================================
// BACKGROUND SYNC
// ============================================================================

export const requestBackgroundSync = async (tag: string = 'sync-queue'): Promise<boolean> => {
  if ('serviceWorker' in navigator && 'sync' in (window as any)) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await (registration as any).sync.register(tag);
      return true;
    } catch (error) {
      console.error('Background sync registration failed:', error);
      return false;
    }
  }
  return false;
};

// ============================================================================
// STORAGE QUOTA
// ============================================================================

export const getStorageQuota = async (): Promise<{
  usage: number;
  quota: number;
  percentUsed: number;
}> => {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    const usage = estimate.usage || 0;
    const quota = estimate.quota || 0;
    return {
      usage,
      quota,
      percentUsed: quota > 0 ? (usage / quota) * 100 : 0
    };
  }
  return { usage: 0, quota: 0, percentUsed: 0 };
};

export const requestPersistentStorage = async (): Promise<boolean> => {
  if ('storage' in navigator && 'persist' in navigator.storage) {
    return navigator.storage.persist();
  }
  return false;
};

// ============================================================================
// INITIALIZATION
// ============================================================================

export const initializeOfflineSupport = async (): Promise<void> => {
  await initializeOfflineDB();
  initializeNetworkListeners();
  await registerServiceWorker();
  await requestPersistentStorage();

  // Process any pending items on startup if online
  if (navigator.onLine) {
    processSyncQueue();
  }
};

export default {
  // Initialization
  initializeOfflineSupport,
  initializeOfflineDB,
  registerServiceWorker,

  // Generic operations
  putItem,
  getItem,
  getAllItems,
  deleteItem,
  clearStore,
  queryByIndex,
  queryByRange,

  // Sync queue
  addToSyncQueue,
  getSyncQueue,
  getPendingSyncItems,
  processSyncQueue,

  // Cache management
  setCacheMetadata,
  getCacheMetadata,
  isCacheValid,
  invalidateCache,
  invalidateAllCaches,

  // Offline data fetching
  fetchWithOfflineSupport,
  getAppointmentsOffline,
  getCustomersOffline,
  getServicesOffline,
  getStaffOffline,
  getInventoryOffline,

  // Offline mutations
  createOffline,
  updateOffline,
  deleteOffline,

  // Network & sync status
  onNetworkStatusChange,
  onSyncStatusChange,

  // Device & storage
  getDeviceId,
  getStorageQuota,
  requestPersistentStorage,
  requestBackgroundSync
};
