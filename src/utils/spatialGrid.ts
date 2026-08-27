import { CanvasElement } from '../types/calligraphy';

export interface SpatialGridBucket {
  elementIds: string[];
}

export interface SnapGuide {
  id: string;
  type: 'x' | 'y' | 'diagonal';
  position: number;
  label?: string;
}

/**
 * Spatial Hash Grid for high-performance O(1) proximity queries and magnetic alignment
 */
export class SpatialHashGrid {
  private cellSize: number;
  private grid: Map<string, string[]>;
  private elementMap: Map<string, CanvasElement>;

  constructor(cellSize: number = 120) {
    this.cellSize = cellSize;
    this.grid = new Map();
    this.elementMap = new Map();
  }

  private getKey(gridX: number, gridY: number): string {
    return `${gridX}:${gridY}`;
  }

  /**
   * Rebuild the spatial grid with current elements
   */
  public populate(elements: CanvasElement[]) {
    this.grid.clear();
    this.elementMap.clear();

    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      if (el.isVisible === false) continue;
      this.elementMap.set(el.id, el);

      const gx = Math.floor(el.x / this.cellSize);
      const gy = Math.floor(el.y / this.cellSize);
      const key = this.getKey(gx, gy);

      let bucket = this.grid.get(key);
      if (!bucket) {
        bucket = [];
        this.grid.set(key, bucket);
      }
      bucket.push(el.id);
    }
  }

  /**
   * Retrieve candidate nearby elements within search radius in O(1) bucket lookups
   */
  public getNearbyElements(x: number, y: number, radius: number = 180, excludeIds: string[] = []): CanvasElement[] {
    const minGx = Math.floor((x - radius) / this.cellSize);
    const maxGx = Math.floor((x + radius) / this.cellSize);
    const minGy = Math.floor((y - radius) / this.cellSize);
    const maxGy = Math.floor((y + radius) / this.cellSize);

    const candidates = new Set<string>();
    const excludeSet = new Set(excludeIds);

    for (let gx = minGx; gx <= maxGx; gx++) {
      for (let gy = minGy; gy <= maxGy; gy++) {
        const bucket = this.grid.get(this.getKey(gx, gy));
        if (bucket) {
          for (let i = 0; i < bucket.length; i++) {
            const id = bucket[i];
            if (!excludeSet.has(id)) {
              candidates.add(id);
            }
          }
        }
      }
    }

    const result: CanvasElement[] = [];
    candidates.forEach(id => {
      const el = this.elementMap.get(id);
      if (el) result.push(el);
    });

    return result;
  }

  /**
   * High-speed magnetic snap calculation against spatial candidates
   */
  public computeMagneticSnapping(
    targetX: number,
    targetY: number,
    draggedElementId: string,
    canvasWidth: number,
    canvasHeight: number,
    threshold: number = 10,
    showKorsiVasat: boolean = true,
    showKorsiMabda: boolean = true,
    showKorsiForood: boolean = true,
    excludeIds: string[] = []
  ): { finalX: number; finalY: number; guides: SnapGuide[] } {
    let finalX = targetX;
    let finalY = targetY;
    const guides: SnapGuide[] = [];

    // 1. Canvas Center Snapping
    const centerX = Math.round(canvasWidth / 2);
    const centerY = Math.round(canvasHeight / 2);

    if (Math.abs(targetX - centerX) < threshold) {
      finalX = centerX;
      guides.push({ id: 'center_x', type: 'x', position: centerX, label: 'مرکز بوم' });
    }
    if (Math.abs(targetY - centerY) < threshold) {
      finalY = centerY;
      guides.push({ id: 'center_y', type: 'y', position: centerY, label: 'کرسی مرکزی' });
    }

    // 2. Korsi Lines
    const mabdaY = centerY - 70;
    const foroodY = centerY + 70;

    if (showKorsiMabda && Math.abs(targetY - mabdaY) < threshold) {
      finalY = mabdaY;
      guides.push({ id: 'korsi_mabda', type: 'y', position: mabdaY, label: 'خط مبدأ' });
    }
    if (showKorsiForood && Math.abs(targetY - foroodY) < threshold) {
      finalY = foroodY;
      guides.push({ id: 'korsi_forood', type: 'y', position: foroodY, label: 'خط فرود' });
    }

    // 3. Candidate Neighbors Alignment via Spatial Grid
    const nearby = this.getNearbyElements(targetX, targetY, 300, [draggedElementId, ...excludeIds]);
    for (let i = 0; i < nearby.length; i++) {
      const other = nearby[i];
      if (Math.abs(finalX - other.x) < threshold) {
        finalX = other.x;
        guides.push({
          id: `snap_x_${other.id}`,
          type: 'x',
          position: other.x,
          label: other.name || other.text?.slice(0, 8) || 'هم‌راستا',
        });
      }
      if (Math.abs(finalY - other.y) < threshold) {
        finalY = other.y;
        guides.push({
          id: `snap_y_${other.id}`,
          type: 'y',
          position: other.y,
          label: other.name || other.text?.slice(0, 8) || 'هم‌تراز',
        });
      }
    }

    return { finalX, finalY, guides };
  }
}
