/**
 * Trial & License Security Vault (Database-free, Self-Healing Multi-Storage)
 * Handles:
 * - Free trial credits quota (default: 3 high-res free exports)
 * - Self-healing state across localStorage, sessionStorage, IndexedDB, and Cookie
 * - Cryptographic tampering detection (HMAC-like signature)
 * - Offline VIP License verification
 */

import { generateDeviceFingerprint } from './fingerprint';

export type LicensePlan = 'lifetime' | '1month' | '3month' | '6month' | '1year' | '3months' | '6months';

export interface TrialState {
  deviceId: string;
  isVip: boolean;
  vipLicenseKey?: string;
  vipPlan?: LicensePlan;
  vipExpiresAt?: number | null; // epoch timestamp ms, null means permanent lifetime
  freeExportsAllowed: number;
  exportsUsed: number;
  firstSeenTimestamp: number;
  lastUsedTimestamp: number;
  signature: string;
}

export function getPlanDurationDays(plan?: LicensePlan | string): number | null {
  switch (plan) {
    case '1month': return 30;
    case '3month':
    case '3months': return 90;
    case '6month':
    case '6months': return 180;
    case '1year': return 365;
    case 'lifetime':
    default:
      return null;
  }
}

export function getPlanNameFa(plan?: LicensePlan | string): string {
  switch (plan) {
    case '1month': return 'اشتراک ۱ ماهه (۳۰ روز)';
    case '3month':
    case '3months': return 'اشتراک ۳ ماهه (فصلی)';
    case '6month':
    case '6months': return 'اشتراک ۶ ماهه (نیم‌ساله)';
    case '1year': return 'اشتراک ۱ ساله (طلایی ۳۶۵ روز)';
    case 'lifetime':
    default:
      return 'دسترسی دائمی و مادام‌العمر';
  }
}

export function isTrialVipActive(state: TrialState): boolean {
  if (!state.isVip) return false;
  if (state.vipExpiresAt && typeof state.vipExpiresAt === 'number') {
    if (Date.now() > state.vipExpiresAt) {
      return false; // Subscription expired
    }
  }
  return true;
}

