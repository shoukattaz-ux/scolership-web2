import { useState } from 'react';
import { GraduationCap } from 'lucide-react';
import { MEDIA_ASSETS, MediaAssetKey } from '../data/media';

interface SafeImageProps {
  assetKey: MediaAssetKey;
  srcOverride?: string;
  className?: string;
  priority?: boolean;
  altOverride?: string;
}

export function SafeImage({
  assetKey,
  srcOverride,
  className = 'w-full h-full object-cover',
  priority = false,
  altOverride,
}: SafeImageProps) {
  const [failed, setFailed] = useState(false);
  const asset = MEDIA_ASSETS[assetKey] || MEDIA_ASSETS.readingRoom;
  const resolvedSrc = srcOverride && srcOverride.trim() ? srcOverride : asset.src;

  if (failed) {
    return (
      <div
        role="img"
        aria-label={altOverride || asset.alt}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-navy-900 via-navy-800 to-slate-800 text-white p-6 text-center ${className}`}
      >
        <GraduationCap className="w-10 h-10 text-gold-400 mb-2" aria-hidden="true" />
        <span className="text-xs font-medium text-slate-200 max-w-xs">{asset.caption}</span>
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={altOverride || asset.alt}
      width={asset.width}
      height={asset.height}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : 'auto'}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
