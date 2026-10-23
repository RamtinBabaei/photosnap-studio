import { ArrowLink } from '../components/ArrowLink';
import { PageMeta } from '../components/PageMeta';
export default function NotFound() {
  return (
    <section className="not-found">
      <PageMeta
        title="Page not found"
        description="This page is outside the frame. Explore more photo stories on Photosnap."
      />
      <p className="eyebrow">404 — Outside the frame</p>
      <h1>Let’s find another perspective.</h1>
      <p>
        The page you’re looking for isn’t here. There are plenty of stories waiting to be
        discovered.
      </p>
      <ArrowLink to="/stories">Explore the stories</ArrowLink>
    </section>
  );
}
