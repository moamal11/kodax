/**
 * تحديات Node.js المُشغَّلة: الحل النموذجي وحلول خاطئة وبدائل صحيحة على Wandbox الحقيقي
 * (نفس خادم التشغيل الذي يستخدمه التطبيق والسيرفر).
 * التشغيل: npx tsx scripts/challenge-audit/node-exec.test.ts
 */
import { ALL_CHALLENGES } from '../../src/constants/courseData';
import { validateChallenge } from '../../src/services/challengeValidator';

type Case = { id: string; why: string; code?: string; accept: boolean; kind?: string };
const CASES: Case[] = [
  { id: 'backend-ch-1', why: 'الحل النموذجي', accept: true },
  { id: 'backend-ch-3', why: 'الحل النموذجي', accept: true },
  { id: 'backend-ch-4', why: 'الحل النموذجي', accept: true },
  {
    id: 'backend-ch-1',
    why: 'الحل الأصلي القديم: DELETE يرجع 204 حتى لو لم توجد المهمة',
    accept: false,
    code: `const express = require('express');
const app = express();
app.use(express.json());
let tasks = []; let nextId = 1;
app.get('/tasks', (req, res) => res.json(tasks));
app.post('/tasks', (req, res) => { const t = { id: nextId++, ...req.body }; tasks.push(t); res.status(201).json(t); });
app.put('/tasks/:id', (req, res) => { const t = tasks.find(x => x.id === +req.params.id); if (!t) return res.status(404).json({}); Object.assign(t, req.body); res.json(t); });
app.delete('/tasks/:id', (req, res) => { tasks = tasks.filter(x => x.id !== +req.params.id); res.status(204).send(); });
app.listen(3000);`,
  },
  {
    id: 'backend-ch-1',
    why: 'مسارات موجودة بالأسماء الصحيحة لكن POST يرجع 200 ولا يحفظ',
    accept: false,
    code: `const express = require('express');
const app = express();
let tasks = [];
app.get('/tasks', (req, res) => res.json(tasks));
app.post('/tasks', (req, res) => res.json(req.body));
app.put('/tasks/:id', (req, res) => res.status(404).json({}));
app.delete('/tasks/:id', (req, res) => res.status(404).json({}));
app.listen(3000);`,
  },
  {
    id: 'backend-ch-1',
    why: 'حل صحيح بأسلوب مختلف (Map و router functions)',
    accept: true,
    code: `const express = require('express');
const app = express();
app.use(express.json());
const tasks = new Map();
let seq = 0;
function list(req, res) { res.json([...tasks.values()]); }
function create(req, res) { const id = ++seq; const task = { id, ...req.body }; tasks.set(id, task); res.status(201).json(task); }
function update(req, res) { const id = Number(req.params.id); if (!tasks.has(id)) return res.sendStatus(404); const t = { ...tasks.get(id), ...req.body }; tasks.set(id, t); res.json(t); }
function remove(req, res) { const id = Number(req.params.id); if (!tasks.delete(id)) return res.sendStatus(404); res.json({ ok: true }); }
app.get('/tasks', list); app.post('/tasks', create); app.put('/tasks/:id', update); app.delete('/tasks/:id', remove);
app.listen(3000);`,
  },
  {
    id: 'backend-ch-3',
    why: 'يتحقق من وجود Bearer فقط بدون jwt.verify',
    accept: false,
    code: `const authMiddleware = (req, res, next) => {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer ')) return res.status(401).json({ error: 'x' });
  req.user = { token: h.slice(7) };
  next();
};
module.exports = authMiddleware;`,
  },
  {
    id: 'backend-ch-3',
    why: 'حل صحيح بأسلوب مختلف (regex + async)',
    accept: true,
    code: `const jwt = require('jsonwebtoken');
async function authMiddleware(req, res, next) {
  const match = /^Bearer (.+)$/.exec(req.headers.authorization || '');
  if (!match) return res.status(401).send('unauthorized');
  try { req.user = jwt.verify(match[1], process.env.JWT_SECRET); return next(); }
  catch { return res.status(401).send('invalid'); }
}
module.exports = authMiddleware;`,
  },
  {
    id: 'backend-ch-4',
    why: 'لا يعيد العد بعد انتهاء النافذة',
    accept: false,
    code: `const rateLimiter = (maxRequests, windowMs) => {
  const requests = new Map();
  return (req, res, next) => {
    const n = (requests.get(req.ip) || 0) + 1;
    requests.set(req.ip, n);
    if (n > maxRequests) return res.status(429).json({ error: 'too many' });
    next();
  };
};`,
  },
  {
    id: 'backend-ch-4',
    why: 'عدّاد واحد لكل الـIPs',
    accept: false,
    code: `const rateLimiter = (maxRequests, windowMs) => {
  let count = 0; let start = Date.now();
  return (req, res, next) => {
    if (Date.now() - start > windowMs) { count = 0; start = Date.now(); }
    if (++count > maxRequests) return res.status(429).end();
    next();
  };
};`,
  },
  {
    id: 'backend-ch-4',
    why: 'حل صحيح يستخدم new Date().getTime() بدل Date.now()',
    accept: true,
    code: `function rateLimiter(maxRequests, windowMs) {
  const hits = {};
  return function (req, res, next) {
    const now = new Date().getTime();
    const entry = hits[req.ip];
    if (!entry || now - entry.start > windowMs) { hits[req.ip] = { start: now, count: 1 }; return next(); }
    if (entry.count >= maxRequests) return res.status(429).json({ message: 'slow down' });
    entry.count += 1;
    next();
  };
}`,
  },
  {
    id: 'backend-ch-1',
    why: 'خطأ كتابة في السطر 5 ← رقم السطر الصحيح',
    accept: false,
    kind: 'syntax_error',
    code: `const express = require('express');
const app = express();
let tasks = [];
app.get('/tasks', (req, res) => res.json(tasks));
app.post('/tasks', (req, res) => { res.status(201).json( });
app.listen(3000);`,
  },
];

(async () => {
  let ok = 0;
  for (const cs of CASES) {
    const c: any = ALL_CHALLENGES.find((x) => x.id === cs.id);
    const r = await validateChallenge(cs.code ?? c.solution, c.starterCode, c.language, c.testCases, {
      checks: c.checks,
      entryFunction: c.entryFunction,
      validation: c.validation,
      prelude: c.prelude,
    });
    const first = r.results.find((x) => !x.passed);
    let pass = cs.accept ? r.allPassed : !r.allPassed && !r.serviceError;
    if (pass && cs.kind && first?.kind !== cs.kind) pass = false;
    if (pass) ok++;
    console.log(`${pass ? 'OK  ' : 'FAIL'} ${cs.accept ? 'قبول' : 'رفض '} ${cs.id} — ${cs.why} → ${r.passedTests}/${r.totalTests}${first ? ` kind=${first.kind} "${first.message.slice(0, 80)}"` : ''}${r.serviceError ? ' [service error]' : ''}`);
  }
  console.log(`\n${ok}/${CASES.length} passed (Wandbox)`);
  if (ok !== CASES.length) process.exitCode = 1;
})();
