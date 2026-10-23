import { SplitSection } from '../components/SplitSection';
import { StoryGrid } from '../components/StoryGrid';
import { FeatureGrid } from '../components/FeatureGrid';
import { PageMeta } from '../components/PageMeta';
import { stories } from '../data/stories';
export default function Home() {
  return (
    <>
      <PageMeta
        title="Create and share your photo stories"
        description="Photosnap is a platform for photographers and visual storytellers. Share photos, tell stories and connect with others."
      />
      <SplitSection
        hero
        dark
        title="Create and share your photo stories."
        description="Photosnap is a platform for photographers and visual storytellers. We make it easy to share photos, tell stories and connect with others."
        image="create-and-share"
        alt="A traveller standing on a wooden jetty over a still mountain lake"
        action="Get an invite"
      />
      <SplitSection
        reverse
        title="Beautiful stories every time"
        description="We provide design templates to ensure your stories look terrific. Easily add photos, text, embed maps and media from other networks. Then share your story with everyone."
        image="beautiful-stories"
        alt="A creative workspace with a laptop, photography books and a camera"
        action="View the stories"
        to="/stories"
      />
      <SplitSection
        title="Designed for everyone"
        description="Photosnap can help you create stories that resonate with your audience. Our tool is designed for photographers of all levels, brands, businesses — you name it."
        image="designed-for-everyone"
        alt="A photographer adjusting a professional camera rig"
        action="View the stories"
        to="/stories"
      />
      <StoryGrid stories={stories.slice(0, 4)} />
      <FeatureGrid />
    </>
  );
}
