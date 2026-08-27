import React, { useState } from 'react';
import { 
  Layers, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Trash2, 
  Copy, 
  ChevronUp, 
  ChevronDown, 
  FolderPlus, 
  FolderMinus, 
  Sparkles, 
  Type, 
  Stamp, 
  PenTool,
  Search,
  CheckSquare,
  Square,
  Edit2,
  GripVertical,
  Layers2,
  CheckCheck
} from 'lucide-react';
import { CanvasElement } from '../types/calligraphy';

interface LayersPanelProps {
  elements: CanvasElement[];
  selectedElementId: string | null;
  selectedMultiIds?: string[];
  onSelectElement: (id: string | null) => void;
  onSelectMultiElements?: (ids: string[]) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  onReorderElement?: (id: string, direction: 'up' | 'down') => void;
  onGroupElements?: (elementIds: string[]) => void;
  onUngroupElements?: (groupId: string) => void;
}

export const LayersPanel: React.FC<LayersPanelProps> = React.memo(({
  elements,
  selectedElementId,
  selectedMultiIds: externalMultiIds,
  onSelectElement,
  onSelectMultiElements,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onReorderElement,
  onGroupElements,
  onUngroupElements,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [internalMultiIds, setInternalMultiIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [draggedElementId, setDraggedElementId] = useState<string | null>(null);
  const [dragOverTargetId, setDragOverTargetId] = useState<string | null>(null);

  const selectedMultiIds = externalMultiIds ?? internalMultiIds;
  const updateMultiIds = (newIds: string[]) => {
    if (onSelectMultiElements) {
      onSelectMultiElements(newIds);
    } else {
      setInternalMultiIds(newIds);
    }
  };

  const sortedElements = [...elements].sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));

  const filteredElements = sortedElements.filter(el => {
    if (!searchTerm) return true;
    const nameMatch = el.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const textMatch = el.text?.toLowerCase().includes(searchTerm.toLowerCase());
    return nameMatch || textMatch;
  });

  const toggleMultiSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = selectedMultiIds.includes(id) 
      ? selectedMultiIds.filter(x => x !== id) 
      : [...selectedMultiIds, id];
    updateMultiIds(updated);
  };

  const handleSelectAll = () => {
    if (selectedMultiIds.length === elements.length) {
      updateMultiIds([]);
    } else {
      updateMultiIds(elements.map(e => e.id));
    }
  };

  const handleStartRename = (el: CanvasElement, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(el.id);
    setEditName(el.name || el.text || 'لایه');
  };

  const handleSaveRename = (id: string) => {
    if (editName.trim()) {
      onUpdateElement(id, { name: editName.trim() });
    }
    setEditingId(null);
  };

  // Drag and drop layer reordering
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedElementId(id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedElementId && draggedElementId !== id) {
      setDragOverTargetId(id);
    }
  };

  const handleDragLeave = () => {
    setDragOverTargetId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDragOverTargetId(null);
    const sourceId = draggedElementId || e.dataTransfer.getData('text/plain');
    if (!sourceId || sourceId === targetId) return;

    const sourceEl = elements.find(el => el.id === sourceId);
    const targetEl = elements.find(el => el.id === targetId);
    if (!sourceEl || !targetEl) return;

    // Swap or insert Z-index
    const sourceZ = sourceEl.zIndex || 1;
    const targetZ = targetEl.zIndex || 1;

    onUpdateElement(sourceId, { zIndex: targetZ });
    onUpdateElement(targetId, { zIndex: sourceZ });
    setDraggedElementId(null);
  };

  const getElementIcon = (el: CanvasElement) => {
    if (el.type === 'tazhib') return <Sparkles className="w-3.5 h-3.5 text-amber-400" />;
    if (el.type === 'seal') return <Stamp className="w-3.5 h-3.5 text-red-400" />;
    if (el.type === 'stroke') return <PenTool className="w-3.5 h-3.5 text-blue-400" />;
    return <Type className="w-3.5 h-3.5 text-neutral-300" />;
  };

  const getElementTitle = (el: CanvasElement) => {
    if (el.name) return el.name;
    if (el.text) return el.text.length > 22 ? `${el.text.slice(0, 22)}...` : el.text;
    if (el.type === 'tazhib') return `تذهیب (${el.tazhibName || 'اسلیمی'})`;
    if (el.type === 'seal') return 'مهر و امضا';
    if (el.type === 'stroke') return 'قلم‌ضربه آزاد';
    return 'لایه خوشنویسی';
  };

  // Find unique groups
  const activeGroups = Array.from(new Set(elements.map(e => e.groupId).filter(Boolean))) as string[];

  return (
    <div className="w-full bg-neutral-900/95 border border-neutral-800 rounded-2xl overflow-hidden flex flex-col font-vazir select-none shadow-xl">
      {/* Header Bar */}
      <div className="p-3 px-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-neutral-200">مدیریت لایه‌ها ({elements.length})</span>
        </div>

        {/* Group / Ungroup / Batch buttons */}
        <div className="flex items-center gap-1.5">
          {selectedMultiIds.length > 1 && onGroupElements && (
            <button
              onClick={() => {
                onGroupElements(selectedMultiIds);
                updateMultiIds([]);
              }}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold hover:bg-amber-500/30 transition-all active:scale-95"
              title="گروه‌بندی لایه‌های انتخاب‌شده"
            >
              <FolderPlus className="w-3 h-3" />
              <span>گروه ({selectedMultiIds.length})</span>
            </button>
          )}

          <button
            onClick={handleSelectAll}
            className={`p-1.5 rounded-lg border text-[10px] flex items-center gap-1 transition-all ${
              selectedMultiIds.length === elements.length && elements.length > 0
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-neutral-200'
            }`}
            title="انتخاب همه لایه‌ها"
          >
            <CheckCheck className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Active Groups Overview */}
      {activeGroups.length > 0 && onUngroupElements && (
        <div className="p-2 border-b border-neutral-800/80 bg-neutral-950/40 flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-neutral-400 font-bold">گروه‌های فعال:</span>
          {activeGroups.map((grpId, idx) => {
            const count = elements.filter(e => e.groupId === grpId).length;
            return (
              <div 
                key={grpId}
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-300"
              >
                <Layers2 className="w-3 h-3" />
                <span>گروه {idx + 1} ({count})</span>
                <button
                  onClick={() => onUngroupElements(grpId)}
                  className="hover:text-red-400 transition-colors mr-1"
                  title="انحلال گروه"
                >
                  <FolderMinus className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Search & Filter */}
      <div className="p-2 border-b border-neutral-800/80 bg-neutral-950/20">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute right-2.5 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="جستجوی لایه بر اساس متن یا نام..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-8 pl-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-200 focus:border-amber-500/70 outline-none transition-all placeholder:text-neutral-600"
          />
        </div>
      </div>

      {/* Layers List (Drag & Drop Reorderable) */}
      <div className="max-h-72 overflow-y-auto p-1.5 space-y-1">
        {filteredElements.length === 0 ? (
          <div className="text-center py-6 text-neutral-500 text-xs">
            لایه‌ای یافت نشد
          </div>
        ) : (
          filteredElements.map((el) => {
            const isSelected = selectedElementId === el.id;
            const isMultiSelected = selectedMultiIds.includes(el.id);
            const isHidden = el.isVisible === false;
            const isDragOver = dragOverTargetId === el.id;

            return (
              <div
                key={el.id}
                draggable
                onDragStart={(e) => handleDragStart(e, el.id)}
                onDragOver={(e) => handleDragOver(e, el.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, el.id)}
                onClick={() => onSelectElement(el.id)}
                className={`group p-2 rounded-xl border flex items-center justify-between gap-2 transition-all cursor-pointer ${
                  isDragOver 
                    ? 'border-amber-400 bg-amber-500/20 scale-[1.01]' 
                    : isSelected
                    ? 'bg-amber-500/15 border-amber-500/60 text-amber-200 shadow-sm'
                    : isMultiSelected
                    ? 'bg-neutral-800 border-amber-500/30 text-amber-300'
                    : 'bg-neutral-850/70 hover:bg-neutral-800 border-neutral-800/80 text-neutral-300'
                } ${isHidden ? 'opacity-40' : ''}`}
              >
                {/* Drag Handle & Multi-Select Checkbox */}
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <div className="cursor-grab active:cursor-grabbing text-neutral-600 group-hover:text-neutral-400 shrink-0">
                    <GripVertical className="w-3.5 h-3.5" />
                  </div>

                  <button
                    onClick={(e) => toggleMultiSelect(el.id, e)}
                    className="text-neutral-500 hover:text-amber-400 transition-colors shrink-0"
                    title="انتخاب همزمان"
                  >
                    {isMultiSelected ? (
                      <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Square className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <div className="w-6 h-6 rounded-lg bg-neutral-900 flex items-center justify-center border border-neutral-700/60 shrink-0 relative">
                    {getElementIcon(el)}
                    {el.groupId && (
                      <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border border-neutral-950" title="عضو گروه" />
                    )}
                  </div>

                  {/* Title / Renaming input */}
                  {editingId === el.id ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={() => handleSaveRename(el.id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(el.id)}
                      autoFocus
                      className="px-1.5 py-0.5 rounded bg-neutral-950 border border-amber-500 text-xs text-neutral-100 outline-none w-full"
                    />
                  ) : (
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <span className="text-xs truncate font-medium">{getElementTitle(el)}</span>
                      <button
                        onClick={(e) => handleStartRename(el, e)}
                        className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-neutral-300 transition-opacity shrink-0"
                        title="تغییر نام لایه"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Layer Control Buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* Visibility */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateElement(el.id, { isVisible: el.isVisible === false ? true : false });
                    }}
                    className="p-1 rounded-lg hover:bg-neutral-750 text-neutral-400 hover:text-neutral-200 transition-colors"
                    title={isHidden ? 'نمایش لایه' : 'مخفی‌سازی لایه'}
                  >
                    {isHidden ? <EyeOff className="w-3.5 h-3.5 text-red-400" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>

                  {/* Lock */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateElement(el.id, { isLocked: !el.isLocked });
                    }}
                    className="p-1 rounded-lg hover:bg-neutral-750 text-neutral-400 hover:text-neutral-200 transition-colors"
                    title={el.isLocked ? 'باز کردن قفل لایه' : 'قفل کردن لایه'}
                  >
                    {el.isLocked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5" />}
                  </button>

                  {/* Reorder Up / Down */}
                  {onReorderElement && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onReorderElement(el.id, 'up');
                        }}
                        className="p-1 rounded-lg hover:bg-neutral-750 text-neutral-400 hover:text-neutral-200 transition-colors"
                        title="انتقال به بالا (Z-Index)"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onReorderElement(el.id, 'down');
                        }}
                        className="p-1 rounded-lg hover:bg-neutral-750 text-neutral-400 hover:text-neutral-200 transition-colors"
                        title="انتقال به پایین (Z-Index)"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  {/* Duplicate */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicateElement(el.id);
                    }}
                    className="p-1 rounded-lg hover:bg-neutral-750 text-neutral-400 hover:text-neutral-200 transition-colors"
                    title="تکثیر لایه (Duplicate)"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteElement(el.id);
                    }}
                    className="p-1 rounded-lg hover:bg-red-950/60 text-neutral-400 hover:text-red-400 transition-colors"
                    title="حذف لایه"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
});
