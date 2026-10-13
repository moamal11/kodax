/** Only foreground entries count; token refreshes and background work do not. */
export function createAppOpenTracker(record: () => Promise<unknown>) {
  let active = false;
  let stopped = false;
  let running = false;
  let pending = false;

  const send = async () => {
    if (stopped || !active) return;
    if (running) { pending = true; return; }
    running = true;
    try {
      await record();
    } catch {
      // Optional telemetry must never interfere with opening the application.
    } finally {
      running = false;
      if (pending && !stopped && active) {
        pending = false;
        void send();
      }
    }
  };

  return {
    setActive(next: boolean) {
      if (stopped || active === next) return;
      active = next;
      if (active) void send();
      else pending = false;
    },
    stop() { stopped = true; pending = false; },
  };
}
