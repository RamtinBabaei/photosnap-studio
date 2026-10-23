import { ArrowLink } from './ArrowLink';
import { Photo } from './Image';
interface Props {
  title: string;
  description: string;
  image: string;
  alt: string;
  dark?: boolean;
  reverse?: boolean;
  hero?: boolean;
  action?: string;
  to?: string;
}
export function SplitSection({
  title,
  description,
  image,
  alt,
  dark = false,
  reverse = false,
  hero = false,
  action,
  to = '/invite',
}: Props) {
  const Heading = hero ? 'h1' : 'h2';
  return (
    <section
      className={`split-section ${dark ? 'is-dark' : ''} ${reverse ? 'is-reversed' : ''} ${hero ? 'is-hero' : ''}`}
    >
      <div className="split-copy">
        <div className="split-copy-inner">
          <Heading>{title}</Heading>
          <p>{description}</p>
          {action && <ArrowLink to={to}>{action}</ArrowLink>}
        </div>
      </div>
      <div className="split-media">
        <Photo
          name={image}
          alt={alt}
          priority={hero}
          sizes="(min-width: 1024px) 58vw, (min-width: 768px) 36vw, 100vw"
        />
      </div>
    </section>
  );
}
