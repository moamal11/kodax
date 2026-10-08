/**
 * طبقة المكافآت: شرارات XP تطير من مكان الإنجاز إلى عداد XP، فيرتفع الرقم والشريط مع وصولها،
 * ولحظة احتفال قصيرة عند عبور مستوى جديد.
 *
 * - القيم من السيرفر فقط: celebrate({ xpBefore, xpAfter }) يُستدعى بقيم رد السيرفر (xp_awarded / xp).
 * - لا تكرار: كل مكافأة لها key (مثلاً lesson:py-7) تُعرض مرة واحدة في الجلسة، والسيرفر أصلاً
 *   يرجع xp_awarded = 0 للمكتمل سابقاً.
 * - لا تحجب شيئاً: الطبقة pointerEvents="none" فوق التطبيق؛ زر المتابعة يبقى متاحاً.
 * - تقليل الحركة: بلا شرارات؛ الرقم يتحدث مباشرة وتظهر بطاقة المستوى ثابتة.
 * - التمرير/تغيير الحجم: مصدر الشرارات يُقاس لحظة الإطلاق، والهدف يُعاد قياسه عند تغيير الحجم أثناء الطيران.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Dimensions, Platform, View, type View as RNView } from 'react-native';
import Animated, { Easing, FadeIn, FadeOut, runOnJS, useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming, type SharedValue } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useReducedMotion, Text, Row } from '@/design';
import { formatXp, levelForXp } from './level';

type Rect = { x: number; y: number; w: number; h: number };
type TargetRef = React.RefObject<RNView | null>;

type Celebrate = {
  /** معرّف فريد للإنجاز (lesson:<id>، challenge:<id>) */
  key: string;
  xpBefore: number;
  xpAfter: number;
  /** العنصر الذي تنطلق منه الشرارات (بطاقة النتيجة) */
  sourceRef?: TargetRef;
};

type Ctx = {
  /** XP المعروض أثناء الاحتفال (null = اعرض قيمة الملف الشخصي) */
  displayXp: number | null;
  /** يزيد مع وصول كل شرارة (لنبضة العداد) */
  arrival: number;
  levelUp: { level: number; id: number } | null;
  celebrate: (c: Celebrate) => boolean;
  registerTarget: (ref: TargetRef) => () => void;
};

const RewardCtx = createContext<Ctx | null>(null);
const celebrated = new Set<string>();

/** متى تهدأ طبقة المكافآت (لتأجيل إعلانات أخرى كالشارات حتى لا تتداخل) */
let quietAt = 0;
const keepBusy = (ms: number) => {
  quietAt = Math.max(quietAt, Date.now() + ms);
};
export const msUntilRewardsQuiet = () => Math.max(0, quietAt - Date.now());

const measure = (ref?: TargetRef | null) =>
  new Promise<Rect | null>((resolve) => {
    const node: any = ref?.current;
    if (!node?.measureInWindow) return resolve(null);
    try {
      node.measureInWindow((x: number, y: number, w: number, h: number) => resolve(w || h ? { x, y, w, h } : null));
    } catch {
      resolve(null);
    }
  });

type Flight = { id: number; from: { x: number; y: number }; count: number; award: number; xpBefore: number; hasSource: boolean };

