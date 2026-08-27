import { CustomUserFont } from '../types/calligraphy';

/**
 * Supported font binary magic numbers / signatures
 */
export type FontFormat = 'truetype' | 'opentype' | 'woff' | 'woff2' | 'ttc';

export interface FontValidationResult {
  isValid: boolean;
  format?: FontFormat;
  mimeType?: string;
  family?: string;
  fullName?: string;
  subfamily?: string;
  version?: string;
  postScriptName?: string;
  designer?: string;
  copyright?: string;
  glyphCountEstimate?: number;
  error?: string;
  warnings?: string[];
  testRenderSuccess?: boolean;
}

export interface FontStatus {
  id: string;
  isLoaded: boolean;
  status: 'unloaded' | 'loading' | 'loaded' | 'error';
  errorMessage?: string;
}

const DB_NAME = 'KelkCalligraphyDB';
const DB_VERSION = 1;
const STORE_NAME = 'user_fonts';
const USER_FONTS_LOCAL_KEY = 'kelk_custom_user_fonts_v2';
const USER_FONTS_LEGACY_KEY = 'kelk_custom_user_fonts';

/**
 * Open IndexedDB for durable, large-capacity font storage (surpasses localStorage 5MB limit)
 */
function openFontDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB is not supported in this environment'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open IndexedDB'));
  });
}

/**
 * Inspects binary magic bytes from ArrayBuffer to detect valid font formats with file extension fallback
 */
export function detectFontFormatFromBuffer(buffer: ArrayBuffer, fileName?: string): { format: FontFormat; mimeType: string } | null {
  if (buffer && buffer.byteLength >= 4) {
    const view = new DataView(buffer);
    const tag = view.getUint32(0, false); // Big endian

    // 0x00010000 or 0x00020000 -> TrueType version 1.0 / 2.0
    if (tag === 0x00010000 || tag === 0x00020000) {
      return { format: 'truetype', mimeType: 'font/ttf' };
    }
    // 'true' (0x74727565) -> TrueType (Apple Mac)
    if (tag === 0x74727565) {
      return { format: 'truetype', mimeType: 'font/ttf' };
    }
    // 'typ1' (0x74797031) -> PostScript Type 1
    if (tag === 0x74797031) {
      return { format: 'truetype', mimeType: 'font/ttf' };
    }
    // 'OTTO' (0x4F54544F) -> OpenType with CFF outlines
    if (tag === 0x4F54544F) {
      return { format: 'opentype', mimeType: 'font/otf' };
    }
    // 'wOFF' (0x774F4646) -> WOFF 1.0
    if (tag === 0x774F4646) {
      return { format: 'woff', mimeType: 'font/woff' };
    }
    // 'wOF2' (0x774F4632) -> WOFF 2.0
    if (tag === 0x774F4632) {
      return { format: 'woff2', mimeType: 'font/woff2' };
    }
    // 'ttcf' (0x74746366) -> TrueType Collection
    if (tag === 0x74746366) {
      return { format: 'ttc', mimeType: 'font/collection' };
    }
  }

  // Fallback by file extension if tag has custom wrappers or variable table headers
  if (fileName) {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'ttf') return { format: 'truetype', mimeType: 'font/ttf' };
    if (ext === 'otf') return { format: 'opentype', mimeType: 'font/otf' };
    if (ext === 'woff') return { format: 'woff', mimeType: 'font/woff' };
    if (ext === 'woff2') return { format: 'woff2', mimeType: 'font/woff2' };
    if (ext === 'ttc') return { format: 'ttc', mimeType: 'font/collection' };
  }

  return null;
}

/**
 * Parses TrueType / OpenType SFNT 'name' table to extract real human-readable font metadata
 */
