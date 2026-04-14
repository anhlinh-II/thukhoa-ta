"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { UnderlineOutlined, StrikethroughOutlined, DeleteOutlined } from '@ant-design/icons';
import messageService from '@/share/services/messageService';

interface TextHighlighterProps {
  enabled: boolean;
  children: React.ReactNode;
}

const HIGHLIGHT_COLORS = [
  { name: 'yellow', color: '#fef08a' },
  { name: 'orange', color: '#fed7aa' },
  { name: 'green', color: '#bbf7d0' },
  { name: 'blue', color: '#bfdbfe' },
  { name: 'pink', color: '#fbcfe8' },
];

interface SelectionInfo {
  text: string;
  startContainerPath: number[];
  startOffset: number;
  endContainerPath: number[];
  endOffset: number;
}

interface PickerState {
  visible: boolean;
  x: number;
  y: number;
}

function getNodePath(root: Node, target: Node): number[] {
  const path: number[] = [];
  let current: Node | null = target;
  
  while (current && current !== root) {
    const parentNode: Node | null = current.parentNode;
    if (!parentNode) break;
    const index = Array.from(parentNode.childNodes).indexOf(current as ChildNode);
    path.unshift(index);
    current = parentNode;
  }
  
  return path;
}

function getNodeFromPath(root: Node, path: number[]): Node | null {
  let current: Node = root;
  
  for (const index of path) {
    if (!current.childNodes[index]) return null;
    current = current.childNodes[index];
  }
  
  return current;
}

