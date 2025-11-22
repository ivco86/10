import { useState } from 'react';

interface Category {
  id: number;
  name: string;
  parent_id?: number | null;
  children?: Category[];
}

interface CategoryTreeSelectProps {
  categories: Category[];
  selectedId?: number | null;
  onSelect: (categoryId: number | null) => void;
  disabled?: boolean;
}

export function CategoryTreeSelect({ categories, selectedId, onSelect, disabled }: CategoryTreeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

  const buildTree = (cats: Category[]): Category[] => {
    const map = new Map<number, Category>();
    const roots: Category[] = [];

    // Create map
    cats.forEach(cat => {
      map.set(cat.id, { ...cat, children: [] });
    });

    // Build tree
    cats.forEach(cat => {
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

  const renderNode = (node: Category, level: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedId === node.id;

    return (
      <div key={node.id}>
        <div
          className={`flex items-center py-2 px-2 hover:bg-gray-100 cursor-pointer ${
            isSelected ? 'bg-blue-50 text-blue-700 font-medium' : ''
          }`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.id);
              }}
              className="mr-2 text-gray-500"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          <span
            onClick={() => !disabled && onSelect(node.id)}
            className="flex-1"
          >
            {node.name}
          </span>
        </div>
        {hasChildren && isExpanded && (
          <div>
            {node.children!.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const selectedCategory = categories.find(c => c.id === selectedId);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full px-3 py-2 border rounded text-left disabled:bg-gray-100 flex justify-between items-center"
      >
        <span className={selectedCategory ? '' : 'text-gray-500'}>
          {selectedCategory ? selectedCategory.name : 'Select category'}
        </span>
        <span className="text-gray-400">▼</span>
      </button>

      {isOpen && !disabled && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <div
              className="py-2 px-3 hover:bg-gray-100 cursor-pointer text-gray-600"
              onClick={() => {
                onSelect(null);
                setIsOpen(false);
              }}
            >
              No category
            </div>
            {tree.map(node => renderNode(node))}
          </div>
        </>
      )}
    </div>
  );
}
