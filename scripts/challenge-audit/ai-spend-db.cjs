const assert = require('node:assert/strict');
const { clients } = require('../dev/live-profile-client.cjs');
(async () => {
  const { admin, client } = clients();
  const denied = await client().rpc('ai_provider_spend_reserve', { p_micro_usd: 1, p_cap_micro_usd: 999999999 });
  assert(denied.error);
  const snapshot = await admin.from('ai_provider_spend').select('charged_micro_usd,reserved_micro_usd');
  if (snapshot.error) throw snapshot.error;
  const used = snapshot.data.reduce((s,r) => s + Number(r.charged_micro_usd ?? r.reserved_micro_usd), 0);
  const holds = [];
  try {
    const results = await Promise.all([1,2].map(() => admin.rpc('ai_provider_spend_reserve', { p_micro_usd: 100, p_cap_micro_usd: used + 100 })));
    results.forEach(r => { if (r.error) throw r.error; if (r.data) holds.push(r.data); });
    assert.equal(holds.length, 1);
    const id = holds[0];
    const first = await admin.rpc('ai_provider_spend_settle', { p_id: id, p_micro_usd: 0 }); if (first.error) throw first.error;
    await admin.rpc('ai_provider_spend_settle', { p_id: id, p_micro_usd: 90 });
    const row = await admin.from('ai_provider_spend').select('charged_micro_usd').eq('id',id).single();
    assert.equal(Number(row.data.charged_micro_usd),0);
    const capped = await admin.rpc('ai_provider_spend_reserve', { p_micro_usd: 3000000, p_cap_micro_usd: 2500000 });
    assert(!capped.error); assert.equal(capped.data, null);
    const uncapped = await admin.rpc('ai_provider_spend_reserve', { p_micro_usd: 3000000, p_cap_micro_usd: null });
    if (uncapped.error) throw uncapped.error;
    assert(uncapped.data); holds.push(uncapped.data);
    await admin.rpc('ai_provider_spend_settle', { p_id: uncapped.data, p_micro_usd: 0 });
    console.log('Anonymous denied, parallel cap atomic, settlement idempotent');
    console.log('Optional NULL cap permits requests above the old $2.50 ceiling');
  } finally { for (const id of holds) await admin.rpc('ai_provider_spend_settle', { p_id: id, p_micro_usd: 0 }); }
})().catch(e=>{console.error(e.message);process.exitCode=1;});
