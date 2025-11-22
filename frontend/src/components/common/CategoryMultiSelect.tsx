import { useState } from 'react';

interface Category {
  id: number;
  name: string;
  parent_id?: number | null;
  children?: Category[];
}

interface CategoryMultiSelectProps {
  categories: Category[];
  selectedIds: number[];
  onSelect: (categoryIds: number[]) => void;
  disabled?: boolean;
}

export function CategoryMultiSelect({
  categories,
  selectedIds,
  onSelect,
  disabled,
}: CategoryMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

  const buildTree = (cats: Category[]): Category[] => {
    const map = new Map<number, Category>();
    const roots: Category[] = [];

    cats.forEach((cat) => {
      map.set(cat.id, { ...cat, children: [] });
    });

    cats.forEach((cat) => {
      const node = map.get(cat.id)!;
      if (cat.parent_id && map.has(cat.parent_id)) {
        map.get(cat.parent_id)!.children!.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  const tree = buildTree(categories);

  const toggleNode = (id: number) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };

  const toggleSelection = (id: number) => {
    if (selectedIds.includes(id)) {
      onSelect(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      onSelect([...selectedIds, id]);
    }
  };

  const renderNode = (node: Category, level: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedIds.includes(node.id);

    return (
      <div key={node.id}>
        <div
          className={`flex items-center py-2 px-2 hover:bg-gray-100 ${
            isSelected ? 'bg-blue-50' : ''
          }`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.id);
              }}
              className="mr-2 text-gray-500 w-5 h-5 flex items-center justify-center"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          {!hasChildren && <div className="w-5 mr-2" />}

          <label className="flex items-center flex-1 cursor-pointer">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => !disabled && toggleSelection(node.id)}
              disabled={disabled}
              className="mr-2 h-4 w-4 text-blue-600 rounded border-gray-300"
            />
            <span className={isSelected ? 'font-medium text-blue-700' : ''}>
              {node.name}
            </span>
          </label>
        </div>
        {hasChildren && isExpanded && (
          <div>{node.children!.map((child) => renderNode(child, level + 1))}</div>
        )}
      </div>
    );
  };

  const getSelectedNames = (): string => {
    if (selectedIds.length === 0) return 'Изберете категории';
    const selectedCategories = categories.filter((c) => selectedIds.includes(c.id));
    if (selectedCategories.length <= 2) {
      return selectedCategories.map((c) => c.name).join(', ');
    }
    return `${selectedCategories.length} категории избрани`;
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Категории
      </label>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full px-3 py-2 border rounded text-left disabled:bg-gray-100 flex justify-between items-center"
      >
        <span className={selectedIds.length > 0 ? '' : 'text-gray-500'}>
          {getSelectedNames()}
        </span>
        <span className="text-gray-400">▼</span>
      </button>

      {/* Selected tags */}
      {selectedIds.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {categories
            .filter((c) => selectedIds.includes(c.id))
            .map((cat) => (
              <span
                key={cat.id}
                className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
              >
                {cat.name}
                {!disabled && (
                  <button
                    onClick={() => toggleSelection(cat.id)}
                    className="text-blue-600 hover:text-blue-800 font-bold"
                    type="button"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
        </div>
      )}

      {isOpen && !disabled && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute z-20 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-80 overflow-y-auto">
            <div className="p-2">
              <button
                onClick={() => {
                  onSelect([]);
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm text-gray-600"
              >
                Изчисти всички
              </button>
            </div>
            <div className="border-t">{tree.map((node) => renderNode(node))}</div>
          </div>
        </>
      )}
    </div>
  );
}
