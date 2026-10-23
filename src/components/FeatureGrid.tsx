import { features } from '../data/features';
export function FeatureGrid({ all = false }: { all?: boolean }) {
  return (
    <section
      aria-label="Photosnap features"
      className={`feature-grid page-container ${all ? 'all-features' : ''}`}
    >
      {(all ? features : features.slice(0, 3)).map((feature) => (
        <article key={feature.icon} className="feature">
          <div className="feature-icon">
            <img src={`/assets/${feature.icon}.svg`} alt="" width="72" height="72" loading="lazy" />
          </div>
          <h2>{feature.title}</h2>
          <p>{feature.description}</p>
        </article>
      ))}
    </section>
  );
}
