import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { stories, featuredStory, findStory } from '../src/data/stories';
import Stories from '../src/pages/Stories';
import Story from '../src/pages/Story';
import { Routes, Route } from 'react-router-dom';

describe('story catalogue and reader', () => {
  it('has sixteen unique stories, a featured story, and real editorial copy', () => {
    expect(stories).toHaveLength(16);
    expect(new Set(stories.map((story) => story.slug)).size).toBe(16);
    for (const story of [...stories, featuredStory]) {
      expect(findStory(story.slug)).toBe(story);
      expect(story.paragraphs.join(' ').length).toBeGreaterThan(300);
      expect(story.alt.length).toBeGreaterThan(20);
    }
  });
  it('links every gallery card to its corresponding readable story', () => {
    render(
      <MemoryRouter>
        <Stories />
      </MemoryRouter>,
    );
    for (const story of stories)
      expect(screen.getByRole('link', { name: new RegExp(story.title) })).toHaveAttribute(
        'href',
        `/stories/${story.slug}`,
      );
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(featuredStory.title);
  });
  it('shows a useful not-found view for an unknown story', () => {
    render(
      <MemoryRouter initialEntries={['/stories/missing']}>
        <Routes>
          <Route path="/stories/:slug" element={<Story />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('Let’s find another perspective.')).toBeVisible();
  });
  it('copies the current story address when native sharing is unavailable', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    render(
      <MemoryRouter initialEntries={['/stories/the-mountains']}>
        <Routes>
          <Route path="/stories/:slug" element={<Story />} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Share this story' }));
    expect(await screen.findByText('Story link copied.')).toBeVisible();
    expect(writeText).toHaveBeenCalledWith(window.location.href);
  });
  it('offers a useful fallback if the browser denies clipboard access', async () => {
    vi.stubGlobal('navigator', {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('Not allowed')) },
    });
    render(
      <MemoryRouter initialEntries={['/stories/the-mountains']}>
        <Routes>
          <Route path="/stories/:slug" element={<Story />} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Share this story' }));
    expect(await screen.findByText('Copy this page’s address to share the story.')).toBeVisible();
  });
});
