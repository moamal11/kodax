/**
 * تحديات Node.js التي صارت تُشغَّل فعلياً بدل الفحص البنيوي.
 *
 * express و jsonwebtoken غير متوفرين على خادم التشغيل، لذلك يُحقن قبل كود المستخدم
 * بديل صغير في الذاكرة (NODE_WEB_PRELUDE) يحاكي ما تحتاجه هذه التحديات فقط:
 * تسجيل المسارات والـmiddleware، req/res، jwt.verify، وساعة يمكن التحكم بها.
 * الاختبارات ترسل طلبات فعلية للمسارات وتفحص الحالة والنتيجة — لا تبحث عن نصوص.
 *
 * ملاحظة: البديل يُدمج في سطر واحد، لذلك لا تستخدم تعليقات // داخله.
 */
import { t, h, type ChallengeFix } from './challengeFixHelpers';

export const NODE_WEB_PRELUDE = `
var __kx = (function () {
  var apps = [];
  var fakeNow = null;
  var RealDate = Date;
  function currentTime() { return fakeNow === null ? RealDate.now() : fakeNow; }
  function FakeDate() {
    var args = [].slice.call(arguments);
    if (!(this instanceof FakeDate)) return new RealDate(currentTime()).toString();
    if (args.length === 0) return new RealDate(currentTime());
    return new (Function.prototype.bind.apply(RealDate, [null].concat(args)))();
  }
  FakeDate.now = currentTime;
  FakeDate.parse = RealDate.parse;
  FakeDate.UTC = RealDate.UTC;
  FakeDate.prototype = RealDate.prototype;
  Date = FakeDate;
  var realSetInterval = setInterval;
  setInterval = function () { var tm = realSetInterval.apply(null, arguments); if (tm && tm.unref) tm.unref(); return tm; };
  if (!process.env.JWT_SECRET) process.env.JWT_SECRET = 'kodax-test-secret';
  function lower(obj) { var o = {}; Object.keys(obj || {}).forEach(function (k) { o[k.toLowerCase()] = obj[k]; }); return o; }
  function makeRes() {
    var res = { statusCode: 200, body: undefined, ended: false, headers: {} };
    res.status = function (c) { res.statusCode = c; return res; };
    res.json = function (b) { res.body = b; res.ended = true; return res; };
    res.send = function (b) { res.body = b; res.ended = true; return res; };
    res.sendStatus = function (c) { res.statusCode = c; res.ended = true; return res; };
    res.end = function () { res.ended = true; return res; };
    res.set = function (k, v) { res.headers[k] = v; return res; };
    res.setHeader = res.set;
    return res;
  }
  function matchPath(pattern, path) {
    var pp = String(pattern).split('/'), sp = path.split('/');
    if (pp.length !== sp.length) return null;
    var params = {};
    for (var i = 0; i < pp.length; i++) {
      if (pp[i].charAt(0) === ':') params[pp[i].slice(1)] = decodeURIComponent(sp[i]);
      else if (pp[i] !== sp[i]) return null;
    }
    return params;
  }
  function runChain(fns, req, res) {
    return new Promise(function (resolve, reject) {
      var i = 0, done = false;
      function finish(v) { if (!done) { done = true; resolve(v); } }
      function next(err) {
        if (done) return;
        if (err) { done = true; return reject(err); }
        var fn = fns[i++];
        if (!fn) return finish(true);
        var called = false;
        var wrapped = function (e) { called = true; next(e); };
        try {
          var out = fn(req, res, wrapped);
          if (out && typeof out.then === 'function') out.then(function () { if (res.ended && !called) finish(false); }, function (e) { done = true; reject(e); });
        } catch (e) { done = true; return reject(e); }
        if (res.ended && !called) return finish(false);
        setTimeout(function () { if (!called) finish(false); }, 100);
      }
      next();
    });
  }
  function express() {
    var stack = [];
    var app = { _stack: stack };
    ['get', 'post', 'put', 'patch', 'delete'].forEach(function (m) {
      app[m] = function (path) { stack.push({ method: m.toUpperCase(), path: path, handlers: [].slice.call(arguments, 1) }); return app; };
    });
    app.use = function (a) {
      var rest = [].slice.call(arguments, 1);
      if (typeof a === 'function') stack.push({ method: null, path: null, handlers: [a].concat(rest) });
      else stack.push({ method: null, path: a, handlers: rest });
      return app;
    };
    app.listen = function () { return { close: function () {} }; };
    apps.push(app);
    return app;
  }
  express.json = function () { return function (req, res, next) { next(); }; };
  express.urlencoded = express.json;
  var jwt = {
    verify: function (token, secret) {
      if (token === 'valid.token.123' && secret) return { id: 7, email: 'student@kodax.app' };
      var e = new Error('invalid token'); e.name = 'JsonWebTokenError'; throw e;
    },
    sign: function (payload) { return 'signed.' + JSON.stringify(payload); },
    decode: function () { return null; }
  };
  var mocks = { express: express, jsonwebtoken: jwt };
  var realRequire = require;
  require = function (name) { return Object.prototype.hasOwnProperty.call(mocks, name) ? mocks[name] : realRequire(name); };
  async function request(method, url, body, headers) {
    var app = apps[apps.length - 1];
    if (!app) throw new Error('لم يتم إنشاء تطبيق express');
    var path = url.split('?')[0];
    var req = { method: method, url: url, path: path, params: {}, query: {}, headers: lower(headers), ip: '127.0.0.1', body: body === undefined ? {} : JSON.parse(JSON.stringify(body)) };
    var res = makeRes();
    for (var i = 0; i < app._stack.length; i++) {
      var layer = app._stack[i];
      if (layer.method === null) { if (layer.path && path.indexOf(layer.path) !== 0) continue; }
      else { if (layer.method !== method) continue; var p = matchPath(layer.path, path); if (!p) continue; req.params = p; }
      var cont = await runChain(layer.handlers, req, res);
      if (!cont || res.ended) break;
    }
    return res.ended ? { status: res.statusCode, body: res.body } : { status: 404, body: undefined };
  }
  async function middleware(fn, reqInit) {
    var req = Object.assign({ headers: {}, ip: '127.0.0.1', body: {}, params: {}, query: {} }, reqInit || {});
    req.headers = lower(req.headers);
    var res = makeRes();
    var nextCalled = false;
    await new Promise(function (resolve) {
      var done = false;
      function fin() { if (!done) { done = true; resolve(); } }
      try {
        var out = fn(req, res, function () { nextCalled = true; fin(); });
        if (out && typeof out.then === 'function') out.then(fin, fin);
      } catch (e) { req.__error = String(e && e.message || e); fin(); }
      if (res.ended) fin();
      setTimeout(fin, 100);
    });
    return { next: nextCalled, status: res.ended ? res.statusCode : null, body: res.body, req: req };
  }
  return { req: request, mw: middleware, setNow: function (ms) { fakeNow = ms; } };
})()`;