export default function TextHighlighter({ enabled, children }: TextHighlighterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectionInfoRef = useRef<SelectionInfo | null>(null);
  const isApplyingRef = useRef(false);
  
  const [picker, setPicker] = useState<PickerState>({ visible: false, x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const saveSelectionInfo = useCallback((): SelectionInfo | null => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    
    const range = selection.getRangeAt(0);
    if (range.collapsed) return null;
    
    const text = selection.toString().trim();
    if (!text) return null;

    const container = containerRef.current;
    if (!container) return null;

    if (!container.contains(range.startContainer) || !container.contains(range.endContainer)) {
      return null;
    }

    return {
      text,
      startContainerPath: getNodePath(container, range.startContainer),
      startOffset: range.startOffset,
      endContainerPath: getNodePath(container, range.endContainer),
      endOffset: range.endOffset,
    };
  }, []);

  const restoreSelection = useCallback((): Range | null => {
    const info = selectionInfoRef.current;
    if (!info) return null;

    const container = containerRef.current;
    if (!container) return null;

    try {
      const startNode = getNodeFromPath(container, info.startContainerPath);
      const endNode = getNodeFromPath(container, info.endContainerPath);
      
      if (!startNode || !endNode) return null;

      const range = document.createRange();
      range.setStart(startNode, Math.min(info.startOffset, startNode.textContent?.length || 0));
      range.setEnd(endNode, Math.min(info.endOffset, endNode.textContent?.length || 0));

      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }

      return range;
    } catch (e) {
      console.error('Failed to restore selection:', e);
      return null;
    }
  }, []);

  const applyStyle = useCallback((type: 'highlight' | 'underline' | 'strikethrough', color?: string) => {
    if (isApplyingRef.current) return;
    isApplyingRef.current = true;

    try {
      const range = restoreSelection();
      if (!range) {
        messageService.warning('Vui lòng chọn văn bản trước');
        return;
      }

      const span = document.createElement('span');
      span.setAttribute('data-highlight', 'true');

      if (type === 'highlight' && color) {
        span.style.backgroundColor = color;
        span.style.padding = '0 2px';
        span.style.borderRadius = '2px';
        span.setAttribute('data-type', 'highlight');
      } else if (type === 'underline') {
        span.style.textDecoration = 'underline';
        span.style.textDecorationColor = '#3b82f6';
        span.style.textDecorationThickness = '2px';
        span.style.textUnderlineOffset = '3px';
        span.setAttribute('data-type', 'underline');
      } else if (type === 'strikethrough') {
        span.style.textDecoration = 'line-through';
        span.style.textDecorationColor = '#ef4444';
        span.style.textDecorationThickness = '2px';
        span.setAttribute('data-type', 'strikethrough');
      }

      try {
        range.surroundContents(span);
      } catch {
        const contents = range.extractContents();
        span.appendChild(contents);
        range.insertNode(span);
      }

      containerRef.current?.normalize();

      window.getSelection()?.removeAllRanges();
      selectionInfoRef.current = null;
      setPicker({ visible: false, x: 0, y: 0 });
      
     //  messageService.success('Đã áp dụng định dạng');
    } catch (e) {
      console.error('Apply style error:', e);
      messageService.warning('Không thể áp dụng cho vùng chọn này');
    } finally {
      isApplyingRef.current = false;
    }
  }, [restoreSelection]);

  const removeHighlight = useCallback(() => {
    if (isApplyingRef.current) return;
    isApplyingRef.current = true;

    try {
      const range = restoreSelection();
      if (!range) return;

      const container = range.commonAncestorContainer;
      const parentElement = container.nodeType === Node.TEXT_NODE 
        ? container.parentElement 
        : container as HTMLElement;
      
      if (parentElement?.getAttribute('data-highlight') === 'true') {
        const parent = parentElement.parentNode;
        while (parentElement.firstChild) {
          parent?.insertBefore(parentElement.firstChild, parentElement);
        }
        parent?.removeChild(parentElement);
        messageService.success('Đã xóa định dạng');
      } else {
        messageService.info('Vùng chọn không có định dạng để xóa');
      }

      window.getSelection()?.removeAllRanges();
      selectionInfoRef.current = null;
      setPicker({ visible: false, x: 0, y: 0 });
    } finally {
      isApplyingRef.current = false;
    }
  }, [restoreSelection]);

  const closePicker = useCallback(() => {
    window.getSelection()?.removeAllRanges();
    selectionInfoRef.current = null;
    setPicker({ visible: false, x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (!enabled) {
      setPicker({ visible: false, x: 0, y: 0 });
      selectionInfoRef.current = null;
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const handleMouseUp = (e: MouseEvent) => {
      if (isApplyingRef.current) return;
      
      const target = e.target as HTMLElement;
      if (target.closest('.highlight-picker')) return;
      if (target.closest('[data-vocab-temp]')) return;

      setTimeout(() => {
        const info = saveSelectionInfo();
        if (!info) return;

        selectionInfoRef.current = info;

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        setPicker({
          visible: true,
          x: rect.left + rect.width / 2,
          y: rect.bottom + 8
        });
      }, 10);
    };

    container.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      container.removeEventListener('mouseup', handleMouseUp);
    };
  }, [enabled, saveSelectionInfo]);

  useEffect(() => {
    if (!picker.visible) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.highlight-picker')) {
        closePicker();
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [picker.visible, closePicker]);

  const pickerElement = picker.visible && mounted ? createPortal(
    <div
      className="highlight-picker fixed bg-white rounded-xl shadow-2xl border border-gray-200 p-2"
      style={{
        zIndex: 10000,
        left: picker.x,
        top: picker.y,
        transform: 'translateX(-50%)'
      }}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div className="flex items-center gap-1 pb-2 border-b border-gray-100">
        {HIGHLIGHT_COLORS.map((item) => (
          <button
            key={item.name}
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
              applyStyle('highlight', item.color);
            }}
            className="w-6 h-6 rounded-full border-2 border-transparent hover:border-gray-400 transition-all hover:scale-110 shadow-sm"
            style={{ backgroundColor: item.color }}
            title={`Tô màu ${item.name}`}
          />
        ))}
      </div>

      <div className="flex items-center gap-1 pt-2">
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.stopPropagation();
            applyStyle('underline');
          }}
          className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
          title="Gạch chân"
        >
          <UnderlineOutlined />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.stopPropagation();
            applyStyle('strikethrough');
          }}
          className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-orange-50 text-orange-500 transition-colors"
          title="Gạch bỏ"
        >
          <StrikethroughOutlined />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.stopPropagation();
            removeHighlight();
          }}
          className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
          title="Xóa định dạng"
        >
          <DeleteOutlined />
        </button>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            closePicker();
          }}
          className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-gray-100 text-gray-400 text-xs transition-colors"
          title="Đóng"
        >
          ✕
        </button>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div 
      ref={containerRef}
      style={{ 
        userSelect: enabled ? 'text' : 'auto',
        cursor: enabled ? 'text' : 'default'
      }}
    >
      {children}
      {pickerElement}
    </div>
  );
}