export function RewardProvider({ children, profileXp }: { children: React.ReactNode; profileXp: number | null | undefined }) {
  const reduced = useReducedMotion();
  const [displayXp, setDisplayXp] = useState<number | null>(null);
  const [arrival, setArrival] = useState(0);
  const [levelUp, setLevelUp] = useState<Ctx['levelUp']>(null);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [ghost, setGhost] = useState(false);
  const targets = useRef<TargetRef[]>([]);
  const toX = useSharedValue(0);
  const toY = useSharedValue(0);
  const shown = useRef(0);
  const finalXp = useRef(0);
  const arrived = useRef(0);
  const flightRef = useRef<Flight | null>(null);

  const registerTarget = useCallback((ref: TargetRef) => {
    targets.current.push(ref);
    return () => {
      targets.current = targets.current.filter((r) => r !== ref);
    };
  }, []);

  const currentTarget = () => targets.current[targets.current.length - 1];

  const aimAtTarget = useCallback(async () => {
    const r = await measure(currentTarget());
    if (r) {
      toX.value = r.x + r.w / 2;
      toY.value = r.y + r.h / 2;
      return true;
    }
    return false;
  }, []);

  // إعادة القياس عند تغيير الحجم أثناء الطيران
  useEffect(() => {
    if (!flight) return;
    const sub = Dimensions.addEventListener('change', () => {
      aimAtTarget();
    });
    return () => sub.remove();
  }, [flight, aimAtTarget]);

  // بعد تحديث الملف الشخصي من السيرفر نعود لقيمته
  useEffect(() => {
    if (displayXp != null && !flight && profileXp != null && profileXp >= finalXp.current) {
      const t = setTimeout(() => setDisplayXp(null), 400);
      return () => clearTimeout(t);
    }
  }, [profileXp, displayXp, flight]);

  const setShown = useCallback((xp: number) => {
    const prevLevel = levelForXp(shown.current);
    shown.current = xp;
    setDisplayXp(xp);
    const lv = levelForXp(xp);
    if (lv > prevLevel) {
      keepBusy(2800);
      setLevelUp({ level: lv, id: Date.now() });
      AccessibilityInfo.announceForAccessibility?.(`مستوى جديد: المستوى ${lv}`);
    }
  }, []);

  const celebrate = useCallback(
    (c: Celebrate) => {
      if (celebrated.has(c.key) || !(c.xpAfter > c.xpBefore)) return false;
      celebrated.add(c.key);
      keepBusy(2200);
      const award = c.xpAfter - c.xpBefore;
      shown.current = c.xpBefore;
      finalXp.current = c.xpAfter;
      setDisplayXp(c.xpBefore);
      AccessibilityInfo.announceForAccessibility?.(`حصلت على ${award} نقطة خبرة`);
      (async () => {
        if (reduced) {
          setTimeout(() => setShown(c.xpAfter), 250);
          return;
        }
        let hasTarget = await aimAtTarget();
        if (!hasTarget) {
          // لا يوجد عداد XP على الشاشة: عداد عائم مؤقت أعلى الشاشة
          setGhost(true);
          await new Promise((r) => setTimeout(r, 60));
          hasTarget = await aimAtTarget();
        }
        const src = await measure(c.sourceRef);
        const { width, height } = Dimensions.get('window');
        const from = src ? { x: src.x + src.w / 2, y: src.y + src.h / 2 } : { x: width / 2, y: height * 0.6 };
        if (!hasTarget) {
          setShown(c.xpAfter);
          return;
        }
        const count = Math.max(6, Math.min(14, Math.round(award / 15)));
        const f = { id: Date.now(), from, count, award, xpBefore: c.xpBefore, hasSource: !!src };
        arrived.current = 0;
        flightRef.current = f;
        setFlight(f);
      })();
      return true;
    },
    [reduced, aimAtTarget, setShown]
  );

  const onArrive = useCallback(() => {
    const f = flightRef.current;
    if (!f) return;
    arrived.current += 1;
    const k = arrived.current;
    setShown(k >= f.count ? f.xpBefore + f.award : f.xpBefore + Math.round((f.award * k) / f.count));
    setArrival((a) => a + 1);
    if (k >= f.count) {
      flightRef.current = null;
      setFlight(null);
      setTimeout(() => setGhost(false), 1400);
    }
  }, [setShown]);

  useEffect(() => {
    if (!levelUp) return;
    const t = setTimeout(() => setLevelUp(null), reduced ? 3200 : 2400);
    return () => clearTimeout(t);
  }, [levelUp, reduced]);

  const value = useMemo<Ctx>(() => ({ displayXp, arrival, levelUp, celebrate, registerTarget }), [displayXp, arrival, levelUp, celebrate, registerTarget]);

  return (
    <RewardCtx.Provider value={value}>
      <View style={{ flex: 1 }}>
        {children}
        <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
          {ghost && <GhostMeter xp={displayXp ?? profileXp ?? 0} registerTarget={registerTarget} />}
          {flight && <Sparks key={flight.id} flight={flight} toX={toX} toY={toY} onArrive={onArrive} />}
          {levelUp && <LevelUpBurst key={levelUp.id} level={levelUp.level} toX={toX} toY={toY} reduced={reduced} />}
        </View>
      </View>
    </RewardCtx.Provider>
  );
}

