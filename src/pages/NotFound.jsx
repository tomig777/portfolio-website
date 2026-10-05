import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="not-found-page">
      <p className="not-found-kicker">404 / NOT FOUND</p>
      <h1>Lost in orbit.</h1>
      <p>This page isn’t here, but there’s plenty to explore.</p>
      <nav className="not-found-actions" aria-label="Page recovery">
        <Link to="/">Back home</Link>
        <Link to="/projects">Open extras</Link>
      </nav>
    </main>
  );
}
