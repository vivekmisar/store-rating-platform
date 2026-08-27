import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <section className="hero">
      <div className="hero-copy">
        <span className="eyebrow">Honest feedback, better choices</span>
        <h1>Find stores worth coming back to.</h1>
        <p>
          A full-stack store rating platform built with React, Express, and PostgreSQL. Browse
          registered stores, share a rating from 1 to 5, and manage feedback through focused
          user, owner, and administrator workflows.
        </p>
        <div className="hero-actions">
          <Link to="/register" className="button">Get started</Link>
          <Link to="/login" className="button button-secondary">Sign in</Link>
        </div>
      </div>
      <div className="hero-panel">
        <article className="mini-card">
          <span className="mini-card-mark">01</span>
          <div><strong>Discover with clarity</strong><span>Browse stores by name or location and see their community rating at a glance.</span></div>
        </article>
        <article className="mini-card">
          <span className="mini-card-mark">02</span>
          <div><strong>Share what you think</strong><span>Submit a rating when it matters, then update it whenever your experience changes.</span></div>
        </article>
        <article className="mini-card">
          <span className="mini-card-mark">03</span>
          <div><strong>Keep feedback useful</strong><span>Store owners can follow customer sentiment and understand their average rating.</span></div>
        </article>
      </div>
    </section>
  );
}
