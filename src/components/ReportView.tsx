import { useEffect, useState } from 'react';
import type { ReportContent } from '../lib/schema';

interface Status {
  status: string;
  fileUrl: string | null;
  error: string | null;
  product: string;
}

export default function ReportView({ token }: { token: string }) {
  const [status, setStatus] = useState<Status | null>(null);
  const [report, setReport] = useState<ReportContent | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let stopped = false;
    let attempts = 0;
    const poll = async () => {
      try {
        const res = await fetch(`/api/v1/report/${token}`, { cache: 'no-store' });
        if (!res.ok) {
          setErr('Report not found.');
          return;
        }
        const s = (await res.json()) as Status;
        if (stopped) return;
        setStatus(s);
        if (s.status === 'ready' && s.fileUrl) {
          const r = await fetch(s.fileUrl);
          if (r.ok) setReport((await r.json()) as ReportContent);
          return;
        }
        if (['failed', 'refunded'].includes(s.status)) return;
        if (attempts++ < 120) setTimeout(poll, 5000);
      } catch {
        if (!stopped) setErr('Network error. Reload to try again.');
      }
    };
    void poll();
    return () => {
      stopped = true;
    };
  }, [token]);

  if (err) return <p className="error">{err}</p>;
  if (!status) return <p className="muted">Loading…</p>;

  if (status.status === 'pending_payment') return <p className="card">Waiting for payment confirmation. If you completed checkout, this usually updates within a few seconds.</p>;
  if (status.status === 'paid' || status.status === 'generating')
    return (
      <div className="card" aria-live="polite">
        <p><strong>Payment received.</strong> Your report is being written now — this usually takes under a minute.</p>
        <p className="muted small">If it is not ready within 10 minutes, it is refunded automatically. You can close this tab and come back to this link later.</p>
      </div>
    );
  if (status.status === 'failed' || status.status === 'refunded')
    return (
      <div className="card">
        <p className="error">{status.error ?? 'This order was refunded.'}</p>
        <p className="muted small">Contact support@tarot-tools.example.com with this link if you need help.</p>
      </div>
    );
  if (!report) return <p className="muted">Opening your report…</p>;

  return (
    <article className="card prose">
      <h2 style={{ marginTop: 0 }}>{report.title}</h2>
      <p className="muted small">{report.generator === 'ai' ? `AI-assisted (Cloudflare Workers AI, ${report.model ?? 'model'})` : 'Rules-based edition'} · Entertainment only</p>
      <p>{report.introduction}</p>
      {report.cards.map((c, i) => (
        <section key={i}>
          <h3>
            {c.position}: {c.name} ({c.orientation})
          </h3>
          <p>{c.interpretation}</p>
        </section>
      ))}
      <h3>Bringing it together</h3>
      <p>{report.synthesis}</p>
      <h3>Next steps</h3>
      <ul>
        {report.actions.map((a, i) => (
          <li key={i}>{a}</li>
        ))}
      </ul>
      <h3>Reflection prompt</h3>
      <p>{report.reflection}</p>
      <p className="muted small">{report.disclaimer}</p>
    </article>
  );
}