const POST = (title: string) => `await __kx.req('POST', '/tasks', { title: '${title}' })`;

export const NODE_CHALLENGE_FIXES: Record<string, ChallengeFix> = {
  'backend-ch-1': {
    description:
      'REST API للمهام باستخدام Express (المصفوفة tasks في الذاكرة): GET /tasks يرجع كل المهام كمصفوفة، و POST /tasks يضيف مهمة من req.body بمعرّف رقمي فريد (id) ويرجع 201 مع المهمة، و PUT /tasks/:id يحدّث المهمة ويرجعها، و DELETE /tasks/:id يحذفها. PUT و DELETE يرجعان 404 إذا لم توجد المهمة.',
    validation: 'execution',
    checks: undefined,
    prelude: NODE_WEB_PRELUDE,
    // الحل الأصلي كان يرجع 204 عند حذف مهمة غير موجودة، بخلاف الوصف
    solution: `const express = require('express');
const app = express();
app.use(express.json());

let tasks = [];
let nextId = 1;

app.get('/tasks', (req, res) => {
  res.json(tasks);
});

app.post('/tasks', (req, res) => {
  const task = { id: nextId++, ...req.body, completed: false };
  tasks.push(task);
  res.status(201).json(task);
});

app.put('/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).json({ error: 'Not found' });
  Object.assign(task, req.body);
  res.json(task);
});

app.delete('/tasks/:id', (req, res) => {
  const index = tasks.findIndex(t => t.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Not found' });
  tasks.splice(index, 1);
  res.status(204).send();
});

app.listen(3000);`,
    testCases: [
      t(`${POST('تعلم Express')}; const r = await __kx.req('GET', '/tasks'); r.status + ' ' + r.body.length`, '200 1', 'إضافة مهمة ثم جلب القائمة'),
      t(`const r = ${POST('a')}; r.status + ' ' + r.body.title`, '201 a', 'POST يرجع 201 مع المهمة'),
      t(`const r = await __kx.req('PUT', '/tasks/999', { title: 'x' }); r.status`, '404', 'تحديث مهمة غير موجودة'),
      h(`const a = ${POST('a')}; const b = ${POST('b')}; typeof a.body.id === 'number' && a.body.id !== b.body.id`, 'true', 'معرّفات رقمية فريدة'),
      h(`const a = ${POST('a')}; const u = await __kx.req('PUT', '/tasks/' + a.body.id, { title: 'b' }); u.status + ' ' + u.body.title`, '200 b', 'تحديث مهمة موجودة'),
      h(`const a = ${POST('a')}; await __kx.req('DELETE', '/tasks/' + a.body.id); const r = await __kx.req('GET', '/tasks'); r.body.length`, '0', 'الحذف يزيل المهمة'),
      h(`const d = await __kx.req('DELETE', '/tasks/999'); d.status`, '404', 'حذف مهمة غير موجودة'),
    ],
  },

  'backend-ch-3': {
    description:
      'Middleware للمصادقة authMiddleware(req, res, next): اقرأ Header الـ Authorization، وارفض بـ 401 إذا لم يبدأ بـ "Bearer "، ثم تحقق من التوكن بـ jwt.verify(token, process.env.JWT_SECRET) من مكتبة jsonwebtoken داخل try/catch (401 إذا كان غير صالح)، وضع النتيجة في req.user ثم استدعِ next().',
    validation: 'execution',
    checks: undefined,
    prelude: NODE_WEB_PRELUDE,
    testCases: [
      t(`const r = await __kx.mw(authMiddleware, { headers: {} }); r.status + ' ' + r.next`, '401 false', 'بدون Header'),
      t(`const r = await __kx.mw(authMiddleware, { headers: { Authorization: 'Bearer valid.token.123' } }); r.next + ' ' + r.req.user.id`, 'true 7', 'توكن صالح ← next و req.user'),
      h(`const r = await __kx.mw(authMiddleware, { headers: { Authorization: 'Basic abc' } }); r.status + ' ' + r.next`, '401 false', 'نوع Header خاطئ'),
      h(`const r = await __kx.mw(authMiddleware, { headers: { Authorization: 'Bearer wrong' } }); r.status + ' ' + r.next`, '401 false', 'توكن غير صالح'),
      h(`const r = await __kx.mw(authMiddleware, { headers: { Authorization: 'valid.token.123' } }); r.status + ' ' + r.next`, '401 false', 'توكن بدون Bearer'),
    ],
  },

  'backend-ch-4': {
    description:
      'rateLimiter(maxRequests, windowMs) ترجع middleware: لكل IP (req.ip) تسمح بـ maxRequests طلبات خلال windowMs مللي ثانية من أول طلب في النافذة (باستدعاء next)، وبعدها ترجع 429 دون استدعاء next حتى تنتهي النافذة، ثم يبدأ العد من جديد.',
    validation: 'execution',
    checks: undefined,
    prelude: NODE_WEB_PRELUDE,
    testCases: [
      t(
        `const lim = rateLimiter(2, 60000); const a = await __kx.mw(lim, { ip: '1.1.1.1' }); const b = await __kx.mw(lim, { ip: '1.1.1.1' }); const c = await __kx.mw(lim, { ip: '1.1.1.1' }); [a.next, b.next, c.next, c.status].join(' ')`,
        'true true false 429',
        'الطلب الثالث يُرفض بـ 429'
      ),
      t(`const lim = rateLimiter(1, 60000); await __kx.mw(lim, { ip: 'a' }); const b = await __kx.mw(lim, { ip: 'b' }); b.next`, 'true', 'كل IP له عدّاده'),
      h(
        `__kx.setNow(1000000); const lim = rateLimiter(1, 60000); await __kx.mw(lim, { ip: 'a' }); const blocked = await __kx.mw(lim, { ip: 'a' }); __kx.setNow(1060001); const again = await __kx.mw(lim, { ip: 'a' }); blocked.status + ' ' + again.next`,
        '429 true',
        'بعد انتهاء النافذة يُسمح من جديد'
      ),
      h(
        `__kx.setNow(1000000); const lim = rateLimiter(1, 60000); await __kx.mw(lim, { ip: 'a' }); __kx.setNow(1030000); const r = await __kx.mw(lim, { ip: 'a' }); r.status + ' ' + r.next`,
        '429 false',
        'داخل النافذة يبقى محظوراً'
      ),
      h(
        `const lim = rateLimiter(3, 60000); const out = []; for (let i = 0; i < 4; i++) out.push((await __kx.mw(lim, { ip: 'x' })).next); out.join(' ')`,
        'true true true false',
        'الحد 3 طلبات'
      ),
    ],
  },
};
