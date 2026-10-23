import { Component, lazy, Suspense, type ReactNode } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import Home from './pages/Home';
const Stories = lazy(() => import('./pages/Stories'));
const Features = lazy(() => import('./pages/Features'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Invite = lazy(() => import('./pages/Invite'));
const Story = lazy(() => import('./pages/Story'));
const Privacy = lazy(() => import('./pages/Privacy'));
const NotFound = lazy(() => import('./pages/NotFound'));

class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <section className="not-found" role="alert">
        <h1>A moment out of focus.</h1>
        <p>We couldn’t load this page. Please reload to try again.</p>
        <a className="button" href="/">
          Return home
        </a>
      </section>
    ) : (
      this.props.children
    );
  }
}
export default function App() {
  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="loading-page" role="status">
            <span>Loading your next perspective</span>
            <span className="loading-line" />
          </div>
        }
      >
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="stories" element={<Stories />} />
            <Route path="stories/:slug" element={<Story />} />
            <Route path="features" element={<Features />} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="invite" element={<Invite />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
