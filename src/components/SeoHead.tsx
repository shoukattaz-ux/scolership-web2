import { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

export interface SeoHeadProps {
  title: string;
  description: string;
  canonicalPath?: string;
  ogType?: 'website' | 'article';
  noIndex?: boolean;
  schemas?: Record<string, unknown>[];
}

function upsertMeta(selector: string, attrName: 'name' | 'property', attrVal: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrVal);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function SeoHead({
  title,
  description,
  canonicalPath,
  ogType = 'website',
  noIndex = false,
  schemas = [],
}: SeoHeadProps) {
  const { settings } = useAppContext();

  useEffect(() => {
    const trimmedTitle = title.length > 60 ? `${title.slice(0, 57)}...` : title;
    const trimmedDesc = description.length > 160 ? `${description.slice(0, 157)}...` : description;
    document.title = trimmedTitle;

    upsertMeta('meta[name="description"]', 'name', 'description', trimmedDesc);
    upsertMeta('meta[property="og:title"]', 'property', 'og:title', trimmedTitle);
    upsertMeta('meta[property="og:description"]', 'property', 'og:description', trimmedDesc);
    upsertMeta('meta[property="og:type"]', 'property', 'og:type', ogType);
    upsertMeta('meta[property="og:site_name"]', 'property', 'og:site_name', settings.general.brandName);
    upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', trimmedTitle);
    upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', trimmedDesc);

    const origin = window.location.origin;
    const path = canonicalPath ?? window.location.pathname;
    const canonicalUrl = `${origin}${path}`;

    upsertMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);

    let canonicalEl = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', canonicalUrl);

    if (noIndex) {
      upsertMeta('meta[name="robots"]', 'name', 'robots', 'noindex, follow');
    } else {
      const robotsEl = document.head.querySelector('meta[name="robots"]');
      if (robotsEl) robotsEl.remove();
    }

    // Remove previously injected dynamic schemas
    document.head.querySelectorAll('script[data-seo-dynamic="true"]').forEach((node) => node.remove());

    schemas.forEach((schema) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo-dynamic', 'true');
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });
  }, [title, description, canonicalPath, ogType, noIndex, schemas]);

  return null;
}
