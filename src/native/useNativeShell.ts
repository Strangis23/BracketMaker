import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { SystemBars, SystemBarsStyle } from '@capacitor/core';

export function readSafeAreaInset(edge: 'top' | 'bottom'): number {
  const property =
    edge === 'top' ? '--safe-area-inset-top' : '--safe-area-inset-bottom';
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(property)
    .trim();
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function useNativeShell() {
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    if (!isNative) return;

    document.documentElement.classList.add('native-app');

    void SystemBars.setStyle({ style: SystemBarsStyle.Dark });

    return () => {
      document.documentElement.classList.remove('native-app');
    };
  }, [isNative]);

  return { isNative };
}
