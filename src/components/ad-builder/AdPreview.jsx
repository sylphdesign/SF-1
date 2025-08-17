
import React, { useRef, useState, useCallback, useEffect, useImperativeHandle, useMemo } from 'react';
import { Move, RotateCw } from 'lucide-react';
import ContextMenu from './ContextMenu';
import {
  BringToFront,
  SendToBack,
  ChevronUp,
  ChevronDown,
  Copy,
  ClipboardPaste,
  Trash2,
  Group,
  Ungroup
} from 'lucide-react';

const ControlHandle = ({ type, position, onMouseDown, cursor = 'pointer' }) => {
  const handleStyle = {
    position: 'absolute',
    width: '8px',
    height: '8px',
    backgroundColor: '#3b82f6',
    border: '2px solid white',
    borderRadius: '50%',
    cursor,
    zIndex: 1002,
    ...position
  };

  if (type === 'rotate') {
    return (
      <div
        style={{
          position: 'absolute',
          ...position,
          cursor: 'grab',
          zIndex: 1002
        }}
        onMouseDown={onMouseDown}
      >
        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-700 transition-colors">
          <RotateCw className="w-3 h-3" />
        </div>
      </div>
    );
  }

  if (type === 'move') {
    return (
      <div
        style={{
          position: 'absolute',
          ...position,
          cursor: 'move',
          zIndex: 1002
        }}
        onMouseDown={onMouseDown}
      >
        <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-gray-700 transition-colors">
          <Move className="w-3 h-3" />
        </div>
      </div>
    );
  }

  return <div style={handleStyle} onMouseDown={onMouseDown} />;
};

