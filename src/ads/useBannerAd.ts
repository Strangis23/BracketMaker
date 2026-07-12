import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import {
  AdMob,
  BannerAdPluginEvents,
  BannerAdPosition,
  BannerAdSize,
} from '@capacitor-community/admob';
import { BANNER_AD_ID } from './adConfig';
import { dpToPx } from '../native/dpToPx';

const DEFAULT_BANNER_DP = 60;

export function useBannerAd() {
  const isNative = Capacitor.isNativePlatform();
  const [bannerHeightPx, setBannerHeightPx] = useState(() =>
    isNative ? dpToPx(DEFAULT_BANNER_DP) : 0
  );

  useEffect(() => {
    if (!isNative) return;

    let active = true;
    const listenerHandles: Array<{ remove: () => Promise<void> }> = [];

    async function showBanner() {
      await AdMob.initialize();

      const sizeListener = await AdMob.addListener(
        BannerAdPluginEvents.SizeChanged,
        (info) => {
          if (!active) return;
          if (info.height > 0) {
            setBannerHeightPx(dpToPx(info.height));
          }
        }
      );
      listenerHandles.push(sizeListener);

      await AdMob.showBanner({
        adId: BANNER_AD_ID,
        adSize: BannerAdSize.ADAPTIVE_BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
        isTesting: false,
      });
    }

    showBanner().catch(console.error);

    return () => {
      active = false;
      void Promise.all(listenerHandles.map((handle) => handle.remove()));
      void AdMob.hideBanner().catch(() => {});
    };
  }, [isNative]);

  return { bannerHeightPx, isNative };
}
