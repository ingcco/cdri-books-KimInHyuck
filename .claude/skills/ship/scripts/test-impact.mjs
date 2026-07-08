#!/usr/bin/env node
// F-8 테스트 영향 감지 — /ship 커밋 직전 게이트.
// 변경된 소스가 요구하는 리스크 레벨(unit/integration/e2e)의 테스트가 함께 변경됐는지 점검한다.
// 강제 실패가 아니라 "리마인드": 전 파일에 테스트를 강제하지 않고(리스크 원칙), 리스크 계층을
// 건드렸는데 대응 테스트가 diff에 없을 때만 확인을 요청한다.
//
// exit 0 = 문제 없음 / exit 1 = 리뷰 필요(리마인드, ship 중단 신호 아님).
// SOT: .docs/spec/requirements.md 레벨 태그(u/i/e) · .docs/plans/test-strategy.backlog.md F-8.

import { execSync } from "node:child_process";

const LEVEL = { unit: "unit", integration: "integration", e2e: "e2e" };

// 경로 → 판정 규칙(위에서부터 첫 매치). test=이 파일이 커버하는 레벨 / require=요구 레벨 / skip=대상 아님.
const RULES = [
  // 1. 테스트 파일 — 어떤 레벨을 "커버"하는가 (require보다 먼저 매치돼야 함)
  { re: /\.integration\.test\.[tj]sx?$/, test: LEVEL.integration },
  { re: /\.test\.[tj]sx?$/, test: LEVEL.unit },
  { re: /\.spec\.[tj]sx?$/, test: LEVEL.e2e },

  // 2. skip — 테스트 저가치(스타일/상수/타입/에셋/엔트리)
  { re: /\.style\.ts$/, skip: true },
  { re: /\.css$/, skip: true },
  { re: /\.interface\.ts$/, skip: true }, // 타입 선언만
  { re: /\.d\.ts$/, skip: true },
  { re: /^src\/(constants|assets)\//, skip: true },
  { re: /^src\/(main|App)\.tsx$/, skip: true },

  // 3. integration 요구 — 카카오 API 경계
  { re: /^src\/lib\/api\/[^/]+\/api\.ts$/, require: LEVEL.integration },
  { re: /^src\/lib\/api\/[^/]+\/api\.queries\.ts$/, require: LEVEL.integration },

  // 4. unit 요구 — 순수 로직/훅/유틸
  { re: /\/use[A-Z]\w*\.ts$/, require: LEVEL.unit }, // 커스텀 훅
  { re: /^src\/utils\//, require: LEVEL.unit },
  { re: /^src\/lib\/favorites\/favorites\.ts$/, require: LEVEL.unit },
  { re: /^src\/lib\/api\/shared\/.+\.ts$/, require: LEVEL.unit }, // classify/queryKeys 등

  // 5. e2e 요구 — 컴포넌트/페이지/레이아웃/라우터(사용자 여정)
  { re: /\.tsx$/, require: LEVEL.e2e },
  { re: /^src\/router\.tsx?$/, require: LEVEL.e2e },
];

// src 밖(설정·문서·하네스)은 애초에 대상 아님
const classify = (path) => {
  if (!path.startsWith("src/") && !path.startsWith("e2e/")) return { skip: true };
  for (const rule of RULES) if (rule.re.test(path)) return rule;
  return { skip: true };
};

const sh = (cmd) => {
  try {
    return execSync(cmd, { encoding: "utf8" }).split("\n").filter(Boolean);
  } catch {
    return [];
  }
};

// HEAD 대비 워킹트리 변경(staged+unstaged) + untracked. ship은 커밋 직전이라 uncommitted가 대상.
const changed = [
  ...new Set([...sh("git diff --name-only HEAD"), ...sh("git ls-files --others --exclude-standard")]),
];

const required = new Map(); // level → 요구한 소스 파일들
const covered = new Set(); // 변경된 테스트가 커버하는 레벨

for (const path of changed) {
  const rule = classify(path);
  if (rule.test) covered.add(rule.test);
  else if (rule.require) {
    if (!required.has(rule.require)) required.set(rule.require, []);
    required.get(rule.require).push(path);
  }
}

const missing = [...required.keys()].filter((level) => !covered.has(level));

if (missing.length === 0) {
  const summary =
    required.size === 0
      ? "리스크 계층 변경 없음"
      : `요구 레벨(${[...required.keys()].join(", ")}) 대응 테스트 함께 변경됨`;
  console.log(`[test-impact] OK — ${summary}`);
  process.exit(0);
}

console.log("[test-impact] REVIEW — 테스트가 함께 변경되지 않은 리스크 계층이 있습니다:\n");
for (const level of missing) {
  console.log(`  · ${level} 테스트 미변경 — 아래 소스가 이 레벨을 요구:`);
  for (const file of required.get(level)) console.log(`      ${file}`);
}
console.log(
  "\n  → 의도된 변경이면 그대로 진행하세요(강제 중단 아님). 테스트 갱신이 필요하면 커밋 전에 반영."
);
process.exit(1);
