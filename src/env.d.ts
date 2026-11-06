/// <reference types="astro/client" />
/// <reference types="@cloudflare/workers-types" />

import type { ReportQueueMessage } from './lib/schema';

declare global {
  interface Env {
    ASSETS: Fetcher;
    DB: D1Database;
    CACHE: KVNamespace;
    MEDIA: R2Bucket;
    IMAGES: ImagesBinding;
    AI: Ai;
    REPORT_QUEUE: Queue<ReportQueueMessage>;
    REPORT_WORKFLOW: Workflow;
    EVENTS: AnalyticsEngineDataset;
    ENVIRONMENT: 'local' | 'preview' | 'production';
    SITE_URL: string;
    AI_GATEWAY_ID: string;
    AI_MODEL: string;
    REPORT_PRICE_SINGLE_CENTS: string;
    REPORT_PRICE_THREE_CENTS: string;
    TURNSTILE_SECRET_KEY?: string;
    PUBLIC_TURNSTILE_SITE_KEY?: string;
    STRIPE_SECRET_KEY?: string;
    STRIPE_WEBHOOK_SECRET?: string;
    IP_HASH_SALT?: string;
    TOKEN_SIGNING_KEY?: string;
    CF_ACCESS_TEAM_DOMAIN?: string;
    CF_ACCESS_AUD?: string;
  }

  namespace App {
    interface Locals extends Runtime<Env> {
      requestId: string;
    }
  }
}

type Runtime<E> = import('@astrojs/cloudflare').Runtime<E>;

export {};
