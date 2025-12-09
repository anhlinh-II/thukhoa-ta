import { useEffect, useCallback, useRef, useState } from 'react';
import messageService from '@/share/services/messageService';

interface AntiCheatOptions {
  onViolation?: (type: string, count: number) => void;
  enabled?: boolean;
  maxWarnings?: number;
}

interface ViolationCounts {
  tabSwitch: number;
  devTools: number;
  screenshot: number;
  copy: number;
  rightClick: number;
  windowBlur: number;
}

export function useAntiCheat(options: AntiCheatOptions = {}) {
  const { onViolation, enabled = true, maxWarnings = 3 } = options;
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const violationsRef = useRef<ViolationCounts>({
    tabSwitch: 0,
    devTools: 0,
    screenshot: 0,
    copy: 0,
    rightClick: 0,
    windowBlur: 0,
  });
  const devToolsOpenRef = useRef(false);

  const handleViolation = useCallback((type: keyof ViolationCounts, message: string) => {
    violationsRef.current[type]++;
    const count = violationsRef.current[type];
    
    if (type === 'tabSwitch' || type === 'windowBlur') {
      setTabSwitchCount(prev => prev + 1);
    }
    
    if (count <= maxWarnings) {
      messageService.warning(`⚠️ Cảnh báo ${count}/${maxWarnings}: ${message}`);
    } else {
      messageService.error(`🚫 Vi phạm nghiêm trọng: ${message}. Hành vi này có thể bị ghi nhận!`);
    }
    
    onViolation?.(type, count);
  }, [onViolation, maxWarnings]);

  useEffect(() => {
    if (!enabled) return;

    // 1. Block copy/paste
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      handleViolation('copy', 'Không được sao chép nội dung trong khi thi!');
    };

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      handleViolation('copy', 'Không được cắt nội dung trong khi thi!');
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      handleViolation('copy', 'Không được dán nội dung trong khi thi!');
    };

    // 2. Block right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      handleViolation('rightClick', 'Không được sử dụng menu chuột phải!');
    };

    // 3. Block keyboard shortcuts for DevTools and screenshot
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block F12
      if (e.key === 'F12') {
        e.preventDefault();
        handleViolation('devTools', 'Không được mở Developer Tools!');
        return;
      }

      // Block Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (DevTools)
      if (e.ctrlKey && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) {
        e.preventDefault();
        handleViolation('devTools', 'Không được mở Developer Tools!');
        return;
      }

      // Block Ctrl+U (View Source)
      if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
        handleViolation('devTools', 'Không được xem mã nguồn!');
        return;
      }

      // Block Ctrl+S (Save)
      if (e.ctrlKey && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
        return;
      }

      // Block Ctrl+P (Print)
      if (e.ctrlKey && (e.key === 'P' || e.key === 'p')) {
        e.preventDefault();
        handleViolation('screenshot', 'Không được in trang!');
        return;
      }

      // Block PrintScreen
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        handleViolation('screenshot', 'Không được chụp màn hình!');
        navigator.clipboard.writeText('').catch(() => {});
        return;
      }

      // Block Ctrl+C (Copy)
      if (e.ctrlKey && (e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
        handleViolation('copy', 'Không được sao chép!');
        return;
      }

      // Block Ctrl+A (Select All)
      if (e.ctrlKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        return;
      }

      // Block Alt+Tab detection (can't fully block but can detect)
      if (e.altKey && e.key === 'Tab') {
        handleViolation('tabSwitch', 'Phát hiện chuyển đổi cửa sổ!');
      }
    };

    // 4. Detect tab/window switch
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation('tabSwitch', 'Bạn đã rời khỏi trang thi!');
      }
    };

    const handleWindowBlur = () => {
      handleViolation('windowBlur', 'Bạn đã chuyển sang cửa sổ khác!');
    };

    // 5. Detect DevTools opening (using size change detection)
    const detectDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        if (!devToolsOpenRef.current) {
          devToolsOpenRef.current = true;
          handleViolation('devTools', 'Phát hiện Developer Tools đang mở!');
        }
      } else {
        devToolsOpenRef.current = false;
      }
    };

    // 6. Detect screenshot attempt via keyboard
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') {
        navigator.clipboard.writeText('Không được phép chụp màn hình!').catch(() => {});
        handleViolation('screenshot', 'Đã phát hiện chụp màn hình!');
      }
    };

    // Add event listeners
    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCut);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    // DevTools detection interval
    const devToolsInterval = setInterval(detectDevTools, 1000);

    // Disable text selection
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';

    // Cleanup
    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      clearInterval(devToolsInterval);
      
      // Restore text selection
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
    };
  }, [enabled, handleViolation]);

  const getViolations = useCallback(() => violationsRef.current, []);
  
  const getTotalViolations = useCallback(() => {
    const v = violationsRef.current;
    return v.tabSwitch + v.devTools + v.screenshot + v.copy + v.rightClick + v.windowBlur;
  }, []);

  return {
    getViolations,
    getTotalViolations,
    tabSwitchCount,
  };
}
