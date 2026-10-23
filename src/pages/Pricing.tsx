import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SplitSection } from '../components/SplitSection';
import { BetaBanner } from '../components/BetaBanner';
import { PageMeta } from '../components/PageMeta';
import { comparisons } from '../data/features';
import { planDetails } from '../../shared/plans';
export default function Pricing() {
  const [yearly, setYearly] = useState(false);
  return (
    <>
      <PageMeta
        title="Pricing"
        description="Find the right home for your photography. Compare Basic, Pro and Business plans, with monthly or yearly billing."
      />
      <div className="compact-hero">
        <SplitSection
          hero
          dark
          title="Pricing"
          description="Create your stories. Photosnap is a platform for photographers and visual storytellers. It’s the simple way to create and share your photos."
          image="pricing-hero"
          alt="A photographer holding a camera in a field"
        />
      </div>
      <section className="pricing-section page-container" aria-label="Membership plans">
        <div className="billing-toggle">
          <span className={!yearly ? 'selected' : ''}>Monthly</span>
          <button
            role="switch"
            aria-checked={yearly}
            aria-label="Yearly billing"
            className={`switch ${yearly ? 'is-on' : ''}`}
            onClick={() => setYearly(!yearly)}
          >
            <span />
          </button>
          <span className={yearly ? 'selected' : ''}>Yearly</span>
        </div>
        <div className="pricing-grid" aria-live="polite">
          {planDetails.map((plan) => (
            <article key={plan.id} className={`plan-card ${plan.id === 'pro' ? 'pro-plan' : ''}`}>
              <div className="plan-intro">
                <h2>{plan.name}</h2>
                <p>{plan.description}</p>
              </div>
              <div className="plan-price">
                <strong>${(yearly ? plan.yearly : plan.monthly).toFixed(2)}</strong>
                <span>per {yearly ? 'year' : 'month'}</span>
              </div>
              <Link
                className={`button ${plan.id === 'pro' ? 'button-white' : ''}`}
                to={`/invite?plan=${plan.id}&billing=${yearly ? 'yearly' : 'monthly'}`}
                aria-label={`Pick plan: ${plan.name}`}
              >
                Pick plan
              </Link>
            </article>
          ))}
        </div>
      </section>
      <section className="comparison-section">
        <h2>Compare</h2>
        <table>
          <caption className="sr-only">Compare Basic, Pro and Business plan features</caption>
          <thead>
            <tr>
              <th scope="col">The features</th>
              {planDetails.map((plan) => (
                <th scope="col" id={`plan-${plan.id}`} key={plan.id}>
                  {plan.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparisons.map((feature) => (
              <tr key={feature.name}>
                <th scope="row">{feature.name}</th>
                {feature.included.map((included, index) => (
                  <td
                    key={index}
                    headers={`plan-${planDetails[index].id}`}
                    aria-label={`${planDetails[index].name}: ${included ? 'Included' : 'Not included'}`}
                  >
                    <span className="mobile-plan-name" aria-hidden="true">
                      {planDetails[index].name}
                    </span>
                    {included ? (
                      <span className="check-mark" aria-label="Included">
                        ✓
                      </span>
                    ) : (
                      <span className="not-included" aria-label="Not included">
                        —
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <BetaBanner />
    </>
  );
}
