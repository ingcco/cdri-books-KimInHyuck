import type { TargetAndTransition } from "framer-motion";

interface AnimationPreset {
  initial: TargetAndTransition;
  animate: TargetAndTransition;
  exit?: TargetAndTransition;
}

function compose(...presets: AnimationPreset[]): AnimationPreset {
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

const fade: AnimationPreset = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { opacity: { duration: 0.3, ease: "easeOut" } } },
  exit: { opacity: 0, transition: { opacity: { duration: 0.15, ease: "easeIn" } } },
};

const slideUp: AnimationPreset = {
  initial: { y: 24 },
  animate: { y: 0, transition: { y: { duration: 0.4, ease: "easeOut" } } },
  exit: { y: -24, transition: { y: { duration: 0.2, ease: "easeIn" } } },
};

const scaleUp: AnimationPreset = {
  initial: { scale: 0.95 },
  animate: { scale: 1, transition: { scale: { duration: 0.3, ease: "easeOut" } } },
  exit: { scale: 0.95, transition: { scale: { duration: 0.15, ease: "easeIn" } } },
};

const fadeUp = compose(fade, slideUp);

const dropdown: AnimationPreset = {
  initial: { opacity: 0, y: -8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.12, ease: "easeOut" } },
};

export const animation = {
  fade,
  scaleUp,
  fadeUp,
  dropdown,
} as const;
