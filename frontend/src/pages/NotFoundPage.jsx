import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="empty-page">
      <span className="eyebrow">404</span>
      <h1>Page not found</h1>
      <p>The page you requested does not exist.</p>
      <Link to="/" className="button">Go home</Link>
    </section>
  );
}
