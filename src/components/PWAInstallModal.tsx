import React, { useState } from 'react';
import { Download, Monitor, Smartphone, Apple, CheckCircle2, X, ExternalLink, ShieldCheck, Zap, Radio } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { usePlatform } from '../context/PlatformContext';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, install, isIOS, isAndroid } = usePWAInstall();
  const { activePlatform } = usePlatform();
  const [activeTab, setActiveTab] = useState<'android' | 'mac' | 'windows' | 'ios'>(() => {
    if (isAndroid) return 'android';
    if (isIOS) return 'ios';
    if (activePlatform === 'windows') return 'windows';
    return 'mac';
  });
  const [installSuccess, setInstallSuccess] = useState(false);
  const [copiedApkLink, setCopiedApkLink] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setInstallSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-950 via-stone-900 to-amber-950 p-6 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center shadow-lg border border-amber-400/30">
              <img src="/icon.svg" alt="UtkalSarathi" className="w-9 h-9" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-wide">Install UtkalSarathi</h2>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-red-900/60 text-red-300 border border-red-700/50">
                  Cross-Platform App
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Official native experience for Android, macOS, Windows 11 & iOS
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800/80 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Install Banner (When browser supports instant install) */}
        {isInstallable && !isInstalled && (
          <div className="bg-emerald-950/60 border-b border-emerald-800/60 p-4 px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-emerald-400 animate-pulse" />
              <div>
                <p className="text-xs font-semibold text-emerald-200">1-Click Fast Native Installation Ready</p>
                <p className="text-[11px] text-emerald-400">Your current browser supports immediate app installation</p>
              </div>
            </div>
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-emerald-900/30 transition transform active:scale-95"
            >
              <Download className="w-4 h-4" />
              Install Now
            </button>
          </div>
        )}

        {isInstalled && (
          <div className="bg-amber-950/40 border-b border-amber-800/40 p-4 px-6 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-amber-400" />
            <p className="text-xs text-amber-200">
              UtkalSarathi is already installed and running in native standalone mode on this system!
            </p>
          </div>
        )}

        {/* Platform Selection Tabs */}
        <div className="grid grid-cols-4 bg-stone-950 border-b border-stone-800 text-xs font-medium">
          <button
            onClick={() => setActiveTab('android')}
            className={`py-3 px-2 flex items-center justify-center gap-2 border-b-2 transition ${
              activeTab === 'android'
                ? 'border-emerald-500 text-emerald-400 bg-stone-900 font-bold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Android</span>
          </button>
          <button
            onClick={() => setActiveTab('mac')}
            className={`py-3 px-2 flex items-center justify-center gap-2 border-b-2 transition ${
              activeTab === 'mac'
                ? 'border-amber-500 text-amber-400 bg-stone-900 font-bold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Apple className="w-4 h-4 text-amber-400" />
            <span>macOS</span>
          </button>
          <button
            onClick={() => setActiveTab('windows')}
            className={`py-3 px-2 flex items-center justify-center gap-2 border-b-2 transition ${
              activeTab === 'windows'
                ? 'border-blue-500 text-blue-400 bg-stone-900 font-bold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Monitor className="w-4 h-4 text-blue-400" />
            <span>Windows 11</span>
          </button>
          <button
            onClick={() => setActiveTab('ios')}
            className={`py-3 px-2 flex items-center justify-center gap-2 border-b-2 transition ${
              activeTab === 'ios'
                ? 'border-purple-500 text-purple-400 bg-stone-900 font-bold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Smartphone className="w-4 h-4 text-purple-400" />
            <span>iOS (iPhone)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-stone-300 text-sm">
          {/* ANDROID TAB */}
          {activeTab === 'android' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-emerald-950/30 border border-emerald-900/50 rounded-xl">
                <div className="p-2 rounded-lg bg-emerald-900/50 text-emerald-400">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Android Phone App (Native APK & PWA)</h4>
                  <p className="text-xs text-stone-400">Cryptographically signed release package, full offline caching, and native fullscreen layout</p>
                </div>
              </div>

              {/* Direct APK Download Card */}
              <div className="p-4 bg-gradient-to-r from-emerald-950/80 via-stone-900 to-emerald-950/80 border border-emerald-500/40 rounded-xl shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 shrink-0">
                      <Download className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">Download Native Android APK (Base.apk)</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          v2.4.0 Release Signed
                        </span>
                      </div>
                      <p className="text-xs text-stone-300 mt-0.5">
                        Cryptographically signed APK package (<strong className="text-amber-300">Base.apk</strong>) — ready to download, install, and share across any Android device.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href="/Base.apk"
                      download="Base.apk"
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md transition transform active:scale-95"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Base.apk</span>
                    </a>
                    <button
                      onClick={() => {
                        const url = window.location.origin + '/Base.apk';
                        if (navigator.share) {
                          navigator.share({
                            title: 'UtkalSarathi Android APK (Base.apk)',
                            text: 'Download and install UtkalSarathi — AI Smart Tourism & Safety for Odisha (Base.apk)',
                            url,
                          }).catch(() => {});
                        } else {
                          navigator.clipboard.writeText(url).then(() => {
                            setCopiedApkLink(true);
                            setTimeout(() => setCopiedApkLink(false), 2500);
                          });
                        }
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-xl border border-stone-700 transition"
                      title="Share Base.apk link"
                    >
                      {copiedApkLink ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-bold">Link Copied!</span>
                        </>
                      ) : (
                        <>
                          <Radio className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Share APK</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-stone-400">How to Install on Android:</h5>
                <div className="grid gap-2 text-xs">
                  <div className="p-3 bg-stone-800/60 rounded-xl border border-stone-700/50 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-600/30 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</span>
                    <div>
                      <p className="font-medium text-white">Open in Google Chrome or Samsung Internet</p>
                      <p className="text-stone-400 mt-0.5">Navigate to this app link on your Android smartphone.</p>
                    </div>
                  </div>

                  <div className="p-3 bg-stone-800/60 rounded-xl border border-stone-700/50 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-600/30 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</span>
                    <div>
                      <p className="font-medium text-white">Tap the 3-Dots Menu (⋮) or "Install App" button</p>
                      <p className="text-stone-400 mt-0.5">Look for "Install App" or "Add to Home screen" in the browser menu.</p>
                    </div>
                  </div>

                  <div className="p-3 bg-stone-800/60 rounded-xl border border-stone-700/50 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-600/30 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</span>
                    <div>
                      <p className="font-medium text-white">Enjoy Native Android Experience</p>
                      <p className="text-stone-400 mt-0.5">App launches from your home screen with no URL bar, custom splash screen, and offline emergency support.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-stone-950/80 rounded-xl border border-stone-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-stone-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Verified Google Play TWA manifest and service worker active</span>
                </div>
                {isInstallable && (
                  <button
                    onClick={handleInstallClick}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition"
                  >
                    Install to Android
                  </button>
                )}
              </div>
            </div>
          )}

          {/* MACOS TAB */}
          {activeTab === 'mac' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-amber-950/30 border border-amber-900/50 rounded-xl">
                <div className="p-2 rounded-lg bg-amber-900/50 text-amber-400">
                  <Apple className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">macOS Desktop Application</h4>
                  <p className="text-xs text-stone-400">Native Dock icon, ⌘ keyboard shortcuts, and Cupertino titlebar controls</p>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-stone-400">How to Install on macOS:</h5>
                <div className="grid gap-2 text-xs">
                  <div className="p-3 bg-stone-800/60 rounded-xl border border-stone-700/50 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-amber-600/30 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">Safari</span>
                    <div>
                      <p className="font-medium text-white">Safari (macOS Sonoma or newer):</p>
                      <p className="text-stone-400 mt-0.5">Click <strong>File</strong> in the top menu bar ➔ Select <strong>Add to Dock...</strong></p>
                    </div>
                  </div>

                  <div className="p-3 bg-stone-800/60 rounded-xl border border-stone-700/50 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-amber-600/30 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">Chrome</span>
                    <div>
                      <p className="font-medium text-white">Google Chrome / Brave / Edge:</p>
                      <p className="text-stone-400 mt-0.5">Click the <strong>Install UtkalSarathi</strong> icon in the address bar (or Menu ➔ Save and Share ➔ Install).</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-stone-950/80 rounded-xl border border-stone-800 text-xs text-stone-400 flex items-center gap-2">
                <span className="text-amber-400 font-bold">⌘ Tip:</span>
                <span>Press <strong>⌘K</strong> to search or trigger voice assistant anytime on Mac.</span>
              </div>
            </div>
          )}

          {/* WINDOWS TAB */}
          {activeTab === 'windows' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-blue-950/30 border border-blue-900/50 rounded-xl">
                <div className="p-2 rounded-lg bg-blue-900/50 text-blue-400">
                  <Monitor className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Windows 11 Desktop Application</h4>
                  <p className="text-xs text-stone-400">Fluent Acrylic controls, Taskbar pinning, and Ctrl keyboard shortcuts</p>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-stone-400">How to Install on Windows 11 / 10:</h5>
                <div className="grid gap-2 text-xs">
                  <div className="p-3 bg-stone-800/60 rounded-xl border border-stone-700/50 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">Edge</span>
                    <div>
                      <p className="font-medium text-white">Microsoft Edge:</p>
                      <p className="text-stone-400 mt-0.5">Click the <strong>App available. Install UtkalSarathi</strong> button in the address bar ➔ Select <strong>Install</strong>. Pin to Start or Taskbar.</p>
                    </div>
                  </div>

                  <div className="p-3 bg-stone-800/60 rounded-xl border border-stone-700/50 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">Chrome</span>
                    <div>
                      <p className="font-medium text-white">Google Chrome:</p>
                      <p className="text-stone-400 mt-0.5">Click the <strong>Install</strong> icon next to the address bar bookmark star.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-stone-950/80 rounded-xl border border-stone-800 text-xs text-stone-400 flex items-center gap-2">
                <span className="text-blue-400 font-bold">Ctrl Tip:</span>
                <span>Press <strong>Ctrl+K</strong> to launch voice search or <strong>Ctrl+1 to 6</strong> to switch tabs on Windows.</span>
              </div>
            </div>
          )}

          {/* IOS TAB */}
          {activeTab === 'ios' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-purple-950/30 border border-purple-900/50 rounded-xl">
                <div className="p-2 rounded-lg bg-purple-900/50 text-purple-400">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Apple iOS (iPhone & iPad)</h4>
                  <p className="text-xs text-stone-400">Home Screen Web App with offline caching & full screen canvas</p>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-stone-400">How to Install on iPhone:</h5>
                <div className="grid gap-2 text-xs">
                  <div className="p-3 bg-stone-800/60 rounded-xl border border-stone-700/50 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-purple-600/30 text-purple-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</span>
                    <div>
                      <p className="font-medium text-white">Tap the Share Button</p>
                      <p className="text-stone-400 mt-0.5">In Safari toolbar at the bottom of the screen, tap the square icon with an arrow pointing up.</p>
                    </div>
                  </div>

                  <div className="p-3 bg-stone-800/60 rounded-xl border border-stone-700/50 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-purple-600/30 text-purple-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</span>
                    <div>
                      <p className="font-medium text-white">Select "Add to Home Screen"</p>
                      <p className="text-stone-400 mt-0.5">Scroll down the sharing options and tap <strong>Add to Home Screen</strong>.</p>
                    </div>
                  </div>

                  <div className="p-3 bg-stone-800/60 rounded-xl border border-stone-700/50 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-purple-600/30 text-purple-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</span>
                    <div>
                      <p className="font-medium text-white">Tap "Add" at the top right</p>
                      <p className="text-stone-400 mt-0.5">The UtkalSarathi icon will appear on your iPhone home screen.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-stone-950 p-4 px-6 border-t border-stone-800 flex items-center justify-between text-xs">
          <div className="text-stone-400 flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>UtkalSarathi Official App • Release v2.4.0</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
