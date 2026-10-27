import React, { useEffect, useState } from 'react';
import { WifiOff, Wifi, CheckCircle2 } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showReconnectedToast, setShowReconnectedToast] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnectedToast(true);
      const timer = setTimeout(() => setShowReconnectedToast(false), 3500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnectedToast(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <aside
        aria-label="Offline status warning"
        className="fixed bottom-16 md:bottom-6 left-4 z-50 flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-amber-950/95 border border-amber-600/80 text-amber-200 text-xs shadow-2xl backdrop-blur-md animate-fadeIn"
      >
        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
        </span>
        <WifiOff className="w-4 h-4 text-amber-400" />
        <span><strong>Offline Mode Active:</strong> Using pre-cached travel packs &amp; emergency numbers.</span>
      </aside>
    );
  }

  if (showReconnectedToast) {
    return (
      <aside
        aria-label="Reconnected notification"
        className="fixed bottom-16 md:bottom-6 left-4 z-50 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-950/95 border border-emerald-600/80 text-emerald-200 text-xs shadow-2xl backdrop-blur-md animate-fadeIn"
      >
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        <span>Connected to live Odisha tourism network</span>
      </aside>
    );
  }

  return null;
};
