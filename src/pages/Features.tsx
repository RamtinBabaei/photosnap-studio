import { SplitSection } from '../components/SplitSection';
import { FeatureGrid } from '../components/FeatureGrid';
import { BetaBanner } from '../components/BetaBanner';
import { PageMeta } from '../components/PageMeta';
export default function Features() {
  return (
    <>
      <PageMeta
        title="Features"
        description="Discover responsive photo stories, expressive layouts and tools designed for every visual storyteller."
      />
      <div className="compact-hero">
        <SplitSection
          hero
          dark
          title="Features"
          description="We make sure all of our features are designed to be loved by every aspiring and even professional photographer who wants to share their stories."
          image="features-hero"
          alt="A photographer silhouetted at sunset beside a tripod"
        />
      </div>
      <FeatureGrid all />
      <BetaBanner />
    </>
  );
}
