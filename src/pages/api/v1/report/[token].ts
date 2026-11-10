import type { APIRoute } from 'astro';
import { signR2Path } from '@/lib/auth';
import { getReportByToken, updateReport } from '@/lib/db';
import { error, json } from '@/lib/http';
import { reportPublicError } from '@/lib/report-state';

export const prerender = false;

const SIGNED_URL_TTL_MS = 10 * 60 * 1000;

export const GET: APIRoute = async ({ params, locals }) => {
  const env = locals.runtime.env;
  const token = params.token ?? '';
  if (!/^rep_[0-9a-f]{32}$/.test(token)) return error(400, 'invalid_token', 'Bad token');
  const report = await getReportByToken(env.DB, token);
  if (!report) return error(404, 'not_found', 'Report not found');

  let fileUrl: string | null = null;
  if (report.status === 'ready' && report.r2_key) {
    fileUrl = await signR2Path(report.r2_key, Date.now() + SIGNED_URL_TTL_MS, env.TOKEN_SIGNING_KEY ?? 'dev-signing-key');
    if (!report.first_viewed_at) await updateReport(env.DB, report.id, { first_viewed_at: new Date().toISOString() });
  }

  return json(
    {
      token: report.public_token,
      status: report.status,
      product: report.product,
      createdAt: report.created_at,
      updatedAt: report.updated_at,
      paidAt: report.paid_at,
      deliveredAt: report.delivered_at,
      fileUrl,
      error: reportPublicError(report.status),
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
};
