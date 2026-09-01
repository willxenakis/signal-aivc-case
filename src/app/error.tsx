"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="error-state">
      <div className="brand-mark" aria-hidden="true">
        S
      </div>
      <h1>Signal lost</h1>
      <p>The triage workspace could not be loaded.</p>
      <button className="button button-primary" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
