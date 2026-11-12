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
    WAFFO_MERCHANT_ID?: string;
    WAFFO_PRIVATE_KEY?: string;
    WAFFO_WEBHOOK_PUBLIC_KEY?: string;
    WAFFO_PRODUCT_SINGLE?: string;
    WAFFO_PRODUCT_THREE?: string;
    IP_HASH_SALT?: string;
    TOKEN_SIGNING_KEY?: string;
    MINILYTICS_API_KEY?: string;
    CF_ACCESS_TEAM_DOMAIN?: string;
    CF_ACCESS_AUD?: string;
  }

  namespace App {
    interface Locals extends Runtime<Env> {
      requestId: string;
    }
  }

  interface MinilyticsApi {
    (command: 'goal' | 'track' | 'identify' | 'pageview', name?: string, props?: Record<string, unknown>): void;
    attribution?: () => Record<string, string>;
  }

  interface Window {
    minilytics?: MinilyticsApi;
  }
}

type Runtime<E> = import('@astrojs/cloudflare').Runtime<E>;

export {};