export function useRewards(): Ctx {
  const c = useContext(RewardCtx);
  if (!c) return { displayXp: null, arrival: 0, levelUp: null, celebrate: () => false, registerTarget: () => () => undefined };
  return c;
}

/* ------------------------------------------------------------------ */

function Sparks({ flight, toX, toY, onArrive }: { flight: Flight; toX: SharedValue<number>; toY: SharedValue<number>; onArrive: () => void }) {
  const t = useTheme();
  return (
    <>
      {!flight.hasSource && <FloatingAward x={flight.from.x} y={flight.from.y} award={flight.award} />}
      {Array.from({ length: flight.count }).map((_, i) => (
        <Spark key={i} i={i} from={flight.from} toX={toX} toY={toY} onArrive={onArrive} color={i % 3 === 0 ? t.colors.brandText : t.colors.xp} />
      ))}
    </>
  );
}

function Spark({ i, from, toX, toY, onArrive, color }: { i: number; from: { x: number; y: number }; toX: SharedValue<number>; toY: SharedValue<number>; onArrive: () => void; color: string }) {
  const p = useSharedValue(0);
  // انتشار مختلف لكل شرارة حتى لا تطير كخط واحد
  const spread = useMemo(() => ({ dx: ((i * 37) % 90) - 45, dy: 50 + ((i * 53) % 70), size: 7 + (i % 3) * 2 }), [i]);
  useEffect(() => {
    p.value = withDelay(
      120 + i * 55,
      withTiming(1, { duration: 640, easing: Easing.bezier(0.25, 0.6, 0.3, 1) }, (done) => {
        if (done) runOnJS(onArrive)();
      })
    );
  }, []);
  const st = useAnimatedStyle(() => {
    const k = p.value;
    const tx = toX.value;
    const ty = toY.value;
    const cx = (from.x + tx) / 2 + spread.dx;
    const cy = Math.min(from.y, ty) - spread.dy;
    const x = (1 - k) * (1 - k) * from.x + 2 * (1 - k) * k * cx + k * k * tx;
    const y = (1 - k) * (1 - k) * from.y + 2 * (1 - k) * k * cy + k * k * ty;
    const scale = k < 0.15 ? 0.4 + k * 4 : 1 - (k - 0.15) * 0.55;
    return { opacity: k === 0 ? 0 : k > 0.92 ? (1 - k) * 12 : 1, transform: [{ translateX: x - spread.size / 2 }, { translateY: y - spread.size / 2 }, { scale }] };
  });
  return (
    <Animated.View
      style={[
        { position: 'absolute', left: 0, top: 0, width: spread.size, height: spread.size, borderRadius: spread.size / 2, backgroundColor: color },
        Platform.OS === 'web' ? ({ boxShadow: `0 0 10px ${color}` } as any) : null,
        st,
      ]}
    />
  );
}

function FloatingAward({ x, y, award }: { x: number; y: number; award: number }) {
  const t = useTheme();
  const k = useSharedValue(0);
  useEffect(() => {
    k.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) });
  }, []);
  const st = useAnimatedStyle(() => ({ opacity: k.value < 0.2 ? k.value * 5 : 1 - (k.value - 0.2) / 0.8, transform: [{ translateY: -k.value * 36 }] }));
  return (
    <Animated.View style={[{ position: 'absolute', left: x - 60, top: y - 40, width: 120, alignItems: 'center' }, st]}>
      <Text variant="heading" weight="bold" align="center" tone="xp" ltr>
        +{award} XP
      </Text>
    </Animated.View>
  );
}

