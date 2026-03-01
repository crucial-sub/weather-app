'use client';

// 다크/라이트 모드 토글 버튼 — Sun/Moon 아이콘 전환 애니메이션
import { useEffect, useState, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { Button } from './button';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // hydration 불일치 방지: 마운트 후에만 테마 상태 렌더링
  useEffect(() => {
    setMounted(true);
  }, []);

  // 테마 전환 시 트랜지션 클래스 추가/제거
  const handleToggle = useCallback(() => {
    const root = document.documentElement;
    root.classList.add('theme-transitioning');

    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');

    // 200ms 후 트랜지션 클래스 제거
    setTimeout(() => {
      root.classList.remove('theme-transitioning');
    }, 200);
  }, [resolvedTheme, setTheme]);

  // 마운트 전 placeholder 렌더링 (레이아웃 시프트 방지)
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" aria-label="테마 전환">
        <div className="h-5 w-5" />
      </Button>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="sun"
            initial={{ rotate: -90, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            exit={{ rotate: 90, scale: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Sun className="h-5 w-5" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ rotate: 90, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            exit={{ rotate: -90, scale: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Moon className="h-5 w-5" />
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  );
}
