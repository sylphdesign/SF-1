import React from 'react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function ContextMenu({ x, y, items, onClose }) {
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      // A small timeout allows other click events (like on a menu item) to fire first
      setTimeout(() => {
        onClose();
      }, 100);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      className="fixed bg-white border border-gray-200 shadow-2xl rounded-md z-[100] py-1.5 w-52"
      style={{ top: y, left: x }}
      onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      onContextMenu={(e) => e.preventDefault()} // Prevent another context menu
    >
      <div className="flex flex-col">
        {items.map((item, index) => {
          if (item.separator) {
            return <Separator key={`separator-${index}`} className="my-1.5" />;
          }
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => {
                item.action();
                onClose();
              }}
              disabled={item.disabled}
              className="flex items-center px-3 py-1.5 text-sm text-left text-gray-800 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent"
            >
              {Icon && <Icon className="w-4 h-4 mr-3" />}
              <span className="flex-1">{item.label}</span>
              {item.shortcut && <span className="text-xs text-gray-400">{item.shortcut}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}