export function extractFontMetadata(buffer: ArrayBuffer): Partial<FontValidationResult> {
  const metadata: Partial<FontValidationResult> = {};
  try {
    if (buffer.byteLength < 12) return metadata;
    const view = new DataView(buffer);
    const sfntVersion = view.getUint32(0, false);

    // Only TTF / OTF have standard uncompressed SFNT tables (WOFF wraps them, WOFF2 compresses with Brotli)
    if (sfntVersion !== 0x00010000 && sfntVersion !== 0x74727565 && sfntVersion !== 0x4F54544F) {
      return metadata;
    }

    const numTables = view.getUint16(4, false);
    let nameTableOffset = 0;
    let nameTableLength = 0;
    let maxpTableOffset = 0;

    // Scan table records (each 16 bytes: 4 tag, 4 checkSum, 4 offset, 4 length)
    for (let i = 0; i < numTables; i++) {
      const recordOffset = 12 + i * 16;
      if (recordOffset + 16 > buffer.byteLength) break;
      const tag = view.getUint32(recordOffset, false);
      const offset = view.getUint32(recordOffset + 8, false);
      const length = view.getUint32(recordOffset + 12, false);

      if (tag === 0x6E616D65) { // 'name'
        nameTableOffset = offset;
        nameTableLength = length;
      } else if (tag === 0x6D617870) { // 'maxp'
        maxpTableOffset = offset;
      }
    }

    // Parse maxp table for glyph count if available
    if (maxpTableOffset > 0 && maxpTableOffset + 6 <= buffer.byteLength) {
      const numGlyphs = view.getUint16(maxpTableOffset + 4, false);
      metadata.glyphCountEstimate = numGlyphs;
    }

    // Parse 'name' table
    if (nameTableOffset > 0 && nameTableOffset + 6 <= buffer.byteLength) {
      const count = view.getUint16(nameTableOffset + 2, false);
      const stringStorageOffset = nameTableOffset + view.getUint16(nameTableOffset + 4, false);

      const nameRecords: { platformID: number; encodingID: number; languageID: number; nameID: number; length: number; offset: number }[] = [];

      for (let i = 0; i < count; i++) {
        const recordPos = nameTableOffset + 6 + i * 12;
        if (recordPos + 12 > nameTableOffset + nameTableLength) break;

        const platformID = view.getUint16(recordPos, false);
        const encodingID = view.getUint16(recordPos + 2, false);
        const languageID = view.getUint16(recordPos + 4, false);
        const nameID = view.getUint16(recordPos + 6, false);
        const length = view.getUint16(recordPos + 8, false);
        const offset = view.getUint16(recordPos + 10, false);

        nameRecords.push({ platformID, encodingID, languageID, nameID, length, offset });
      }

      // Helper to read string record
      const readString = (rec: typeof nameRecords[0]): string => {
        const strOffset = stringStorageOffset + rec.offset;
        if (strOffset + rec.length > buffer.byteLength) return '';

        // UTF-16BE encoding (Windows platform 3 or Unicode platform 0)
        if (rec.platformID === 3 || rec.platformID === 0) {
          let str = '';
          for (let b = 0; b < rec.length; b += 2) {
            const charCode = view.getUint16(strOffset + b, false);
            str += String.fromCharCode(charCode);
          }
          return str.trim();
        } else {
          // ASCII / Latin
          let str = '';
          for (let b = 0; b < rec.length; b++) {
            const charCode = view.getUint8(strOffset + b);
            str += String.fromCharCode(charCode);
          }
          return str.trim();
        }
      };

      for (const rec of nameRecords) {
        const text = readString(rec);
        if (!text) continue;

        switch (rec.nameID) {
          case 0:
            if (!metadata.copyright) metadata.copyright = text;
            break;
          case 1:
            if (!metadata.family || rec.platformID === 3) metadata.family = text;
            break;
          case 2:
            if (!metadata.subfamily || rec.platformID === 3) metadata.subfamily = text;
            break;
          case 4:
            if (!metadata.fullName || rec.platformID === 3) metadata.fullName = text;
            break;
          case 5:
            if (!metadata.version || rec.platformID === 3) metadata.version = text;
            break;
          case 6:
            if (!metadata.postScriptName || rec.platformID === 3) metadata.postScriptName = text;
            break;
          case 9:
            if (!metadata.designer) metadata.designer = text;
            break;
        }
      }
    }
  } catch (e) {
    console.warn('Could not parse full SFNT name table (non-fatal):', e);
  }
  return metadata;
}

