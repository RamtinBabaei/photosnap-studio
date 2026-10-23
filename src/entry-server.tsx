import { renderToReadableStream } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import App from './App';
import { stories, featuredStory } from './data/stories';
export const storyRoutes = [...stories, featuredStory].map((story) => ({
  path: `/stories/${story.slug}`,
  title: story.title,
  description: story.summary,
}));
export async function render(url: string) {
  const stream = await renderToReadableStream(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>,
  );
  await stream.allReady;
  return new Response(stream).text();
}
