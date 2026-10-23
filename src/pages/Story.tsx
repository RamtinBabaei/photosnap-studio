import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Photo } from '../components/Image';
import { ArrowLink } from '../components/ArrowLink';
import { PageMeta } from '../components/PageMeta';
import { StoryGrid } from '../components/StoryGrid';
import { findStory, formatDate, stories } from '../data/stories';
import NotFound from './NotFound';
export default function Story() {
  const { slug } = useParams();
  const story = findStory(slug);
  const [shareStatus, setShareStatus] = useState('');
  if (!story) return <NotFound />;
  const current = story;
  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title: current.title, url: window.location.href });
        setShareStatus('Story shared.');
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareStatus('Story link copied.');
      }
    } catch (error) {
      if (!(error instanceof Error && error.name === 'AbortError'))
        setShareStatus('Copy this page’s address to share the story.');
    }
  }
  return (
    <>
      <PageMeta title={story.title} description={story.summary} />
      <div className="article-hero">
        <Photo name={story.image} alt={story.alt} priority />
      </div>
      <article className="article-body">
        <ArrowLink to="/stories">All stories</ArrowLink>
        <h1>{story.title}</h1>
        <p className="story-byline">
          <time dateTime={story.date}>{formatDate(story.date)}</time>
          <span>by {story.author}</span>
        </p>
        <p className="article-summary">{story.summary}</p>
        <div className="article-text">
          {story.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <p className="article-note">
          An illustrative photo essay for the Photosnap portfolio experience. Photographer credits
          are part of the original design’s sample content.
        </p>
        <div className="article-actions">
          <button className="button" onClick={share}>
            Share this story
          </button>
          <ArrowLink to="/invite">Tell your own story</ArrowLink>
        </div>
        <p className="share-status" role="status">
          {shareStatus}
        </p>
      </article>
      <h2 className="related-heading">Keep exploring</h2>
      <StoryGrid stories={stories.filter((item) => item.slug !== story.slug).slice(0, 4)} />
    </>
  );
}