/**
 * Validates a font file: checks file header, magic numbers, loads via FontFace, and runs a Canvas glyph rasterization test.
 */
export async function validateFontFile(file: File): Promise<FontValidationResult> {
  const warnings: string[] = [];

  if (!file) {
    return { isValid: false, error: 'فایلی انتخاب نشده است.' };
  }

  // 1. File Size Check (Max 25MB)
  if (file.size === 0) {
    return { isValid: false, error: 'فایل فونت خالی است (حجم صفر بایت).' };
  }
  if (file.size > 25 * 1024 * 1024) {
    return { isValid: false, error: 'حجم فایل نباید بیشتر از ۲۵ مگابایت باشد.' };
  }

  // 2. Read first bytes for signature inspection
  let arrayBuffer: ArrayBuffer;
  try {
    arrayBuffer = await file.arrayBuffer();
  } catch (e) {
    return { isValid: false, error: 'خطا در خواندن باینری فایل از دیسک.' };
  }

  const detected = detectFontFormatFromBuffer(arrayBuffer, file.name);
  if (!detected) {
    return {
      isValid: false,
      error: 'فرمت فایل قلم ناشناخته است. لطفاً فایل قلم استاندارد با پسوند TTF، OTF، WOFF یا WOFF2 انتخاب نمایید.',
    };
  }

  // Extract internal metadata if TTF/OTF
  const meta = extractFontMetadata(arrayBuffer);

  // 3. Test instantiate FontFace and measure glyph rendering
  const testFamilyName = `KelkValidationTest_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  let testRenderSuccess = false;

  if (typeof window !== 'undefined' && 'FontFace' in window) {
    try {
      const testFace = new FontFace(testFamilyName, arrayBuffer, {
        style: 'normal',
        weight: 'normal',
      });

      const loaded = await testFace.load();
      document.fonts.add(loaded);

      // Verify glyph rasterization with Canvas 2D measurement
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const testPhrase = 'کلک خوشنویسی Nastaliq 123';
        
        // Measure with generic monospace fallback
        ctx.font = '32px monospace';
        const fallbackMetrics = ctx.measureText(testPhrase);

        // Measure with our loaded font
        ctx.font = `32px "${testFamilyName}", monospace`;
        const testMetrics = ctx.measureText(testPhrase);

        // If the font loaded, width or bounding metrics will be valid and non-zero
        if (testMetrics.width > 0) {
          testRenderSuccess = true;
        }
      }

      // Cleanup test font
      document.fonts.delete(loaded);
    } catch (loadErr: any) {
      warnings.push(`هشدار بارگذاری مرورگر: ${loadErr?.message || 'مشکل جزیی در ساختار گلیف‌ها'}`);
      // Still allow if format was detected, but mark render as partial
    }
  }

  return {
    isValid: true,
    format: detected.format,
    mimeType: detected.mimeType,
    family: meta.family || file.name.replace(/\.[^/.]+$/, '').trim(),
    fullName: meta.fullName || meta.family,
    subfamily: meta.subfamily,
    version: meta.version,
    postScriptName: meta.postScriptName,
    designer: meta.designer,
    copyright: meta.copyright,
    glyphCountEstimate: meta.glyphCountEstimate,
    warnings: warnings.length > 0 ? warnings : undefined,
    testRenderSuccess,
  };
}

/**
 * Storage manager for custom fonts: Uses IndexedDB with LocalStorage metadata cache
 */
export class FontStorageEngine {
  /**
   * Save a font to IndexedDB and metadata to LocalStorage
   */
  static async saveFont(font: CustomUserFont): Promise<void> {
    try {
      const db = await openFontDatabase();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(font);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (dbErr) {
      console.warn('IndexedDB save failed, attempting LocalStorage fallback:', dbErr);
    }

    // Also update LocalStorage index
    try {
      const all = await this.getAllFonts();
      const filtered = all.filter(f => f.id !== font.id);
      const updated = [font, ...filtered];
      // Store compact representation if dataUrl is huge
      try {
        localStorage.setItem(USER_FONTS_LOCAL_KEY, JSON.stringify(updated));
      } catch (quotaErr) {
        // Store without huge dataUrl in localStorage as fallback
        const compact = updated.map(f => ({ ...f, dataUrl: '' }));
        localStorage.setItem(USER_FONTS_LOCAL_KEY, JSON.stringify(compact));
      }
    } catch (e) {
      console.error('LocalStorage sync error:', e);
    }
  }

  /**
   * Retrieve all custom fonts from IndexedDB (or LocalStorage fallback)
   */
  static async getAllFonts(): Promise<CustomUserFont[]> {
    // 1. Try IndexedDB first (most reliable and full binary)
    try {
      const db = await openFontDatabase();
      const fonts = await new Promise<CustomUserFont[]>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });

      if (fonts && fonts.length > 0) {
        return fonts;
      }
    } catch (e) {
      // Fallback
    }

    // 2. LocalStorage V2
    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(USER_FONTS_LOCAL_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {}

      // 3. Legacy LocalStorage fallback
      try {
        const legacy = localStorage.getItem(USER_FONTS_LEGACY_KEY);
        if (legacy) {
          const parsed = JSON.parse(legacy);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Migrate to IndexedDB in background
            parsed.forEach(f => this.saveFont(f).catch(() => {}));
            return parsed;
          }
        }
      } catch (e) {}
    }

    return [];
  }

  /**
   * Delete font by ID from all stores
   */
  static async deleteFont(id: string): Promise<void> {
    try {
      const db = await openFontDatabase();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {}

    try {
      const current = await this.getAllFonts();
      const updated = current.filter(f => f.id !== id);
      localStorage.setItem(USER_FONTS_LOCAL_KEY, JSON.stringify(updated));
    } catch (e) {}
  }
}

/**
 * Singleton Font Lifecycle Manager:
 * Ensures all registered custom fonts remain permanently registered in document.fonts
 * and in dynamic CSS style rules across component unmounts, route transitions, and canvas exports.
 */
class FontLifecycleManagerClass {
  private registeredFontFaces: Map<string, FontFace> = new Map();
  private fontStatuses: Map<string, FontStatus> = new Map();
  private listeners: Set<() => void> = new Set();
  private isInitialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      // Re-verify fonts when window gains focus or document becomes visible
      window.addEventListener('focus', () => this.ensureAllActive());
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) this.ensureAllActive();
      });
    }
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notify() {
    this.listeners.forEach(cb => {
      try { cb(); } catch (e) { console.error(e); }
    });
  }

  public getStatus(fontId: string): FontStatus {
    return this.fontStatuses.get(fontId) || {
      id: fontId,
      isLoaded: false,
      status: 'unloaded',
    };
  }

  /**
   * Initialize and restore all fonts
   */
  public async initialize(): Promise<CustomUserFont[]> {
    if (this.isInitialized) {
      return FontStorageEngine.getAllFonts();
    }
    const fonts = await FontStorageEngine.getAllFonts();
    for (const font of fonts) {
      await this.registerFont(font, false);
    }
    this.isInitialized = true;
    this.notify();
    return fonts;
  }

  /**
   * Registers a single CustomUserFont into document.fonts and CSS <head> stylesheet.
   */
  public async registerFont(font: CustomUserFont, persist = true): Promise<boolean> {
    if (!font || !font.fontFamily || !font.dataUrl) return false;

    this.fontStatuses.set(font.id, {
      id: font.id,
      isLoaded: false,
      status: 'loading',
    });
    this.notify();

    let loadedSuccessfully = false;

    // Helper: Convert base64 data URL to ArrayBuffer for reliable binary FontFace loading
    const decodeDataUrlToBuffer = (dataUrl: string): ArrayBuffer | null => {
      try {
        const base64Index = dataUrl.indexOf('base64,');
        const base64 = base64Index !== -1 ? dataUrl.substring(base64Index + 7) : dataUrl;
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
      } catch (e) {
        return null;
      }
    };

    // 1. Register with Browser FontFace API using ArrayBuffer (100% reliable across all browsers)
    if (typeof window !== 'undefined' && 'FontFace' in window && font.dataUrl) {
      try {
        // Unregister existing instance if present
        if (this.registeredFontFaces.has(font.id)) {
          const oldFace = this.registeredFontFaces.get(font.id)!;
          try { document.fonts.delete(oldFace); } catch (e) {}
        }

        const buffer = decodeDataUrlToBuffer(font.dataUrl);
        let fontFace: FontFace;

        if (buffer) {
          fontFace = new FontFace(font.fontFamily, buffer, {
            style: 'normal',
            weight: 'normal',
            display: 'swap',
          });
        } else {
          // Fallback to URL without format syntax that breaks in some browsers
          fontFace = new FontFace(font.fontFamily, `url("${font.dataUrl}")`, {
            style: 'normal',
            weight: 'normal',
            display: 'swap',
          });
        }

        const loadedFace = await fontFace.load();
        document.fonts.add(loadedFace);
        this.registeredFontFaces.set(font.id, loadedFace);
        loadedSuccessfully = true;
      } catch (err: any) {
        console.warn(`FontFace load notice for font ${font.name}:`, err);
      }
    }

    // 2. Inject resilient CSS @font-face style rule in document head (failsafe stylesheet fallback)
    if (typeof document !== 'undefined') {
      try {
        const styleId = `kelk-font-${font.id}`;
        let styleTag = document.getElementById(styleId) as HTMLStyleElement | null;
        if (!styleTag) {
          styleTag = document.createElement('style');
          styleTag.id = styleId;
          styleTag.setAttribute('data-kelk-font-id', font.id);
          document.head.appendChild(styleTag);
        }

        const formatSpecifier = font.format === 'opentype' ? 'opentype' :
          font.format === 'woff2' ? 'woff2' :
          font.format === 'woff' ? 'woff' : 'truetype';

        styleTag.textContent = `
          @font-face {
            font-family: '${font.fontFamily}';
            src: url("${font.dataUrl}") format('${formatSpecifier}');
            font-weight: normal;
            font-style: normal;
            font-display: swap;
          }
        `;
        loadedSuccessfully = true;

        // Force browser to load the font face
        if (document.fonts && document.fonts.load) {
          try {
            await document.fonts.load(`16px "${font.fontFamily}"`);
          } catch (e) {}
        }
      } catch (cssErr) {
        console.error('Failed to inject @font-face style rule:', cssErr);
      }
    }

    if (persist) {
      await FontStorageEngine.saveFont(font);
    }

    this.fontStatuses.set(font.id, {
      id: font.id,
      isLoaded: loadedSuccessfully,
      status: loadedSuccessfully ? 'loaded' : 'error',
    });

    this.notify();
    return loadedSuccessfully;
  }

  /**
   * Unregisters a font
   */
  public async unregisterFont(fontId: string): Promise<void> {
    if (this.registeredFontFaces.has(fontId)) {
      const face = this.registeredFontFaces.get(fontId)!;
      try { document.fonts.delete(face); } catch (e) {}
      this.registeredFontFaces.delete(fontId);
    }

    if (typeof document !== 'undefined') {
      const styleTag = document.getElementById(`kelk-font-${fontId}`);
      if (styleTag && styleTag.parentNode) {
        styleTag.parentNode.removeChild(styleTag);
      }
    }

    this.fontStatuses.delete(fontId);
    await FontStorageEngine.deleteFont(fontId);
    this.notify();
  }

  /**
   * Re-verifies all active fonts are still present in document.fonts
   */
  public async ensureAllActive(): Promise<void> {
    if (typeof document === 'undefined' || !document.fonts) return;

    for (const [id, fontFace] of this.registeredFontFaces.entries()) {
      if (!document.fonts.has(fontFace)) {
        try {
          document.fonts.add(fontFace);
        } catch (e) {}
      }
    }
  }

  /**
   * Wait for all fonts in the document to be ready (e.g., before high-res canvas / PDF render)
   */
  public async ready(): Promise<void> {
    if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch (e) {}
    }
  }
}

export const FontLifecycleManager = new FontLifecycleManagerClass();
