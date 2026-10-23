import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
export function PageMeta({ title, description }: { title: string; description: string }) {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = `${title} | Photosnap`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    document
      .querySelector('link[rel="canonical"]')
      ?.setAttribute('href', `${window.location.origin}${pathname === '/' ? '' : pathname}`);
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute('content', `${title} | Photosnap`);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
    document
      .querySelector('meta[property="og:url"]')
      ?.setAttribute('content', `${window.location.origin}${pathname}`);
  }, [title, description, pathname]);
  return null;
}