/** احتفال المستوى: حلقة تتسع حول العداد + قطع صغيرة + بطاقة «مستوى جديد» */
function LevelUpBurst({ level, toX, toY, reduced }: { level: number; toX: SharedValue<number>; toY: SharedValue<number>; reduced: boolean }) {
  const t = useTheme();
  const ring = useSharedValue(0);
  useEffect(() => {
    if (!reduced) ring.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) });
  }, []);
  const ringSt = useAnimatedStyle(() => ({
    opacity: 1 - ring.value,
    transform: [{ translateX: toX.value - 40 }, { translateY: toY.value - 40 }, { scale: 0.4 + ring.value * 1.8 }],
  }));
  const { width } = Dimensions.get('window');
  return (
    <>
      {!reduced && <Animated.View style={[{ position: 'absolute', left: 0, top: 0, width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: t.colors.xp }, ringSt]} />}
      {!reduced && Array.from({ length: 14 }).map((_, i) => <Confetti key={i} i={i} toX={toX} toY={toY} />)}
      <Animated.View entering={reduced ? undefined : FadeIn.duration(220)} exiting={reduced ? undefined : FadeOut.duration(300)} style={{ position: 'absolute', top: 72, left: 0, width, alignItems: 'center' }}>
        <LevelCard level={level} />
      </Animated.View>
    </>
  );
}

function LevelCard({ level }: { level: number }) {
  const t = useTheme();
  const s = useSharedValue(0.85);
  useEffect(() => {
    s.value = withSequence(withSpring(1.04, { damping: 9, stiffness: 180 }), withSpring(1, { damping: 14 }));
  }, []);
  const st = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      style={[
        {
          backgroundColor: t.colors.surfaceRaised,
          borderColor: t.colors.xp,
          borderWidth: 1,
          borderRadius: t.radius.lg,
          paddingVertical: 12,
          paddingHorizontal: 18,
        },
        st,
      ]}
    >
      <Row gap={12}>
        <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: t.colors.xpSoft, alignItems: 'center', justifyContent: 'center' }}>
          <Text variant="title" weight="bold" tone="xp" align="center" ltr tabular>
            {level}
          </Text>
        </View>
        <View>
          <Text variant="heading" weight="bold">
            مستوى جديد!
          </Text>
          <Text variant="bodySm" tone="secondary">
            وصلت للمستوى {level}. استمر بنفس الإيقاع.
          </Text>
        </View>
      </Row>
    </Animated.View>
  );
}

function Confetti({ i, toX, toY }: { i: number; toX: SharedValue<number>; toY: SharedValue<number> }) {
  const t = useTheme();
  const k = useSharedValue(0);
  const a = (i / 14) * Math.PI * 2;
  const dist = 46 + (i % 4) * 14;
  useEffect(() => {
    k.value = withTiming(1, { duration: 820 + (i % 3) * 120, easing: Easing.out(Easing.quad) });
  }, []);
  const st = useAnimatedStyle(() => ({
    opacity: 1 - k.value,
    transform: [{ translateX: toX.value + Math.cos(a) * dist * k.value - 3 }, { translateY: toY.value + Math.sin(a) * dist * k.value + k.value * k.value * 18 - 3 }, { rotate: `${k.value * 260 + i * 25}deg` }],
  }));
  const colors = [t.colors.xp, t.colors.brandText, t.colors.successText, t.colors.streak];
  return <Animated.View style={[{ position: 'absolute', left: 0, top: 0, width: 6, height: i % 2 ? 10 : 6, borderRadius: 1.5, backgroundColor: colors[i % colors.length] }, st]} />;
}

/** عداد عائم يظهر أثناء المكافأة إذا لم يكن في الشاشة عداد XP */
function GhostMeter({ xp, registerTarget }: { xp: number; registerTarget: (r: TargetRef) => () => void }) {
  const t = useTheme();
  const ref = useRef<RNView>(null);
  useEffect(() => registerTarget(ref), [registerTarget]);
  const { width } = Dimensions.get('window');
  return (
    <Animated.View entering={FadeIn.duration(160)} exiting={FadeOut.duration(260)} style={{ position: 'absolute', top: 56, left: 0, width, alignItems: 'center' }}>
      <View ref={ref} collapsable={false} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, height: 36, borderRadius: 18, backgroundColor: t.colors.surfaceRaised, borderWidth: 1, borderColor: t.colors.border }}>
        <Ionicons name="flash" size={16} color={t.colors.xp} />
        <Text variant="label" weight="bold" ltr tabular>
          {formatXp(xp)} XP
        </Text>
      </View>
    </Animated.View>
  );
}
