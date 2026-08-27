import React from 'react';
import { 
  Maximize2, 
  Type, 
  Sparkles, 
  Palette, 
  Layers, 
  Menu
} from 'lucide-react';
import { CanvasElement } from '../types/calligraphy';

export type MobileTab = 'canvas' | 'text' | 'dots' | 'tazhib' | 'paper' | 'layers' | 'menu';

interface MobileBottomNavProps {
  activeTab: MobileTab;
  onSelectTab: (tab: MobileTab) => void;
  selectedElement?: CanvasElement | null;
  elementsCount?: number;
  onOpenMenu?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = React.memo(({
  activeTab,
  onSelectTab,
  selectedElement,
  elementsCount = 0,
  onOpenMenu,
}) => {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/98 border-t border-neutral-800/90 backdrop-blur-xl px-1.5 py-1.5 flex items-center justify-around select-none font-vazir text-neutral-300 shadow-[0_-8px_30px_rgba(0,0,0,0.8)] pb-safe">
      {/* 1. Canvas View (Full view) */}
      <button
        onClick={() => onSelectTab('canvas')}
        className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
          activeTab === 'canvas'
            ? 'text-amber-400 bg-amber-500/20 border border-amber-500/40 font-bold shadow-sm'
            : 'text-neutral-400 hover:text-neutral-200'
        }`}
      >
        <Maximize2 className="w-4 h-4 mb-0.5" />
        <span className="text-[10px] whitespace-nowrap">بوم</span>
      </button>

      {/* 2. Text & Font Settings */}
      <button
        onClick={() => onSelectTab('text')}
        className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all relative ${
          activeTab === 'text'
            ? 'text-amber-400 bg-amber-500/20 border border-amber-500/40 font-bold shadow-sm'
            : 'text-neutral-400 hover:text-neutral-200'
        }`}
      >
        <Type className="w-4 h-4 mb-0.5" />
        <span className="text-[10px] whitespace-nowrap">متن و قلم</span>
        {selectedElement && (
          <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-amber-400"></span>
        )}
      </button>

      {/* 3. Tazhib & Ornaments */}
      <button
        onClick={() => onSelectTab('tazhib')}
        className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
          activeTab === 'tazhib'
            ? 'text-amber-400 bg-amber-500/20 border border-amber-500/40 font-bold shadow-sm'
            : 'text-neutral-400 hover:text-neutral-200'
        }`}
      >
        <Sparkles className="w-4 h-4 mb-0.5" />
        <span className="text-[10px] whitespace-nowrap">تذهیب و اعراب</span>
      </button>

      {/* 4. Paper & Frame */}
      <button
        onClick={() => onSelectTab('paper')}
        className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
          activeTab === 'paper'
            ? 'text-amber-400 bg-amber-500/20 border border-amber-500/40 font-bold shadow-sm'
            : 'text-neutral-400 hover:text-neutral-200'
        }`}
      >
        <Palette className="w-4 h-4 mb-0.5" />
        <span className="text-[10px] whitespace-nowrap">کاغذ و قاب</span>
      </button>

      {/* 5. Layers */}
      <button
        onClick={() => onSelectTab('layers')}
        className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
          activeTab === 'layers'
            ? 'text-amber-400 bg-amber-500/20 border border-amber-500/40 font-bold shadow-sm'
            : 'text-neutral-400 hover:text-neutral-200'
        }`}
      >
        <Layers className="w-4 h-4 mb-0.5" />
        <span className="text-[10px] whitespace-nowrap">لایه‌ها {elementsCount > 0 ? `(${elementsCount})` : ''}</span>
      </button>

      {/* 6. All Studios / Menu */}
      <button
        onClick={() => {
          if (onOpenMenu) {
            onOpenMenu();
          } else {
            onSelectTab('menu');
          }
        }}
        className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-all font-bold"
      >
        <Menu className="w-4 h-4 mb-0.5" />
        <span className="text-[10px] whitespace-nowrap">استودیوها</span>
      </button>
    </nav>
  );
});
