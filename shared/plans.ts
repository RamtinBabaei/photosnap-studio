export const plans = ['basic', 'pro', 'business', 'undecided'] as const;
export const planDetails = [
  {
    id: 'basic',
    name: 'Basic',
    monthly: 19,
    yearly: 190,
    description:
      'Includes basic usage of our platform. Recommended for new and aspiring photographers.',
  },
  {
    id: 'pro',
    name: 'Pro',
    monthly: 39,
    yearly: 390,
    description:
      'More advanced features available. Recommended for photography veterans and professionals.',
  },
  {
    id: 'business',
    name: 'Business',
    monthly: 99,
    yearly: 990,
    description:
      'Additional features available such as more detailed metrics. Recommended for business owners.',
  },
] as const;
