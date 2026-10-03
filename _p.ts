import { getKnowledge } from './supabase/functions/ai-chat/core';
import { SmartResponder } from './supabase/functions/ai-chat/smart';
import { DEFAULT_LIVE_CONFIG } from './supabase/functions/ai-chat/kodax-facts';
import { tokenize, normalize } from './supabase/functions/ai-chat/text';
const s = new SmartResponder(getKnowledge());
const qs = process.argv.slice(2);
for (const q of qs) { const m = s.match(q, { mode:'general', hasHistory:false, hasContext:false, live: DEFAULT_LIVE_CONFIG }); console.log((m ? `${m.kind}:${m.id} (${m.confidence.toFixed(2)})` : '→ GEMINI').padEnd(40), '|', q.padEnd(28), '|', tokenize(q).join(',')); }