const DraggableElement = React.forwardRef(({ layer, isSelected, onSelect, onUpdate, onDragStart, zoomLevel, containerRef, onContextMenu }, ref) => {
  const [dragState, setDragState] = useState({
    isDragging: false,
    isResizing: false,
    isRotating: false,
    dragType: null,
    startPos: { x: 0, y: 0 },
    startElement: { x: 0, y: 0, width: 0, height: 0, rotation: 0 }
  });
  
  const elementRef = useRef(null);

  const _handleMouseDownInternal = useCallback((e, dragType = 'move') => {
    // If the layer is locked, prevent any interaction via handles or direct click.
    if (layer.isLocked) {
      e.stopPropagation();
      e.preventDefault();
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    
    // Only call onDragStart for 'move' type
    if (dragType === 'move') {
      onDragStart(e, layer.id); // Notify parent about potential drag start
    }
    
    // Select the layer (even for resize/rotate, ensure it's selected)
    onSelect([layer.id], e.shiftKey); 

    const containerRect = containerRef.current.getBoundingClientRect();
    const startPos = {
      x: (e.clientX - containerRect.left) / zoomLevel,
      y: (e.clientY - containerRect.top) / zoomLevel
    };

    setDragState({
      isDragging: dragType === 'move',
      isResizing: dragType.startsWith('resize'),
      isRotating: dragType === 'rotate',
      dragType,
      startPos,
      startElement: {
        x: layer.x,
        y: layer.y,
        width: layer.width || (layer.radius ? layer.radius * 2 : 100),
        height: layer.height || (layer.radius ? layer.radius * 2 : 50),
        rotation: layer.rotation || 0
      }
    });
  }, [layer, onSelect, onDragStart, zoomLevel, containerRef]);

  // Expose internal handleMouseDown for parent to trigger resize/rotate
  useImperativeHandle(ref, () => ({
    startInteraction: _handleMouseDownInternal
  }));
  
  const handleMouseMove = useCallback((e) => {
    if (!dragState.isResizing && !dragState.isRotating) {
        return; // Move logic is handled by parent
    }
    
    e.preventDefault();
    const containerRect = containerRef.current.getBoundingClientRect();
    const currentPos = {
      x: (e.clientX - containerRect.left) / zoomLevel,
      y: (e.clientY - containerRect.top) / zoomLevel
    };

    const deltaX = currentPos.x - dragState.startPos.x;
    const deltaY = currentPos.y - dragState.startPos.y;

    if (dragState.isResizing) {
      const { dragType, startElement } = dragState;
      const updates = {};

      if (dragType.includes('right')) {
        updates.width = Math.max(20, startElement.width + deltaX);
      }
      if (dragType.includes('left')) {
        updates.width = Math.max(20, startElement.width - deltaX);
        updates.x = startElement.x + deltaX;
      }
      if (dragType.includes('bottom')) {
        if (layer.type === 'circle') {
          const newRadius = Math.max(10, startElement.height / 2 + deltaY / 2);
          updates.radius = newRadius;
        } else {
          updates.height = Math.max(20, startElement.height + deltaY);
        }
      }
      if (dragType.includes('top')) {
        if (layer.type === 'circle') {
          const newRadius = Math.max(10, startElement.height / 2 - deltaY / 2);
          updates.radius = newRadius;
          updates.y = startElement.y + deltaY / 2;
        } else {
          updates.height = Math.max(20, startElement.height - deltaY);
          updates.y = startElement.y + deltaY;
        }
      }

      onUpdate(layer.id, updates, null);
    } else if (dragState.isRotating) {
      const centerX = dragState.startElement.x + dragState.startElement.width / 2;
      const centerY = dragState.startElement.y + dragState.startElement.height / 2;
      const angle = Math.atan2(currentPos.y - centerY, currentPos.x - centerX);
      const rotation = (angle * 180) / Math.PI + 90;
      onUpdate(layer.id, { rotation }, null);
    }
  }, [dragState, layer, onUpdate, zoomLevel, containerRef]);

  const handleMouseUp = useCallback(() => {
    setDragState({ isDragging: false, isResizing: false, isRotating: false, dragType: null, startPos: { x: 0, y: 0 }, startElement: { x: 0, y: 0, width: 0, height: 0, rotation: 0 } });
  }, []);

  useEffect(() => {
    // Only listen for internal resize/rotate events
    if (dragState.isResizing || dragState.isRotating) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState.isResizing, dragState.isRotating, handleMouseMove, handleMouseUp]);

  const elementWidth = layer.width || (layer.radius ? layer.radius * 2 : 100);
  const elementHeight = layer.height || (layer.radius ? layer.radius * 2 : 50);

  const baseStyle = {
    position: 'absolute',
    left: `${layer.x}px`,
    top: `${layer.y}px`,
    width: `${elementWidth}px`,
    height: `${elementHeight}px`,
    cursor: layer.isLocked ? 'default' : 'grab', // Change cursor if locked
    userSelect: 'none',
    zIndex: isSelected ? 1000 : layer.zIndex, // Use passed zIndex, but elevate if selected
    transform: layer.rotation ? `rotate(${layer.rotation}deg)` : 'none',
    visibility: layer.isVisible === false ? 'hidden' : 'visible',
    pointerEvents: layer.isLocked ? 'none' : 'auto', // Disable pointer events if locked
  };

  const renderElement = () => {
    switch (layer.type) {
      case 'group':
        return (
          <div
            ref={elementRef}
            style={baseStyle}
            onMouseDown={(e) => _handleMouseDownInternal(e, 'move')}
            onContextMenu={(e) => onContextMenu(e, layer.id)}
          >
            {layer.layers && layer.layers.map(child => (
              <div
                key={child.id}
                style={{
                  position: 'absolute',
                  left: `${child.x}px`,
                  top: `${child.y}px`,
                  width: `${child.width || child.radius * 2 || 100}px`,
                  height: `${child.height || child.radius * 2 || 50}px`,
                  transform: `rotate(${child.rotation || 0}deg)`,
                  overflow: 'hidden'
                }}
              >
                {child.type === 'text' && (
                  <div style={{color: child.fill, fontSize: `${child.fontSize}px`, fontFamily: child.fontFamily, fontWeight: child.fontWeight, textAlign: child.textAlign, lineHeight: 1.2 }}>{child.text}</div>
                )}
                {child.type === 'image' && (
                  <img src={child.src} style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: `${child.borderRadius || 0}px`}} alt={child.name}/>
                )}
                {child.type === 'rect' && (
                  <div style={{width: '100%', height: '100%', backgroundColor: child.fill, borderRadius: `${child.borderRadius || 0}px`, boxShadow: child.boxShadow}}></div>
                )}
                {child.type === 'circle' && (
                  <div style={{width: `${child.radius*2}px`, height: `${child.radius*2}px`, backgroundColor: child.fill, borderRadius: '50%'}}></div>
                )}
              </div>
            ))}
          </div>
        );
      case 'text':
        return (
          <div
            ref={elementRef}
            style={{
              ...baseStyle,
              color: layer.fill,
              fontSize: `${layer.fontSize}px`,
              fontFamily: layer.fontFamily,
              fontWeight: layer.fontWeight,
              textAlign: layer.textAlign,
              lineHeight: 1.2,
              padding: '4px',
              minWidth: '20px',
              minHeight: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: layer.textAlign === 'center' ? 'center' : layer.textAlign === 'right' ? 'flex-end' : 'flex-start',
            }}
            onMouseDown={(e) => _handleMouseDownInternal(e, 'move')}
            onContextMenu={(e) => onContextMenu(e, layer.id)}
          >
            {layer.text || 'Text'}
          </div>
        );
      case 'image':
        return (
          <img
            ref={elementRef}
            src={layer.src}
            alt={layer.name}
            style={{ 
              ...baseStyle, 
              objectFit: 'cover',
              borderRadius: `${layer.borderRadius || 0}px`,
            }}
            onMouseDown={(e) => _handleMouseDownInternal(e, 'move')}
            onContextMenu={(e) => onContextMenu(e, layer.id)}
            draggable={false}
          />
        );
      case 'rect':
        return (
          <div
            ref={elementRef}
            style={{
              ...baseStyle,
              backgroundColor: layer.fill,
              borderRadius: `${layer.borderRadius || 0}px`,
              boxShadow: layer.boxShadow,
            }}
            onMouseDown={(e) => _handleMouseDownInternal(e, 'move')}
            onContextMenu={(e) => onContextMenu(e, layer.id)}
          />
        );
      case 'circle':
        return (
          <div
            ref={elementRef}
            style={{
              ...baseStyle,
              backgroundColor: layer.fill,
              borderRadius: '50%',
              width: `${layer.radius * 2}px`,
              height: `${layer.radius * 2}px`,
            }}
            onMouseDown={(e) => _handleMouseDownInternal(e, 'move')}
            onContextMenu={(e) => onContextMenu(e, layer.id)}
          />
        );
      default:
        return null;
    }
  };

  return renderElement();
});

