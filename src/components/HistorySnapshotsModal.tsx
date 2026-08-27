import React, { useState } from 'react';
import { 
  History, 
  Bookmark, 
  Plus, 
  RotateCcw, 
  Trash2, 
  Clock, 
  Check, 
  X, 
  Layers,
  Sparkles
} from 'lucide-react';
import { HistorySnapshot, KelkProject } from '../types/calligraphy';

interface HistorySnapshotsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProject: KelkProject;
  snapshots: HistorySnapshot[];
  onSaveSnapshot: (title: string) => void;
  onRestoreSnapshot: (snapshot: HistorySnapshot) => void;
  onDeleteSnapshot: (id: string) => void;
  undoStackLength: number;
  redoStackLength: number;
  onUndo: () => void;
  onRedo: () => void;
}

export const HistorySnapshotsModal: React.FC<HistorySnapshotsModalProps> = React.memo(({
  isOpen,
  onClose,
  currentProject,
  snapshots,
  onSaveSnapshot,
  onRestoreSnapshot,
  onDeleteSnapshot,
  undoStackLength,
  redoStackLength,
  onUndo,
  onRedo,
}) => {
  const [newTitle, setNewTitle] = useState<string>('');

  const handleCreateSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onSaveSnapshot(newTitle.trim());
    setNewTitle('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 dir-rtl font-vazir select-none">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 px-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-100">
                تاریخچه تغییرات و مدیریت نسخه‌های پروژه (Version History)
              </h2>
              <p className="text-xs text-neutral-400">
                ثبت نقاط عطف، بازگشت به هر مرحله از طراحی و بازیابی چیدمان‌های گذشته
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Undo / Redo Bar */}
        <div className="p-4 px-6 border-b border-neutral-800/80 bg-neutral-950/20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-neutral-300">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>گام‌های ذخیره شده در حافظه موقت:</span>
            <span className="text-amber-400 font-mono font-bold">{undoStackLength} مرحله بازگشت</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onUndo}
              disabled={undoStackLength === 0}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 disabled:opacity-40 text-xs text-neutral-200 transition-all border border-neutral-700"
            >
              بازگشت (Undo - Ctrl+Z)
            </button>
            <button
              onClick={onRedo}
              disabled={redoStackLength === 0}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 disabled:opacity-40 text-xs text-neutral-200 transition-all border border-neutral-700"
            >
              پیش‌روی (Redo - Ctrl+Y)
            </button>
          </div>
        </div>

        {/* Create New Snapshot Form */}
        <div className="p-4 px-6 border-b border-neutral-800/60 bg-neutral-900/60">
          <form onSubmit={handleCreateSnapshot} className="flex gap-2">
            <input
              type="text"
              placeholder="نام نسخه جدید (مثلاً: قبل از تذهیب کاری، ترکیب‌بندی چلیپا ۲)..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="flex-1 px-4 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:border-amber-500/80 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!newTitle.trim()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:opacity-40 text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
            >
              <Bookmark className="w-4 h-4" />
              <span>ثبت نقطه عطف (Snapshot)</span>
            </button>
          </form>
        </div>

        {/* Snapshots List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {snapshots.length === 0 ? (
            <div className="text-center py-10 text-neutral-500 text-xs space-y-2">
              <Bookmark className="w-8 h-8 mx-auto text-neutral-600 opacity-60" />
              <div>هنوز هیچ نسخه شاخصی ذخیره نشده است.</div>
              <p className="text-[11px] text-neutral-600">
                می‌توانید با دکمه بالا در هر مرحله از طراحی یک نقطه عطف (Checkpoint) ایجاد کنید.
              </p>
            </div>
          ) : (
            snapshots.map((snap) => (
              <div
                key={snap.id}
                className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800 hover:border-neutral-700 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Bookmark className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-200">{snap.title}</h4>
                    <div className="flex items-center gap-3 text-[10px] text-neutral-400 mt-1">
                      <span>{snap.timestamp}</span>
                      <span>•</span>
                      <span>{snap.elementsCount} عنصر خوشنویسی</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onRestoreSnapshot(snap);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>بازیابی این نسخه</span>
                  </button>
                  <button
                    onClick={() => onDeleteSnapshot(snap.id)}
                    className="p-2 rounded-xl bg-neutral-900 hover:bg-red-950/50 text-neutral-400 hover:text-red-300 border border-neutral-800 transition-all"
                    title="حذف نسخه"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
});

