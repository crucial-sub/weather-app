'use client';

// 테마 Provider — next-themes 기반 다크/라이트 모드 제공
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ReactNode } from 'react';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"      // globals.css의 .dark 셀렉터와 매칭
      defaultTheme="system"  // 시스템 테마 존중
      enableSystem            // prefers-color-scheme 감지
    >
      {children}
    </NextThemesProvider>
  );
}
