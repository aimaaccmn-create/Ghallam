/**
 * Deep Device & Hardware Fingerprinting Engine
 * Collects stable, un-spoofable hardware signatures:
 * - Canvas 2D geometry and sub-pixel anti-aliasing rendering
 * - WebGL unmasked graphics vendor & renderer (GPU physical chip)
 * - Web Audio API dynamic frequency compression footprint
 * - Hardware specs (screen, depth, pixel ratio, cores, device memory, timezone)
 */

// Simple robust string hashing (Murmur/FNV-inspired 64-bit hex hash)
function hashString(str: string): string {
  let h1 = 0xdeadbeef ^ 0;
  let h2 = 0x41c6ce57 ^ 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
}

/**
 * Generates a Canvas 2D hardware-specific rendering fingerprint.
 * Differences in GPU rasterization, font smoothing, and composite blending create unique output.
 */
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 240;
    canvas.height = 60;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'no_canvas';

    ctx.textBaseline = 'top';
    ctx.font = "16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);

    ctx.fillStyle = '#069';
    ctx.fillText('KelkPersian🎨✨', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('KelkPersian🎨✨', 4, 17);

    // Advanced geometry & blending
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgb(255,0,255)';
    ctx.beginPath();
    ctx.arc(50, 35, 15, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgb(0,255,255)';
    ctx.beginPath();
    ctx.arc(65, 35, 15, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();

    return hashString(canvas.toDataURL());
  } catch {
    return 'canvas_err';
  }
}

/**
 * Obtains physical GPU details via WebGL unmasked vendor and renderer.
 * Returns exact graphics chipset (e.g., Apple M2, NVIDIA RTX 3070, Mali-G78, Adreno 650).
 */
function getWebGLFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) return 'no_webgl';

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    let vendor = '';
    let renderer = '';

    if (debugInfo) {
      vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || '';
      renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
    } else {
      vendor = gl.getParameter(gl.VENDOR) || '';
      renderer = gl.getParameter(gl.RENDERER) || '';
    }

    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) || 0;
    const maxRenderBufferSize = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE) || 0;

    return hashString(`${vendor}~${renderer}~${maxTextureSize}~${maxRenderBufferSize}`);
  } catch {
    return 'webgl_err';
  }
}

/**
 * Extracts audio hardware and sound-card processing idiosyncrasies.
 * Uses OfflineAudioContext to render offline in memory without accessing speakers
 * and completely avoids live AudioContext closing errors.
 */
async function getAudioFingerprint(): Promise<string> {
  try {
    const OfflineContext =
      window.OfflineAudioContext ||
      (window as unknown as { webkitOfflineAudioContext?: typeof OfflineAudioContext }).webkitOfflineAudioContext;

    if (!OfflineContext) return 'no_audio';

    // 1 channel, 5000 frames at 44100Hz (~113ms offline buffer)
    const context = new OfflineContext(1, 5000, 44100);
    const oscillator = context.createOscillator();
    oscillator.type = 'triangle';
    oscillator.frequency.value = 10000;

    const compressor = context.createDynamicsCompressor();
    compressor.threshold.value = -50;
    compressor.knee.value = 40;
    compressor.ratio.value = 12;
    compressor.attack.value = 0;
    compressor.release.value = 0.25;

    oscillator.connect(compressor);
    compressor.connect(context.destination);
    oscillator.start(0);

    const renderPromise = context
      .startRendering()
      .then((buffer) => {
        const channelData = buffer.getChannelData(0);
        let sum = 0;
        for (let i = 0; i < channelData.length; i += 5) {
          sum += Math.abs(channelData[i]);
        }
        return hashString(`offline_audio_${sum.toFixed(7)}`);
      })
      .catch(() => 'audio_render_err');

    const timeoutPromise = new Promise<string>((resolve) => {
      setTimeout(() => resolve('audio_timeout'), 500);
    });

    return await Promise.race([renderPromise, timeoutPromise]);
  } catch {
    return 'audio_unsupported';
  }
}

/**
 * Returns invariant hardware specs of the physical device
 */
function getHardwareEnvironment(): string {
  const parts: string[] = [];

  // Screen and color metrics
  if (window.screen) {
    parts.push(`w:${window.screen.width}`);
    parts.push(`h:${window.screen.height}`);
    parts.push(`cd:${window.screen.colorDepth}`);
    parts.push(`pr:${window.devicePixelRatio || 1}`);
  }

  // CPU cores
  if (navigator.hardwareConcurrency) {
    parts.push(`cores:${navigator.hardwareConcurrency}`);
  }

  // RAM estimation
  if ((navigator as unknown as { deviceMemory?: number }).deviceMemory) {
    parts.push(`ram:${(navigator as unknown as { deviceMemory?: number }).deviceMemory}`);
  }

  // Timezone and locale formatting engine
  try {
    parts.push(`tz:${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
  } catch {
    parts.push(`tzOff:${new Date().getTimezoneOffset()}`);
  }

  // Touch points
  parts.push(`mtp:${navigator.maxTouchPoints || 0}`);

  return parts.join('|');
}

let cachedDeviceFingerprint: string | null = null;

/**
 * Generates the master hardware fingerprint for the device.
 * Persistent across regular tabs, private/incognito tabs, and history clearing.
 */
export async function generateDeviceFingerprint(): Promise<string> {
  if (cachedDeviceFingerprint) {
    return cachedDeviceFingerprint;
  }

  const [canvasFp, webglFp, audioFp] = await Promise.all([
    Promise.resolve(getCanvasFingerprint()),
    Promise.resolve(getWebGLFingerprint()),
    getAudioFingerprint(),
  ]);

  const hardwareEnv = getHardwareEnvironment();
  const rawCombined = `KELK_V2_HW:[${canvasFp}]:[${webglFp}]:[${audioFp}]:[${hardwareEnv}]`;

  cachedDeviceFingerprint = `DEV_${hashString(rawCombined).toUpperCase()}`;
  return cachedDeviceFingerprint;
}
