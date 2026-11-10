import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { extractModelText, generateAiReport } from '../src/lib/ai';
import { drawCards } from '../src/lib/draw';
import { ALL_CARDS, getCard } from '../src/data/cards';
import { buildRulesReport } from '../src/lib/interpretation';

const model = '@cf/deepseek-ai/deepseek-v4.1-flash-1017';

describe('DeepSeek Flash report integration', () => {
  it('uses the Cloudflare-hosted DeepSeek model in both environments', () => {
    const config = readFileSync(new URL('../wrangler.jsonc', import.meta.url), 'utf8');
    expect(config.match(/@cf\/deepseek-ai\/deepseek-v4\.1-flash-1017/g)).toHaveLength(2);
    expect(config).not.toContain('@cf/meta/llama-3.3-70b-instruct-fp8-fast');
  });

  it('reads OpenAI-compatible chat-completion content', () => {
    expect(extractModelText({ choices: [{ message: { content: '{"title":"A reading"}' } }] })).toContain('A reading');
    expect(extractModelText({ choices: [{ message: { content: [{ type: 'text', text: '{"ok":true}' }] } }] })).toBe('{"ok":true}');
  });

  it('retains support for legacy and structured JSON response formats', () => {
    expect(extractModelText({ response: '{"ok":true}' })).toBe('{"ok":true}');
    expect(extractModelText({ response: { ok: true } })).toBe('{"ok":true}');
    expect(() => extractModelText({ choices: [] })).toThrow('did not include generated text');
  });

  it('runs DeepSeek without reasoning and validates the complete report', async () => {
    const drawn = drawCards(ALL_CARDS, 'three-card');
    const example = buildRulesReport(drawn, getCard, 'three-card', 'love');
    let request: Record<string, unknown> | undefined;
    const ai = { run: async (name: string, options: Record<string, unknown>) => {
      expect(name).toBe(model);
      request = options;
      return { choices: [{ message: { content: JSON.stringify(example) } }] };
    } };
    const result = await generateAiReport(
      { AI: ai as unknown as Ai, AI_GATEWAY_ID: '', AI_MODEL: model },
      { drawn, lookup: getCard, spread: 'three-card', questionType: 'love', userSummary: null },
    );
    expect(request?.reasoning_effort).toBe('none');
    expect(request?.max_completion_tokens).toBe(4096);
    expect(result.generator).toBe('ai');
    expect(result.model).toBe(model);
    expect(result.cards[0]!.name).toBe(drawn[0]!.name);
  });
});