DraggableElement.displayName = 'DraggableElement';

const AdPreview = React.forwardRef(({ design, selectedLayerIds, onLayerSelect, onLayerUpdate, onUpdateMultipleLayers, onLayerOrderChange, onCopy, onPaste, onDelete, onGroup, onUngroup, clipboard, zoomLevel }, ref) => {
  const containerRef = useRef(null);
  const draggableElementRefs = useRef({});
  const [contextMenu, setContextMenu] = useState(null);
  const [marqueeRect, setMarqueeRect] = useState(null);
  const [isMarqueeing, setIsMarqueeing] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [snapLines, setSnapLines] = useState([]);
  const [dragState, setDragState] = useState({ isDragging: false, startPositions: {}, startMouse: {x: 0, y: 0} });
  const { frame, layers } = design;

  const findLayer = useCallback((layersToSearch, layerId) => {
      for (const layer of layersToSearch) {
          if (layer.id === layerId) return layer;
          if (layer.type === 'group' && layer.layers) {
              const found = findLayer(layer.layers, layerId);
              if (found) return found;
          }
      }
      return null;
  }, []);

  const handleContextMenu = useCallback((e, layerId) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (layerId && !selectedLayerIds.includes(layerId)) {
      onLayerSelect([layerId], false);
    }
    
    const containerRect = containerRef.current.getBoundingClientRect();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      layerId: layerId || selectedLayerIds[0],
      pastePosition: {
        x: (e.clientX - containerRect.left) / zoomLevel,
        y: (e.clientY - containerRect.top) / zoomLevel
      },
    });
  }, [selectedLayerIds, onLayerSelect, zoomLevel]);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  useEffect(() => {
    const handleClickOutside = () => closeContextMenu();
    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu, closeContextMenu]);

  const handleDragStart = useCallback((e, clickedLayerId) => {
    const clickedLayer = findLayer(layers, clickedLayerId);
    if (clickedLayer && clickedLayer.isLocked) { // Prevent drag if layer is locked
      e.stopPropagation();
      e.preventDefault();
      return;
    }

    if (selectedLayerIds.length === 0 || !selectedLayerIds.includes(clickedLayerId)) {
      onLayerSelect([clickedLayerId], false);
    }
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const currentSelectedIds = selectedLayerIds.includes(clickedLayerId) ? selectedLayerIds : [clickedLayerId];
    
    const startPositions = {};
    currentSelectedIds.forEach(id => {
      const layer = findLayer(layers, id);
      if (layer) startPositions[id] = { x: layer.x, y: layer.y };
    });

    setDragState({
      isDragging: true,
      startPositions,
      startMouse: {
        x: (e.clientX - containerRect.left) / zoomLevel,
        y: (e.clientY - containerRect.top) / zoomLevel,
      },
    });
  }, [selectedLayerIds, layers, zoomLevel, findLayer, onLayerSelect]);

  const handleMouseDownOnCanvas = useCallback((e) => {
      if (e.target !== e.currentTarget) return; 
      e.preventDefault();
      closeContextMenu();

      const containerRect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - containerRect.left) / zoomLevel;
      const y = (e.clientY - containerRect.top) / zoomLevel;
      
      setStartPoint({ x, y });
      setIsMarqueeing(true);
      setMarqueeRect({ x, y, width: 0, height: 0 });

      if (!e.shiftKey) {
        onLayerSelect([], false); 
      }
  }, [closeContextMenu, onLayerSelect, zoomLevel]);

  const selectionBox = useMemo(() => {
    if (selectedLayerIds.length <= 1) return null; // Keep existing logic for multi-selection UI

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    selectedLayerIds.forEach(id => {
        const layer = findLayer(layers, id);
        // Exclude locked layers from the selection box for drag calculations if they're not part of active drag
        // This heuristic might need adjustment based on UX. For now, assume selection box is for all selected layers.
        if (layer) {
            // Use same default dimensions as DraggableElement for consistency
            const w = layer.width || (layer.radius ? layer.radius * 2 : 100); 
            const h = layer.height || (layer.radius ? layer.radius * 2 : 50);
            minX = Math.min(minX, layer.x);
            minY = Math.min(minY, layer.y);
            maxX = Math.max(maxX, layer.x + w);
            maxY = Math.max(maxY, layer.y + h);
        }
    });
    if (minX === Infinity) return null; // No valid selected layers found
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }, [selectedLayerIds, layers, findLayer]);

  const handleMouseMove = useCallback((e) => {
    const containerRefCurrent = containerRef.current;
    if (!containerRefCurrent) return;

    const containerRect = containerRefCurrent.getBoundingClientRect();
    const currentX = (e.clientX - containerRect.left) / zoomLevel;
    const currentY = (e.clientY - containerRect.top) / zoomLevel;
    
    if (isMarqueeing) {
      e.preventDefault();
      setMarqueeRect({
          x: Math.min(startPoint.x, currentX),
          y: Math.min(startPoint.y, currentY),
          width: Math.abs(currentX - startPoint.x),
          height: Math.abs(currentY - startPoint.y),
      });
      setSnapLines([]);
    } else if (dragState.isDragging) {
      e.preventDefault();
      
      const selectionBoxForDrag = selectionBox || (selectedLayerIds.length === 1 ? (() => {
        const layer = findLayer(layers, selectedLayerIds[0]);
        if (!layer || layer.isLocked) return null; // If single selected layer is locked, don't drag
        // Use same default dimensions as DraggableElement for consistency
        const w = layer.width || (layer.radius ? layer.radius * 2 : 100); 
        const h = layer.height || (layer.radius ? layer.radius * 2 : 50);
        return { x: layer.x, y: layer.y, width: w, height: h };
      })() : null);

      if (!selectionBoxForDrag) return;

      const rawDeltaX = currentX - dragState.startMouse.x;
      const rawDeltaY = currentY - dragState.startMouse.y;
      
      let snapDeltaX = rawDeltaX;
      let snapDeltaY = rawDeltaY;
      
      const newSnapLines = [];
      const snapThreshold = 5 / zoomLevel;

      const draggedBounds = {
        left: selectionBoxForDrag.x + rawDeltaX,
        hCenter: selectionBoxForDrag.x + selectionBoxForDrag.width / 2 + rawDeltaX,
        right: selectionBoxForDrag.x + selectionBoxForDrag.width + rawDeltaX,
        top: selectionBoxForDrag.y + rawDeltaY,
        vCenter: selectionBoxForDrag.y + selectionBoxForDrag.height / 2 + rawDeltaY,
        bottom: selectionBoxForDrag.y + selectionBoxForDrag.height + rawDeltaY
      };

      const otherLayers = layers.filter(l => !selectedLayerIds.includes(l.id));

      otherLayers.forEach(otherLayer => {
        // Exclude locked layers from snapping targets or dragging if they're not selected/movable
        if (otherLayer.isLocked) return; 

        // Use same default dimensions for other layers for consistency
        const w = otherLayer.width || (otherLayer.radius ? otherLayer.radius * 2 : 100);
        const h = otherLayer.height || (otherLayer.radius ? otherLayer.radius * 2 : 50);
        const otherBounds = {
          left: otherLayer.x,
          hCenter: otherLayer.x + w / 2,
          right: otherLayer.x + w,
          top: otherLayer.y,
          vCenter: otherLayer.y + h / 2,
          bottom: otherLayer.y + h
        };
        
        // Horizontal Snapping (v-lines)
        if (Math.abs(draggedBounds.left - otherBounds.left) < snapThreshold) { snapDeltaX = otherBounds.left - selectionBoxForDrag.x; newSnapLines.push({ type: 'v', x: otherBounds.left }); }
        else if (Math.abs(draggedBounds.right - otherBounds.right) < snapThreshold) { snapDeltaX = otherBounds.right - (selectionBoxForDrag.x + selectionBoxForDrag.width); newSnapLines.push({ type: 'v', x: otherBounds.right }); }
        else if (Math.abs(draggedBounds.hCenter - otherBounds.hCenter) < snapThreshold) { snapDeltaX = otherBounds.hCenter - (selectionBoxForDrag.x + selectionBoxForDrag.width / 2); newSnapLines.push({ type: 'v', x: otherBounds.hCenter }); }
        else if (Math.abs(draggedBounds.left - otherBounds.right) < snapThreshold) { snapDeltaX = otherBounds.right - selectionBoxForDrag.x; newSnapLines.push({ type: 'v', x: otherBounds.right }); }
        else if (Math.abs(draggedBounds.right - otherBounds.left) < snapThreshold) { snapDeltaX = otherBounds.left - (selectionBoxForDrag.x + selectionBoxForDrag.width); newSnapLines.push({ type: 'v', x: otherBounds.left }); }
        
        // Vertical Snapping (h-lines)
        if (Math.abs(draggedBounds.top - otherBounds.top) < snapThreshold) { snapDeltaY = otherBounds.top - selectionBoxForDrag.y; newSnapLines.push({ type: 'h', y: otherBounds.top }); }
        else if (Math.abs(draggedBounds.bottom - otherBounds.bottom) < snapThreshold) { snapDeltaY = otherBounds.bottom - (selectionBoxForDrag.y + selectionBoxForDrag.height); newSnapLines.push({ type: 'h', y: otherBounds.bottom }); }
        else if (Math.abs(draggedBounds.vCenter - otherBounds.vCenter) < snapThreshold) { snapDeltaY = otherBounds.vCenter - (selectionBoxForDrag.y + selectionBoxForDrag.height / 2); newSnapLines.push({ type: 'h', y: otherBounds.vCenter }); }
        else if (Math.abs(draggedBounds.top - otherBounds.bottom) < snapThreshold) { snapDeltaY = otherBounds.bottom - selectionBoxForDrag.y; newSnapLines.push({ type: 'h', y: otherBounds.bottom }); }
        else if (Math.abs(draggedBounds.bottom - otherBounds.top) < snapThreshold) { snapDeltaY = otherBounds.top - (selectionBoxForDrag.y + selectionBoxForDrag.height); newSnapLines.push({ type: 'h', y: otherBounds.top }); }
      });

      setSnapLines(newSnapLines);
      
      const updates = Object.keys(dragState.startPositions).map(id => ({
        id,
        updates: {
          x: dragState.startPositions[id].x + snapDeltaX,
          y: dragState.startPositions[id].y + snapDeltaY,
        },
      })).filter(update => { // Only update non-locked layers
        const layer = findLayer(layers, update.id);
        return layer && !layer.isLocked;
      });
      onUpdateMultipleLayers(updates);
    }
  }, [isMarqueeing, startPoint, zoomLevel, dragState, onUpdateMultipleLayers, setSnapLines, layers, selectedLayerIds, selectionBox, findLayer]);

  const handleMouseUp = useCallback((e) => {
    if (isMarqueeing) {
      setIsMarqueeing(false);
      const selectedIds = layers.filter(layer => {
          // Exclude locked layers from marquee selection? This depends on UX choice.
          // For now, include them but note they cannot be dragged.
          const layerWidth = layer.width || (layer.radius ? layer.radius * 2 : 100);
          const layerHeight = layer.height || (layer.radius ? layer.radius * 2 : 50);
          const layerRect = { x: layer.x, y: layer.y, width: layerWidth, height: layerHeight };
          return marqueeRect &&
              marqueeRect.x < layerRect.x + layerRect.width &&
              marqueeRect.x + marqueeRect.width > layerRect.x &&
              marqueeRect.y < layerRect.y + layerRect.height &&
              marqueeRect.y + marqueeRect.height > layerRect.y;
      }).map(layer => layer.id);
      onLayerSelect(selectedIds, e.shiftKey);
      setMarqueeRect(null);
    }
    if (dragState.isDragging) {
      setDragState({ isDragging: false, startPositions: {}, startMouse: {x: 0, y: 0} });
    }
    setSnapLines([]);
  }, [isMarqueeing, marqueeRect, layers, onLayerSelect, dragState.isDragging, setSnapLines]);

  useEffect(() => {
    if (dragState.isDragging || isMarqueeing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState.isDragging, isMarqueeing, handleMouseMove, handleMouseUp]);

  const canvasStyle = {
    width: `${frame.width}px`,
    height: `${frame.height}px`,
    backgroundColor: frame.backgroundColor,
    position: 'relative',
    overflow: 'visible',
    transform: `scale(${zoomLevel})`,
    transformOrigin: 'top left',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    cursor: dragState.isDragging ? 'grabbing' : 'default',
  };
  
  const rightClickedLayer = findLayer(layers, contextMenu?.layerId);
  const contextMenuItems = contextMenu ? [
    selectedLayerIds.length > 1 && { label: 'Group', icon: Group, action: onGroup, shortcut: '⌘G' },
    selectedLayerIds.length === 1 && rightClickedLayer?.type === 'group' && { label: 'Ungroup', icon: Ungroup, action: onUngroup, shortcut: '⇧⌘G' },
    (selectedLayerIds.length > 1 || (selectedLayerIds.length === 1 && rightClickedLayer?.type === 'group')) && { separator: true },
    contextMenu.layerId && { label: 'Bring to Front', icon: BringToFront, action: () => onLayerOrderChange(contextMenu.layerId, 'front') },
    contextMenu.layerId && { label: 'Send to Back', icon: SendToBack, action: () => onLayerOrderChange(contextMenu.layerId, 'back') },
    contextMenu.layerId && { label: 'Bring Forward', icon: ChevronUp, action: () => onLayerOrderChange(contextMenu.layerId, 'forward') },
    contextMenu.layerId && { label: 'Send Backward', icon: ChevronDown, action: () => onLayerOrderChange(contextMenu.layerId, 'backward') },
    { separator: true },
    { label: 'Copy', icon: Copy, action: onCopy, shortcut: '⌘C' },
    { label: 'Paste', icon: ClipboardPaste, action: () => onPaste(contextMenu.pastePosition), disabled: !clipboard, shortcut: '⌘V' },
    { separator: true },
    { label: 'Delete', icon: Trash2, action: onDelete, shortcut: 'Del' },
  ].filter(Boolean) : [];

  return (
    <div ref={ref} className="relative inline-block">
      <div
        ref={containerRef}
        className="ad-canvas relative"
        style={canvasStyle}
        onMouseDown={handleMouseDownOnCanvas}
        onContextMenu={handleContextMenu}
      >
        {layers.map((layer, index) => layer.isVisible !== false && (
          <DraggableElement
            key={layer.id}
            ref={el => (draggableElementRefs.current[layer.id] = el)}
            layer={{...layer, zIndex: index}} // Pass index for z-index
            isSelected={selectedLayerIds.includes(layer.id)}
            onSelect={onLayerSelect}
            onDragStart={handleDragStart}
            onUpdate={onLayerUpdate}
            zoomLevel={zoomLevel}
            containerRef={containerRef}
            onContextMenu={handleContextMenu}
          />
        ))}

        {/* Render single selection box and handles */}
        {selectedLayerIds.length === 1 && (() => {
          const layer = findLayer(layers, selectedLayerIds[0]);
          if (!layer || layer.isLocked) return null; // Do not render handles or selection border if layer is locked
          const elementWidth = layer.width || (layer.radius ? layer.radius * 2 : 100);
          const elementHeight = layer.height || (layer.radius ? layer.radius * 2 : 50);

          const startElementInteraction = draggableElementRefs.current[layer.id]?.startInteraction;

          return (
            <>
             <div
                key="single-selection-border"
                style={{
                  position: 'absolute',
                  left: `${layer.x - 2}px`,
                  top: `${layer.y - 2}px`,
                  width: `${elementWidth + 4}px`,
                  height: `${elementHeight + 4}px`,
                  border: '2px solid #3b82f6',
                  borderRadius: layer.type === 'circle' ? '50%' : `${(layer.borderRadius || 0) + 2}px`,
                  pointerEvents: 'none',
                  zIndex: 999,
                  transform: layer.rotation ? `rotate(${layer.rotation}deg)` : 'none',
                }}
             />
            <ControlHandle type="move" position={{ left: `${layer.x + elementWidth / 2 - 12}px`, top: `${layer.y + elementHeight / 2 - 12}px` }} onMouseDown={(e) => startElementInteraction && startElementInteraction(e, 'move')} />
            {layer.type !== 'circle' && (
              <>
                <ControlHandle type="resize" position={{ left: `${layer.x - 6}px`, top: `${layer.y - 6}px` }} onMouseDown={(e) => startElementInteraction && startElementInteraction(e, 'resize-top-left')} cursor="nw-resize" />
                <ControlHandle type="resize" position={{ left: `${layer.x + elementWidth - 2}px`, top: `${layer.y - 6}px` }} onMouseDown={(e) => startElementInteraction && startElementInteraction(e, 'resize-top-right')} cursor="ne-resize" />
                <ControlHandle type="resize" position={{ left: `${layer.x - 6}px`, top: `${layer.y + elementHeight - 2}px` }} onMouseDown={(e) => startElementInteraction && startElementInteraction(e, 'resize-bottom-left')} cursor="sw-resize" />
                <ControlHandle type="resize" position={{ left: `${layer.x + elementWidth - 2}px`, top: `${layer.y + elementHeight - 2}px` }} onMouseDown={(e) => startElementInteraction && startElementInteraction(e, 'resize-bottom-right')} cursor="se-resize" />
              </>
            )}
            <ControlHandle type="rotate" position={{ left: `${layer.x + elementWidth / 2 - 12}px`, top: `${layer.y - 30}px` }} onMouseDown={(e) => startElementInteraction && startElementInteraction(e, 'rotate')} />
            </>
          )
        })()}

        {selectionBox && (
            <div
                style={{
                    position: 'absolute',
                    left: `${selectionBox.x - 2}px`,
                    top: `${selectionBox.y - 2}px`,
                    width: `${selectionBox.width + 4}px`,
                    height: `${selectionBox.height + 4}px`,
                    border: '2px dashed #3b82f6',
                    pointerEvents: 'none',
                    zIndex: 998,
                }}
            />
        )}

        {isMarqueeing && marqueeRect && (
          <div
              className="absolute border-2 border-dashed border-blue-500 bg-blue-500/20 pointer-events-none"
              style={{ left: marqueeRect.x, top: marqueeRect.y, width: marqueeRect.width, height: marqueeRect.height, zIndex: 2000 }}
          />
        )}
        
        {snapLines.map((line, index) => (
            <div
                key={index}
                className="absolute bg-red-500 pointer-events-none"
                style={{
                    left: line.type === 'v' ? line.x : 0,
                    top: line.type === 'h' ? line.y : 0,
                    width: line.type === 'v' ? '1px' : `${frame.width}px`,
                    height: line.type === 'h' ? '1px' : `${frame.height}px`,
                    zIndex: 2000,
                }}
            />
        ))}
      </div>
      {contextMenu && ( <ContextMenu x={contextMenu.x} y={contextMenu.y} items={contextMenuItems} onClose={closeContextMenu} /> )}
    </div>
  );
});

AdPreview.displayName = 'AdPreview';
export default AdPreview;
