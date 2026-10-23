import { ArrowLink } from './ArrowLink';
export function BetaBanner() {
  return (
    <section className="beta-banner">
      <div className="page-container">
        <h2>
          We’re in beta.
          <br />
          Get your invite today!
        </h2>
        <ArrowLink to="/invite">Get an invite</ArrowLink>
      </div>
    </section>
  );
}
