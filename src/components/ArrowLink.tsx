import { Link, type LinkProps } from 'react-router-dom';
export function Arrow({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      width="43"
      height="14"
      viewBox="0 0 43 14"
      fill="none"
      aria-hidden="true"
    >
      <path d="M0 7h41m-6-6 7 6-7 6" stroke="currentColor" />
    </svg>
  );
}
export function ArrowLink({ children, className = '', ...props }: LinkProps) {
  return (
    <Link className={`arrow-link ${className}`} {...props}>
      <span>{children}</span>
      <Arrow />
    </Link>
  );
}
