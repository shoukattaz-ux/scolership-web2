import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

type SlotPosition = 'header' | 'inContent' | 'sidebar' | 'footer';

interface AdSlotProps {
  position: SlotPosition;
  className?: string;
  /** Page-level opt-out (e.g. unreviewed or sample content). */
  suppress?: boolean;
}

declare global {
  interface Window {
    adsbygoogle?: unknown[];
    _mNHandle?: { queue?: Array<() => void> };
    _mNDetails?: { loadTag: (id: string, size: string, id2: string) => void };
  }
}

// Pages where ads are never shown: utility, form, legal, search, account/admin and error pages.
const AD_FREE_PATHS = [
  '/admin', '/contact', '/search', '/saved', '/compare', '/quiz', '/advertise',
  '/privacy-policy', '/terms', '/disclaimer', '/cookie-policy', '/editorial-policy', '/sitemap', '/about',
];

const loadedScripts = new Map<string, Promise<void>>();

function loadScriptOnce(src: string): Promise<void> {
  const existing = loadedScripts.get(src);
  if (existing) return existing;
  const p = new Promise<void>((resolve, reject) => {
    const el = document.createElement('script');
    el.src = src;
    el.async = true;
    el.crossOrigin = 'anonymous';
    el.onload = () => resolve();
    el.onerror = () => {
      loadedScripts.delete(src);
      reject(new Error('blocked'));
    };
    document.head.appendChild(el);
  });
  loadedScripts.set(src, p);
  return p;
}

/**
 * Ad container for Google AdSense and Media.net.
 *
 * Nothing renders and no third-party script loads unless ALL of these hold:
 *  - ads are enabled in Admin -> Monetization (owner does this only after network approval),
 *  - real publisher / slot IDs are configured,
 *  - the visitor consented to advertising cookies,
 *  - the page is a content page whose content has been reviewed.
 * If a script is blocked or fails, the container collapses so the page stays usable.
 */
export function AdSlot({ position, className = '', suppress = false }: AdSlotProps) {
  const { settings, cookiePrefs, scholarships } = useAppContext();
  const { pathname } = useLocation();
  const m = settings.monetization;
  const slot = m.slots[position];
  const [failed, setFailed] = useState(false);
  const pushed = useRef(false);

  const network = slot?.network || m.primaryNetwork;
  const sampleHeavy =
    scholarships.length > 0 && scholarships.filter((s) => s.isSampleData).length / scholarships.length > 0.5;
  const onDirectoryPage = !pathname.startsWith('/guides');

  const eligible =
    !suppress &&
    !!slot?.enabled &&
    m.enabled &&
    !!cookiePrefs?.advertising &&
    !!slot.slotCode &&
    !AD_FREE_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`)) &&
    !(sampleHeavy && onDirectoryPage) &&
    ((network === 'adsense' && /^ca-pub-\d+$/.test(m.adsensePublisherId)) ||
      (network === 'medianet' && !!m.medianetCustomerId));

  useEffect(() => {
    if (!eligible || pushed.current) return;
    pushed.current = true;
    setFailed(false);
    if (network === 'adsense') {
      loadScriptOnce(
        `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(m.adsensePublisherId)}`
      )
        .then(() => {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        })
        .catch(() => setFailed(true));
    } else if (network === 'medianet') {
      window._mNHandle = window._mNHandle || {};
      window._mNHandle.queue = window._mNHandle.queue || [];
      const size = position === 'header' || position === 'footer' ? (window.innerWidth >= 768 ? '728x90' : '320x50') : '300x250';
      loadScriptOnce(`https://contextual.media.net/dmedianet.js?cid=${encodeURIComponent(m.medianetCustomerId)}`)
        .then(() => {
          window._mNHandle!.queue!.push(() => {
            window._mNDetails?.loadTag(slot.slotCode, size, slot.slotCode);
          });
        })
        .catch(() => setFailed(true));
    }
  }, [eligible, network, m.adsensePublisherId, m.medianetCustomerId, slot?.slotCode, position]);

  if (!eligible || failed) return null;

  return (
    <aside
      aria-label="Advertisement"
      className={`w-full flex flex-col items-center overflow-hidden my-6 ${className}`}
      style={{ minHeight: `${slot.minHeightDesktop}px` }}
      data-ad-network={network}
      data-ad-position={position}
    >
      <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
        Advertisement
      </span>
      {network === 'adsense' ? (
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%' }}
          data-ad-client={m.adsensePublisherId}
          data-ad-slot={slot.slotCode}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : (
        <div id={slot.slotCode} />
      )}
    </aside>
  );
}
