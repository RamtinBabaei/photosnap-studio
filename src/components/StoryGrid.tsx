import { Link } from 'react-router-dom';
import { Arrow } from './ArrowLink';
import { Photo } from './Image';
import { formatDate, type Story } from '../data/stories';
export function StoryGrid({ stories, dates = false }: { stories: Story[]; dates?: boolean }) {
  return (
    <section
      aria-label="Photo stories"
      className="story-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
    >
      {stories.map((story) => (
        <Link to={`/stories/${story.slug}`} className="story-card" key={story.slug}>
          <Photo
            name={story.image}
            alt={story.alt}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          />
          <div className="story-card-copy" id={`story-${story.slug}`}>
            {dates && <time dateTime={story.date}>{formatDate(story.date)}</time>}
            <h2>{story.title}</h2>
            <p>by {story.author}</p>
            <div className="story-card-action">
              <span>Read story</span>
              <Arrow />
            </div>
          </div>
        </Link>
      ))}
    </section>
  );
}
