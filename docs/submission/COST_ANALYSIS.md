# CIRO Cost Analysis

## OpenRouter Reasoning (Chat Completions)

| Call type | Model | Est. tokens/call | Calls per session | Est. cost/session |
|-----------|-------|-----------------|-------------------|-------------------|
| Allocation briefing | openrouter/owl-alpha or free | ~400 in / ~120 out | 1 | ~$0.001–$0.005 |
| Per-allocation reasoning | openrouter/owl-alpha or free | ~150 in / ~80 out | 3–6 | ~$0.001–$0.010 |
| Radio chatter line | openrouter/owl-alpha or free | ~80 in / ~40 out | 4–8 | ~$0.001–$0.005 |
| Recovery reasoning | openrouter/owl-alpha or free | ~100 in / ~60 out | 0–2 | ~$0.000–$0.003 |

**Total reasoning estimate: $0.003–$0.023 per session**

Free-tier models (e.g. `openrouter/auto`, `meta-llama/llama-3.1-8b-instruct:free`) reduce this to $0 within OpenRouter's free allowance.

## OpenRouter TTS (Speech Endpoint)

- TTS pricing: ~$0.000015 / character (varies by model)
- Cap: 200 chars/line × 20 lines/session = 4,000 chars max
- Max TTS cost: **~$0.06/session** (all speech enabled, no free model)
- Default: TTS disabled unless `OPENROUTER_TTS_MODEL` is set
- Fallback: captions shown when TTS fails, is capped, or is unconfigured

## Cost Controls

1. Per-line character truncation (200 chars max)
2. Per-session character cap (2,000 chars total)
3. In-memory cache deduplicates repeated lines
4. Settings toggle disables spoken radio entirely
5. 402/429/503 responses fall back to captions silently

## Summary

| Mode | Est. cost/session |
|------|-------------------|
| No backend (pure frontend fallback) | $0 |
| Reasoning only (no TTS) | $0–$0.023 |
| Reasoning + TTS (capped) | $0–$0.083 |
