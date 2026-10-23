import assetInfo from '../data/assets.json';
interface ImageProps {
  name: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}
export function Photo({
  name,
  alt,
  className = '',
  priority = false,
  sizes = '100vw',
}: ImageProps) {
  const info = assetInfo[name as keyof typeof assetInfo];
  return (
    <img
      className={`photo ${className}`}
      src={`/assets/${name}.webp`}
      srcSet={
        info.width > 400
          ? `/assets/${name}-sm.webp ${info.smallWidth}w, /assets/${name}.webp ${info.width}w`
          : undefined
      }
      sizes={info.width > 400 ? sizes : undefined}
      alt={alt}
      width={info.width}
      height={info.height}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : undefined}
    />
  );
}
