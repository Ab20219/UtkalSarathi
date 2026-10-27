import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

export type OSMode = 'auto' | 'mac' | 'windows' | 'android' | 'ios';
export type ActivePlatform = 'mac' | 'windows' | 'android' | 'ios';
export type DeviceType = 'desktop' | 'mobile';

interface PlatformContextType {
  osMode: OSMode;
  setOsMode: (mode: OSMode) => void;
  activePlatform: ActivePlatform;
  activeOS: 'mac' | 'windows'; // Backward compatibility
  deviceType: DeviceType;
  isMobile: boolean;
  modKey: string; // '⌘' for Mac, 'Ctrl' for Windows/Android
  modKeyLabel: string;
  isStandalone: boolean;
  phoneFrameMode: boolean; // Enables phone mockup canvas on desktop for testing
  setPhoneFrameMode: (enabled: boolean) => void;
  toggleOSMode: () => void;
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

export const PlatformProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [osMode, setOsModeState] = useState<OSMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('utkalsarathi_os_mode') as OSMode;
      if (saved && ['auto', 'mac', 'windows', 'android', 'ios'].includes(saved)) {
        return saved;
      }
    }
    return 'auto';
  });

  const [systemPlatform, setSystemPlatform] = useState<ActivePlatform>('mac');
  const [isWindowMobile, setIsWindowMobile] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [phoneFrameMode, setPhoneFrameMode] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect standalone mode
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://');
    setIsStandalone(standalone);

    // Detect screen width
    const checkMobileWidth = () => {
      setIsWindowMobile(window.innerWidth < 768);
    };
    checkMobileWidth();
    window.addEventListener('resize', checkMobileWidth);

    // Detect actual OS
    const ua = navigator.userAgent.toLowerCase();
    const platform = ((navigator as any).userAgentData?.platform || navigator.platform || '').toLowerCase();

    if (/android/.test(ua)) {
      setSystemPlatform('android');
    } else if (/iphone|ipad|ipod/.test(ua)) {
      setSystemPlatform('ios');
    } else if (/win/.test(platform) || /windows/.test(ua)) {
      setSystemPlatform('windows');
    } else {
      setSystemPlatform('mac');
    }

    return () => {
      window.removeEventListener('resize', checkMobileWidth);
    };
  }, []);

  const activePlatform: ActivePlatform = useMemo(() => {
    if (osMode !== 'auto') return osMode;
    return systemPlatform;
  }, [osMode, systemPlatform]);

  const isMobile = useMemo(() => {
    if (activePlatform === 'android' || activePlatform === 'ios') return true;
    return isWindowMobile;
  }, [activePlatform, isWindowMobile]);

  const deviceType: DeviceType = isMobile ? 'mobile' : 'desktop';

  // Backward compatibility alias for desktop components
  const activeOS: 'mac' | 'windows' = activePlatform === 'windows' ? 'windows' : 'mac';
  const modKey = activePlatform === 'mac' || activePlatform === 'ios' ? '⌘' : 'Ctrl';
  const modKeyLabel = activePlatform === 'mac' || activePlatform === 'ios' ? 'Cmd' : 'Ctrl';

  const setOsMode = (mode: OSMode) => {
    setOsModeState(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('utkalsarathi_os_mode', mode);
    }
  };

  const toggleOSMode = () => {
    const sequence: OSMode[] = ['auto', 'mac', 'windows', 'android', 'ios'];
    const nextIdx = (sequence.indexOf(osMode) + 1) % sequence.length;
    setOsMode(sequence[nextIdx]);
  };

  // Synchronize document attribute for CSS targeting
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-os', activePlatform);
      document.documentElement.setAttribute('data-device', deviceType);
    }
  }, [activePlatform, deviceType]);

  return (
    <PlatformContext.Provider
      value={{
        osMode,
        setOsMode,
        activePlatform,
        activeOS,
        deviceType,
        isMobile,
        modKey,
        modKeyLabel,
        isStandalone,
        phoneFrameMode,
        setPhoneFrameMode,
        toggleOSMode,
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
};

export const usePlatform = (): PlatformContextType => {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error('usePlatform must be used within a PlatformProvider');
  }
  return context;
};
