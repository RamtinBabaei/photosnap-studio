import { ArrowLink } from '../components/ArrowLink';
import { Photo } from '../components/Image';
import { StoryGrid } from '../components/StoryGrid';
import { PageMeta } from '../components/PageMeta';
import { stories, featuredStory, formatDate } from '../data/stories';
export default function Stories() {
  return (
    <>
      <PageMeta
        title="Stories"
        description="Explore sixteen visual stories from mountains and cityscapes to wildlife and the night sky."
      />
      <section className="featured-story">
        <Photo name={featuredStory.image} alt={featuredStory.alt} priority />
        <div className="page-container">
          <div className="featured-story-copy">
            <p className="eyebrow">Last month’s featured story</p>
            <h1>{featuredStory.title}</h1>
            <p className="story-byline">
              <time dateTime={featuredStory.date}>{formatDate(featuredStory.date)}</time>
              <span>by {featuredStory.author}</span>
            </p>
            <p className="featured-summary">{featuredStory.summary}</p>
            <ArrowLink to={`/stories/${featuredStory.slug}`}>Read the story</ArrowLink>
          </div>
        </div>
      </section>
      <StoryGrid stories={stories} dates />
    </>
  );
}
