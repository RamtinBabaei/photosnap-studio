import { PageMeta } from '../components/PageMeta';
export default function Privacy() {
  return (
    <article className="legal-page">
      <PageMeta
        title="Privacy & demo information"
        description="How this Photosnap portfolio preview handles invitation requests and personal data."
      />
      <p className="eyebrow mb-5">Clear by design</p>
      <h1>Privacy & demo information</h1>
      <p>
        This website is a portfolio implementation by Ramtin Babaei of the Photosnap marketing
        design. It is not an operating photography subscription service. Plan descriptions, prices
        and photography credits are sample content. No payment, photo upload, account creation or
        email-delivery service is offered.
      </p>
      <h2>Invitation requests</h2>
      <p>
        If you submit the invitation form, your name, normalized email address, plan preference,
        billing preference and consent timestamp are saved in a private Cloudflare D1 database. We
        use those details only to record your interest. Requests are not visible to other visitors.
        The same email address does not create multiple requests.
      </p>
      <h2>Abuse prevention</h2>
      <p>
        We use a one-way, daily rotating hash of your connection’s IP address to limit repeated
        submissions. We do not store the raw IP address in our application database. Rate-limit
        records are removed after a day. Hosting infrastructure may process standard connection
        logs.
      </p>
      <h2>Retention and removal</h2>
      <p>
        Invitation requests are automatically removed after 90 days. To request earlier deletion,
        email <a href="mailto:ramtin.babae011@gmail.com">ramtin.babae011@gmail.com</a> from the
        address used for your request. No account or password is needed.
      </p>
      <h2>Cookies and external links</h2>
      <p>
        This website does not set analytics cookies, advertising cookies or browser tracking
        identifiers. Fonts and photography are served from this website. Social icons link to the
        relevant services’ homepages, rather than claiming to be official Photosnap accounts. Those
        services apply their own privacy policies.
      </p>
      <h2>Design and imagery</h2>
      <p>
        The visual concept and supplied photography belong to their respective rights holders. This
        educational portfolio implementation follows the Photosnap challenge design by{' '}
        <a
          href="https://www.frontendmentor.io/challenges/photosnap-multipage-website-nMDSrNmNW"
          target="_blank"
          rel="noopener noreferrer"
        >
          Frontend Mentor
        </a>
        .
      </p>
      <p>Last updated: October 23, 2026.</p>
    </article>
  );
}