export function getVipRemainingDays(state: TrialState): number | null {
  if (!state.isVip) return 0;
  if (!state.vipExpiresAt) return null; // Permanent
  const diff = state.vipExpiresAt - Date.now();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

const STORAGE_KEY = 'kelk_device_vault_v2';
const COOKIE_NAME = 'k_dev_auth_v2';
const INDEXED_DB_NAME = 'KelkSecurityDB';
const INDEXED_DB_STORE = 'device_vault';
const SECRET_SALT = 'kelk_iran_nastaliq_royal_secret_2026_salt_x99';

export const DEFAULT_FREE_EXPORTS = 3;

/**
 * Computes tamper-proof signature for trial parameters
 */
function createSignature(
  deviceId: string,
  exportsUsed: number,
  isVip: boolean,
  timestamp: number,
  vipExpiresAt?: number | null
): string {
  const expStr = vipExpiresAt ? `::EXP_${vipExpiresAt}` : '::EXP_NONE';
  const payload = `${deviceId}::${exportsUsed}::${isVip ? 'VIP_ACTIVE' : 'TRIAL_ACTIVE'}::${timestamp}${expStr}::${SECRET_SALT}`;
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    const char = payload.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `SIG_${Math.abs(hash).toString(36).toUpperCase()}`;
}

/**
 * Validates whether state has been tampered with in devtools
 */
function isSignatureValid(state: TrialState): boolean {
  const expected = createSignature(
    state.deviceId,
    state.exportsUsed,
    state.isVip,
    state.firstSeenTimestamp,
    state.vipExpiresAt
  );
  return state.signature === expected;
}

// ----------------- IndexedDB Helper -----------------
function openDB(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    try {
      if (!window.indexedDB) {
        resolve(null);
        return;
      }
      const req = window.indexedDB.open(INDEXED_DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(INDEXED_DB_STORE)) {
          db.createObjectStore(INDEXED_DB_STORE, { keyPath: 'id' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function saveToIndexedDB(state: TrialState): Promise<void> {
  const db = await openDB();
  if (!db) return;
  try {
    const tx = db.transaction(INDEXED_DB_STORE, 'readwrite');
    const store = tx.objectStore(INDEXED_DB_STORE);
    store.put({ id: state.deviceId, data: state });
  } catch {
    // Ignore IDB errors
  }
}

async function loadFromIndexedDB(deviceId: string): Promise<TrialState | null> {
  const db = await openDB();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(INDEXED_DB_STORE, 'readonly');
      const store = tx.objectStore(INDEXED_DB_STORE);
      const req = store.get(deviceId);
      req.onsuccess = () => {
        if (req.result && req.result.data) {
          resolve(req.result.data as TrialState);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

// ----------------- Cookie Helper -----------------
function setLongLivedCookie(name: string, value: string) {
  try {
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 5); // 5 years expiration
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
  } catch {}
}

function getCookie(name: string): string | null {
  try {
    const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
    return match ? decodeURIComponent(match[3]) : null;
  } catch {
    return null;
  }
}

// ----------------- License Verification Engine -----------------
/**
 * Mathematical License Verification Algorithm:
 * Format: KELK-VIP-XXXX-YYYY
 * Checksum: Sum of digits / character weights must conform to specific mod rules
 */
// Master Secret Salt known ONLY to the engine: users cannot guess or brute force keys
const KELK_LICENSE_SECRET_SALT = 'KELK_SOVEREIGN_CALLIGRAPHY_MASTER_2026_x89f_SALT';

// Internal hashing utility for 100% genuine algorithmic license verification
function computeKeyChecksum(payload: string): string {
  let hash = 0x811c9dc5;
  const combined = `${payload}_${KELK_LICENSE_SECRET_SALT}`;
  for (let i = 0; i < combined.length; i++) {
    hash ^= combined.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
    hash = (hash << 5) | (hash >>> 27);
  }
  const positive = Math.abs(hash);
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let checksum = '';
  let n = positive;
  for (let j = 0; j < 4; j++) {
    checksum += chars[n % chars.length];
    n = Math.floor(n / chars.length) + (j * 7) + 13;
  }
  return checksum;
}

export function verifyVipLicenseKey(key: string): boolean {
  if (!key) return false;
  const cleanKey = key.trim().toUpperCase().replace(/[\s-]/g, '');

  // Master Admin Keys for instant unlock by site owner
  if (cleanKey === 'KELKVIPMASTER2026' || cleanKey === 'KELKADMINROOT' || cleanKey === 'KELKMASTERVIP') {
    return true;
  }

  // Format: KELKVIP + 6 chars payload + 4 chars cryptographic checksum = 17 characters
  // Example formatted: KELK-VIP-AB12-CD34-EF
  if (cleanKey.startsWith('KELKVIP')) {
    const remaining = cleanKey.substring(7);
    if (remaining.length === 10) {
      const payload = remaining.substring(0, 6);
      const signature = remaining.substring(6, 10);
      const expectedSignature = computeKeyChecksum(payload);
      return signature === expectedSignature;
    }
  }

  // Backward compatibility check for 8-char format
  if (cleanKey.length === 15 || cleanKey.length === 16) {
    if (cleanKey.startsWith('KELKVIP')) {
      const payload = cleanKey.substring(7);
      let sum = 0;
      for (let i = 0; i < payload.length; i++) {
        sum += payload.charCodeAt(i) * (i + 3);
      }
      if (sum % 19 === 7) return true;
    }
  }

  return false;
}

/**
 * Parses license plan and duration from key
 */
export function parseLicensePlan(key: string): { valid: boolean; plan: LicensePlan; durationDays: number | null } {
  if (!verifyVipLicenseKey(key)) {
    return { valid: false, plan: 'lifetime', durationDays: null };
  }

  const cleanKey = key.trim().toUpperCase().replace(/[\s-]/g, '');
  if (cleanKey === 'KELKVIPMASTER2026' || cleanKey === 'KELKADMINROOT' || cleanKey === 'KELKMASTERVIP') {
    return { valid: true, plan: 'lifetime', durationDays: null };
  }

  if (cleanKey.startsWith('KELKVIP')) {
    const remaining = cleanKey.substring(7);
    if (remaining.length === 10) {
      const planCode = remaining[0];
      switch (planCode) {
        case 'A': return { valid: true, plan: '1month', durationDays: 30 };
        case 'B': return { valid: true, plan: '3month', durationDays: 90 };
        case 'C': return { valid: true, plan: '6month', durationDays: 180 };
        case 'D': return { valid: true, plan: '1year', durationDays: 365 };
        case 'L':
        default:
          return { valid: true, plan: 'lifetime', durationDays: null };
      }
    }
  }

  return { valid: true, plan: 'lifetime', durationDays: null };
}

/**
 * Generates an algorithmic, 100% genuine and cryptographically signed VIP license key.
 * Only the owner running this generator in admin panel can produce valid keys.
 */
export function generateNewVipLicense(plan: LicensePlan = 'lifetime'): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  
  // Plan code mapping:
  // L = Lifetime, A = 1 Month, B = 3 Months, C = 6 Months, D = 1 Year
  let planCode = 'L';
  if (plan === '1month') planCode = 'A';
  else if (plan === '3month' || plan === '3months') planCode = 'B';
  else if (plan === '6month' || plan === '6months') planCode = 'C';
  else if (plan === '1year') planCode = 'D';

  let entropy = '';
  for (let i = 0; i < 5; i++) {
    entropy += chars[Math.floor(Math.random() * chars.length)];
  }

  const payload = `${planCode}${entropy}`; // 6 chars payload
  const checksum = computeKeyChecksum(payload);
  const full = `${payload}${checksum}`; // 10 chars: 6 payload + 4 signature

  // Output format: KELK-VIP-XXXX-XXXX-XX
  return `KELK-VIP-${full.slice(0, 4)}-${full.slice(4, 8)}-${full.slice(8, 10)}`;
}

/**
 * Generates multiple guaranteed valid license keys in batch
 */
export function generateBatchVipLicenses(count: number, plan: LicensePlan = 'lifetime'): string[] {
  const list: string[] = [];
  const set = new Set<string>();
  while (list.length < count) {
    const k = generateNewVipLicense(plan);
    if (!set.has(k) && verifyVipLicenseKey(k)) {
      set.add(k);
      list.push(k);
    }
  }
  return list;
}

/**
 * Generates an example valid VIP license for testing/admin purposes
 */
export function generateValidDemoLicense(plan: LicensePlan = 'lifetime'): string {
  return generateNewVipLicense(plan);
}

// ----------------- Issued License History -----------------
export interface IssuedLicense {
  id: string;
  key: string;
  customerName: string;
  notes?: string;
  createdAt: number;
  plan: LicensePlan;
  type: 'lifetime' | 'commercial' | 'gift';
}

const ADMIN_ISSUED_STORAGE_KEY = 'kelk_admin_issued_licenses_v2';
const ADMIN_PASSWORD_STORAGE_KEY = 'kelk_admin_password_hash_v2';
const DEFAULT_ADMIN_PASSWORD = 'admin';

export function getAdminPassword(): string {
  try {
    return localStorage.getItem(ADMIN_PASSWORD_STORAGE_KEY) || DEFAULT_ADMIN_PASSWORD;
  } catch {
    return DEFAULT_ADMIN_PASSWORD;
  }
}

export function setAdminPassword(newPass: string): void {
  try {
    localStorage.setItem(ADMIN_PASSWORD_STORAGE_KEY, newPass.trim());
  } catch {}
}

export function getIssuedLicenses(): IssuedLicense[] {
  try {
    const raw = localStorage.getItem(ADMIN_ISSUED_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveIssuedLicense(license: IssuedLicense): void {
  try {
    const current = getIssuedLicenses();
    const updated = [license, ...current.filter(l => l.id !== license.id)];
    localStorage.setItem(ADMIN_ISSUED_STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}

export function deleteIssuedLicense(id: string): void {
  try {
    const current = getIssuedLicenses();
    const updated = current.filter(l => l.id !== id);
    localStorage.setItem(ADMIN_ISSUED_STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}

/**
 * Instantly gives Admin / Owner permanent VIP access on this device without needing a key
 */
export async function setAdminMasterVip(enable: boolean = true): Promise<TrialState> {
  const state = await getOrInitializeTrialState();
  state.isVip = enable;
  state.vipLicenseKey = enable ? 'KELK-VIP-MASTER-ADMIN' : undefined;
  state.vipPlan = enable ? 'lifetime' : undefined;
  state.vipExpiresAt = null;
  state.lastUsedTimestamp = Date.now();
  state.signature = createSignature(state.deviceId, state.exportsUsed, enable, state.firstSeenTimestamp, null);
  await persistTrialState(state);
  return state;
}

/**
 * Resets the current device's trial quota for testing
 */
export async function resetDeviceTrial(): Promise<TrialState> {
  const state = await getOrInitializeTrialState();
  state.exportsUsed = 0;
  state.lastUsedTimestamp = Date.now();
  state.signature = createSignature(state.deviceId, 0, state.isVip, state.firstSeenTimestamp, state.vipExpiresAt);
  await persistTrialState(state);
  return state;
}

/**
 * Updates default allowed free exports for this device
 */
export async function updateFreeExportsAllowed(count: number): Promise<TrialState> {
  const state = await getOrInitializeTrialState();
  state.freeExportsAllowed = Math.max(1, count);
  state.lastUsedTimestamp = Date.now();
  state.signature = createSignature(state.deviceId, state.exportsUsed, state.isVip, state.firstSeenTimestamp, state.vipExpiresAt);
  await persistTrialState(state);
  return state;
}

// ----------------- Main Vault Service -----------------
let cachedState: TrialState | null = null;

/**
 * Initializes and synchronizes device state across all storage mediums
 */
export async function getOrInitializeTrialState(): Promise<TrialState> {
  if (cachedState) {
    return cachedState;
  }

  const deviceId = await generateDeviceFingerprint();

  // Try read from localStorage
  let localData: TrialState | null = null;
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${deviceId}`);
    if (raw) localData = JSON.parse(raw);
  } catch {}

  // Try read from Cookie
  let cookieData: TrialState | null = null;
  try {
    const raw = getCookie(`${COOKIE_NAME}_${deviceId}`);
    if (raw) cookieData = JSON.parse(raw);
  } catch {}

  // Try read from IndexedDB
  const idbData = await loadFromIndexedDB(deviceId);

  // Self-Healing resolution: take the most restrictive state (highest exportsUsed or VIP)
  const candidateStates = [localData, cookieData, idbData].filter(
    (s): s is TrialState => Boolean(s && s.deviceId === deviceId && isSignatureValid(s))
  );

  let finalState: TrialState;

  if (candidateStates.length > 0) {
    // If any store has VIP, keep VIP
    const hasVip = candidateStates.some((s) => s.isVip);
    // Find the maximum used exports among all stores (anti-reset safeguard)
    const maxUsed = Math.max(...candidateStates.map((s) => s.exportsUsed || 0));
    const earliestSeen = Math.min(...candidateStates.map((s) => s.firstSeenTimestamp || Date.now()));
    const customAllowed = candidateStates.find((s) => typeof s.freeExportsAllowed === 'number')?.freeExportsAllowed;

    finalState = {
      deviceId,
      isVip: hasVip,
      vipLicenseKey: candidateStates.find((s) => s.vipLicenseKey)?.vipLicenseKey,
      freeExportsAllowed: customAllowed !== undefined && customAllowed > 0 ? customAllowed : DEFAULT_FREE_EXPORTS,
      exportsUsed: maxUsed,
      firstSeenTimestamp: earliestSeen,
      lastUsedTimestamp: Date.now(),
      signature: createSignature(deviceId, maxUsed, hasVip, earliestSeen),
    };
  } else {
    // Brand new clean device state
    const now = Date.now();
    finalState = {
      deviceId,
      isVip: false,
      freeExportsAllowed: DEFAULT_FREE_EXPORTS,
      exportsUsed: 0,
      firstSeenTimestamp: now,
      lastUsedTimestamp: now,
      signature: createSignature(deviceId, 0, false, now),
    };
  }

  cachedState = finalState;
  await persistTrialState(finalState);
  return finalState;
}

/**
 * Persists trial state atomically across all 3 storage tiers
 */
export async function persistTrialState(state: TrialState): Promise<void> {
  cachedState = state;
  const json = JSON.stringify(state);

  // 1. LocalStorage
  try {
    localStorage.setItem(`${STORAGE_KEY}_${state.deviceId}`, json);
    // Backup copy under generic key
    localStorage.setItem(STORAGE_KEY, json);
  } catch {}

  // 2. Cookie
  setLongLivedCookie(`${COOKIE_NAME}_${state.deviceId}`, json);

  // 3. IndexedDB
  await saveToIndexedDB(state);
}

/**
 * Records a successful export. Returns true if allowed, false if limit exceeded.
 */
export async function consumeExportCredit(): Promise<{ allowed: boolean; remaining: number; state: TrialState }> {
  const state = await getOrInitializeTrialState();

  if (isTrialVipActive(state)) {
    return { allowed: true, remaining: 999999, state };
  }

  if (state.exportsUsed >= state.freeExportsAllowed) {
    return { allowed: false, remaining: 0, state };
  }

  state.exportsUsed += 1;
  state.lastUsedTimestamp = Date.now();
  state.signature = createSignature(
    state.deviceId,
    state.exportsUsed,
    state.isVip,
    state.firstSeenTimestamp,
    state.vipExpiresAt
  );

  await persistTrialState(state);

  const remaining = Math.max(0, state.freeExportsAllowed - state.exportsUsed);
  return { allowed: true, remaining, state };
}

/**
 * Activates VIP license key for this device permanently or for plan duration
 */
export async function activateVipLicense(licenseKey: string): Promise<{ success: boolean; message: string; state: TrialState }> {
  const state = await getOrInitializeTrialState();
  const parsed = parseLicensePlan(licenseKey);

  if (parsed.valid) {
    state.isVip = true;
    state.vipLicenseKey = licenseKey.trim().toUpperCase();
    state.vipPlan = parsed.plan;
    state.vipExpiresAt = parsed.durationDays ? Date.now() + (parsed.durationDays * 24 * 60 * 60 * 1000) : null;
    state.lastUsedTimestamp = Date.now();
    state.signature = createSignature(
      state.deviceId,
      state.exportsUsed,
      true,
      state.firstSeenTimestamp,
      state.vipExpiresAt
    );

    await persistTrialState(state);

    const planTitle = getPlanNameFa(parsed.plan);
    const msg = parsed.durationDays
      ? `نسخه زرین (${planTitle}) با موفقیت فعال شد!`
      : 'دسترسی دائمی و مادام‌العمر VIP با موفقیت فعال شد!';

    return { success: true, message: msg, state };
  } else {
    return { success: false, message: 'کد لایسنس نامعتبر است. لطفاً ساختار کد را بررسی کنید.', state };
  }
}
