import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { inviteSchema, plans, type InviteInput } from '../../shared/invite';
import { Photo } from '../components/Image';
import { ArrowLink } from '../components/ArrowLink';
import { PageMeta } from '../components/PageMeta';

export default function Invite() {
  const [params] = useSearchParams();
  const initialPlan = params.get('plan');
  const initialBilling = params.get('billing');
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState('');
  const formId = useId();
  useEffect(() => {
    // The static /invite HTML has no query string. Synchronize uncontrolled
    // select elements after hydration, when the visitor's URL is available.
    const plan = formRef.current?.elements.namedItem('plan');
    const billing = formRef.current?.elements.namedItem('billing');
    if (plan instanceof HTMLSelectElement)
      plan.value = plans.includes(initialPlan as InviteInput['plan']) ? initialPlan! : 'undecided';
    if (billing instanceof HTMLSelectElement)
      billing.value = initialBilling === 'yearly' ? 'yearly' : 'monthly';
  }, [initialPlan, initialBilling]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'submitting') return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const result = inviteSchema.safeParse({
      name: data.get('name'),
      email: String(data.get('email') ?? '').trim(),
      plan: data.get('plan'),
      billing: data.get('billing'),
      consent: data.get('consent') === 'on',
      website: data.get('website'),
    });
    if (!result.success) {
      const nextErrors = Object.fromEntries(
        result.error.issues.map((issue) => [String(issue.path[0]), issue.message]),
      );
      setErrors(nextErrors);
      const field = form.elements.namedItem(Object.keys(nextErrors)[0]);
      if (field instanceof HTMLElement) field.focus();
      return;
    }
    setErrors({});
    setStatus('submitting');
    setErrorMessage('');
    try {
      await saveInvite(result.data);
      setStatus('success');
    } catch (error) {
      setStatus('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Something went wrong. Please try again.',
      );
    }
  }
  return (
    <>
      <PageMeta
        title="Get an invite"
        description="Make room for your next story. Request an invitation to Photosnap."
      />
      <section className="invite-page">
        <div className="invite-visual">
          <Photo
            name="create-and-share"
            alt="A traveller taking in the quiet of a mountain lake"
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
          />
          <div className="invite-visual-copy">
            <p className="eyebrow">Your perspective belongs here</p>
            <h1>Every great story starts with a moment.</h1>
            <p>
              Make space for yours. Join a community of people who see the world a little
              differently.
            </p>
          </div>
        </div>
        <div className="invite-form-section">
          <div className="invite-form">
            {status === 'success' ? (
              <div className="success-panel" role="status" tabIndex={-1}>
                <div className="success-symbol" aria-hidden="true">
                  ✓
                </div>
                <h2>You’re on the list.</h2>
                <p>
                  Your invitation request has been saved. Thank you for sharing your interest in
                  Photosnap.
                </p>
                <p>
                  This portfolio preview stores requests securely. It doesn’t send invitation emails
                  or process payments.
                </p>
                <ArrowLink to="/stories">Explore the stories</ArrowLink>
              </div>
            ) : (
              <>
                <p className="eyebrow mb-4">A new chapter</p>
                <h2>Get your invite.</h2>
                <p className="form-intro">
                  Leave a few details and find the right home for your photography. No card needed.
                </p>
                <form
                  ref={formRef}
                  method="post"
                  action="/api/invites"
                  onSubmit={submit}
                  noValidate
                  aria-busy={status === 'submitting'}
                >
                  <label className="field" htmlFor={`${formId}-name`}>
                    <span id={`${formId}-name-label`}>Your name</span>
                    <input
                      id={`${formId}-name`}
                      name="name"
                      aria-labelledby={`${formId}-name-label`}
                      autoComplete="name"
                      maxLength={80}
                      required
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? `${formId}-name-error` : undefined}
                      placeholder="Jamie Parker"
                    />
                    {errors.name && (
                      <small id={`${formId}-name-error`} className="field-error">
                        {errors.name}
                      </small>
                    )}
                  </label>
                  <label className="field" htmlFor={`${formId}-email`}>
                    <span id={`${formId}-email-label`}>Email address</span>
                    <input
                      id={`${formId}-email`}
                      name="email"
                      aria-labelledby={`${formId}-email-label`}
                      type="email"
                      autoComplete="email"
                      maxLength={254}
                      required
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? `${formId}-email-error` : undefined}
                      placeholder="you@example.com"
                    />
                    {errors.email && (
                      <small id={`${formId}-email-error`} className="field-error">
                        {errors.email}
                      </small>
                    )}
                  </label>
                  <div className="form-row">
                    <label className="field">
                      <span>Your plan</span>
                      <select
                        name="plan"
                        defaultValue={
                          plans.includes(initialPlan as InviteInput['plan'])
                            ? initialPlan!
                            : 'undecided'
                        }
                      >
                        <option value="undecided">Still exploring</option>
                        <option value="basic">Basic</option>
                        <option value="pro">Pro</option>
                        <option value="business">Business</option>
                      </select>
                    </label>
                    <label className="field">
                      <span>Billing preference</span>
                      <select
                        name="billing"
                        defaultValue={params.get('billing') === 'yearly' ? 'yearly' : 'monthly'}
                      >
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </label>
                  </div>
                  <div className="honeypot" aria-hidden="true">
                    <label>
                      Leave this empty
                      <input name="website" autoComplete="off" tabIndex={-1} defaultValue="" />
                    </label>
                  </div>
                  <label className="consent-label">
                    <input
                      name="consent"
                      type="checkbox"
                      required
                      aria-invalid={Boolean(errors.consent)}
                      aria-describedby={errors.consent ? `${formId}-consent-error` : undefined}
                    />
                    <span>
                      I agree to my details being stored for this invitation request, as explained
                      in the <Link to="/privacy">privacy notice</Link>.
                    </span>
                  </label>
                  {errors.consent && (
                    <p id={`${formId}-consent-error`} className="field-error mb-5">
                      {errors.consent}
                    </p>
                  )}
                  {status === 'error' && (
                    <div role="alert" className="form-alert">
                      {errorMessage}
                    </div>
                  )}
                  <button className="button" disabled={status === 'submitting'} type="submit">
                    {status === 'submitting' ? 'Saving your request…' : 'Request an invite'}
                  </button>
                  <p className="form-notice">
                    Portfolio preview: requests are saved. Email invitations and paid subscriptions
                    are not available.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export async function saveInvite(input: InviteInput) {
  const response = await fetch('/api/invites', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(12000),
  });
  const body = (await response.json().catch(() => null)) as { message?: string } | null;
  if (!response.ok)
    throw new Error(body?.message ?? 'We couldn’t save your request. Please try again.');
}
