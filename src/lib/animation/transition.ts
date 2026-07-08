/**
 * framer-motion 합성 가능 transition 프리셋
 *
 * per-property transition을 쓰므로 프리셋을 겹쳐도 서로의 transition을 덮어쓰지 않는다:
 * ```tsx
 * import { animation, compose } from "@/lib/animation/transition";
 *
 * <m.div {...animation.fadeUp}>            // 바로 사용
 * <m.div {...compose(animation.fade, animation.scaleUp)}>  // 합성
 * ```
 *
 * 사전 준비: 앱 루트에 `<LazyMotion features={domAnimation}>`를 1회 래핑한 뒤
 * `motion.*` 대신 `m.*` 컴포넌트에 스프레드한다(번들 최소화). exit는 `AnimatePresence` 안에서만 동작.
 */
import type { TargetAndTransition } from "framer-motion";

/** initial → animate (→ exit) 3단계 프리셋. exit는 AnimatePresence에서만 사용 */
export interface AnimationPreset {
  initial: TargetAndTransition;
  animate: TargetAndTransition;
  exit?: TargetAndTransition;
}

/** 여러 프리셋을 합성 — per-property transition을 자동 병합해 충돌 없이 겹친다 */
export function compose(...presets: AnimationPreset[]): AnimationPreset {
  const mergeWithTransition = (key: "animate" | "exit") => {
    const styles: Record<string, unknown> = {};
    const transitions: Record<string, unknown> = {};

    for (const preset of presets) {
      const target = preset[key];
      if (!target) continue;
      const { transition, ...rest } = target;
      Object.assign(styles, rest);
      if (transition) Object.assign(transitions, transition as Record<string, unknown>);
    }

    return Object.keys(transitions).length > 0 ? { ...styles, transition: transitions } : styles;
  };

  return {
    initial: Object.assign({}, ...presets.map((p) => p.initial)),
    animate: mergeWithTransition("animate"),
    ...(presets.some((p) => p.exit) && { exit: mergeWithTransition("exit") }),
  } as AnimationPreset;
}

// ── Atomic 프리셋 (단일 속성만 담당 — 합성 빌딩블록) ──────────────────────────

/** 투명도 페이드 */
const fade: AnimationPreset = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { opacity: { duration: 0.3, ease: "easeOut" } } },
  exit: { opacity: 0, transition: { opacity: { duration: 0.15, ease: "easeIn" } } },
};

/** 아래→위 슬라이드 */
const slideUp: AnimationPreset = {
  initial: { y: 24 },
  animate: { y: 0, transition: { y: { duration: 0.4, ease: "easeOut" } } },
  exit: { y: -24, transition: { y: { duration: 0.2, ease: "easeIn" } } },
};

/** 위→아래 슬라이드 (팝오버 등 상단 기준 등장) */
const slideDown: AnimationPreset = {
  initial: { y: -24 },
  animate: { y: 0, transition: { y: { duration: 0.4, ease: "easeOut" } } },
  exit: { y: 24, transition: { y: { duration: 0.2, ease: "easeIn" } } },
};

/** 살짝 확대 등장 */
const scaleUp: AnimationPreset = {
  initial: { scale: 0.95 },
  animate: { scale: 1, transition: { scale: { duration: 0.3, ease: "easeOut" } } },
  exit: { scale: 0.95, transition: { scale: { duration: 0.15, ease: "easeIn" } } },
};

// ── Combo 프리셋 (바로 사용) ─────────────────────────────────────────────────

/** 페이드 + 아래에서 위로 (리스트 아이템·토스트 등장 표준) */
const fadeUp = compose(fade, slideUp);

/** 페이드 + 위에서 아래로 (팝오버·드롭다운 등장) */
const fadeDown = compose(fade, slideDown);

/** spring 팝업 — 단독 사용(하트 토글 피드백·시스템 팝업 등) */
const pop: AnimationPreset = {
  initial: { opacity: 0, scale: 0 },
  animate: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 20 } },
  exit: { opacity: 0, scale: 0, transition: { duration: 0.15, ease: "easeIn" } },
};

/**
 * 드롭다운·팝오버 등장/퇴장 — 상단 기준으로 짧고 부드럽게(입력창 바로 아래 펼침)
 * 페이지용 `fadeDown`(y:-24, 0.4s)과 달리 이동폭·시간을 줄이고 ease-out-expo로 감속. AnimatePresence로 exit까지.
 */
const dropdown: AnimationPreset = {
  initial: { opacity: 0, y: -8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.12, ease: "easeOut" } },
};

// ── 네임스페이스 객체 ────────────────────────────────────────────────────────

export const animation = {
  // Atomic
  fade,
  slideUp,
  slideDown,
  scaleUp,
  // Combo
  fadeUp,
  fadeDown,
  pop,
  // 드롭다운·팝오버
  dropdown,
} as const;
