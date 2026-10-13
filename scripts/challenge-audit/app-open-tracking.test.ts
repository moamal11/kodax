import assert from 'node:assert/strict';
import { createAppOpenTracker } from '../../src/services/appOpenTracker';
import { appOpenTime } from '../../kodax-admin/src/lib/appOpenTime';

async function main() {
  let calls = 0;
  const completions: Array<() => void> = [];
  const tracker = createAppOpenTracker(() => {
    calls++;
    return new Promise<void>(resolve => completions.push(resolve));
  });
  tracker.setActive(false);
  assert.equal(calls,0,'Hidden/background initialization is not an opening');
  tracker.setActive(true);
  tracker.setActive(true);
  assert.equal(calls,1,'Duplicate active events and token refreshes do not send another request');
  tracker.setActive(false);
  tracker.setActive(true);
  assert.equal(calls,1,'Requests do not overlap');
  completions.shift()!();
  await Promise.resolve();
  assert.equal(calls,2,'An actual reentry while a request is pending gets recorded');
  tracker.stop();
  completions.shift()!();
  await Promise.resolve();
  tracker.setActive(false); tracker.setActive(true);
  assert.equal(calls,2,'Sign-out/unmount stops tracking');
  let failedCalls=0;
  const failing = createAppOpenTracker(async () => { failedCalls++; throw Error('Offline'); });
  failing.setActive(true);
  await Promise.resolve();
  failing.setActive(false); failing.setActive(true);
  await Promise.resolve();
  assert.equal(failedCalls,2,'Optional telemetry failure does not disable the next opening');
  failing.stop();
  const now = Date.parse('2026-10-13T12:00:00Z');
  const ago = (minutes: number) => appOpenTime(new Date(now-minutes*60000).toISOString(),now);
  assert.equal(appOpenTime(null,now),'غير مسجّل بعد');
  assert.equal(appOpenTime('invalid',now),'—');
  assert.equal(ago(0),'قبل أقل من دقيقة');
  assert.match(ago(5),/دقائق/);
  assert.match(ago(120),/ساعتين/);
  assert.match(ago(4320),/أيام/);
  assert.match(ago(43200),/يوم/);
  for (const n of [0,0.5,1,5,120,4320,43200]) assert.doesNotMatch(ago(n),/ثانية|ثوان|الآن|متصل/);
  console.log('PASS: foreground-only tracking, deduplication, reentry, sign-out cleanup, offline resilience and coarse elapsed time');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
