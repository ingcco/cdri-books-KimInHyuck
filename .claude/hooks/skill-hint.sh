#!/bin/bash
# UserPromptSubmit hook — 프롬프트 키워드 분석 → 관련 스킬/룰 힌트 자동 주입
# 참조 대상은 실제 존재하는 자산만: skills(planning/review/review-ui/security/ship/zoom-out),
# rules(conventions/react/karpathy-principles/ai-defense/accessibility/anti-patterns/external-docs/page),
# references(debugging).

# jq 미설치 환경 가드 (macOS 기본 미포함) — 훅 실패 대신 조용히 통과
command -v jq >/dev/null 2>&1 || exit 0

INPUT=$(cat)
PROMPT=$(echo "$INPUT" | jq -r '.prompt // empty')

# 프롬프트가 비어있으면 종료
if [ -z "$PROMPT" ]; then
  exit 0
fi

SKILLS=()

# 카카오 도서 검색 API / 클라이언트 직접 호출 데이터 계층 → security(키 은닉) + react·conventions 룰
if echo "$PROMPT" | grep -qiE '카카오|kakao|/api[^-]|API|엔드포인트|endpoint|검색|search|도서|axios|인터셉터|queryKey'; then
  SKILLS+=(".claude/skills/security/SKILL.md" ".claude/rules/react.md" ".claude/rules/conventions.md")
fi

# 페이지/라우팅/SPA(react-router) → page 룰
if echo "$PROMPT" | grep -qiE '페이지|page|라우팅|route|라우터|router|react-router|SPA|찜|favorites'; then
  SKILLS+=(".claude/rules/page.md")
fi

# 보안 → security 스킬
if echo "$PROMPT" | grep -qiE '/security|보안|security|XSS|injection|OWASP|csrf|취약점|vulnerability|키 노출|env|환경변수'; then
  SKILLS+=(".claude/skills/security/SKILL.md")
fi

# 계획/설계/기능/구현 → planning 스킬
if echo "$PROMPT" | grep -qiE '/planning|계획|플래닝|planning|설계|기능|구현|로드맵|feature|어떻게 진행|체크포인트'; then
  SKILLS+=(".claude/skills/planning/SKILL.md")
fi

# 리뷰 → review 스킬 (review-ui는 아래 별도 매칭)
if echo "$PROMPT" | grep -qiE '/review$|/review[^-]|리뷰|review|검토|코드 체크'; then
  SKILLS+=(".claude/skills/review/SKILL.md")
fi

# UI/스타일/컴포넌트/디자인 → review-ui 스킬
if echo "$PROMPT" | grep -qiE '/review-ui|UI 검증|review-ui|브라우저 검증|UI|스타일|컴포넌트|component|디자인|design|정렬|간격|버튼|모달|테이블|드롭다운|Lighthouse|시각 검증|tailwind'; then
  SKILLS+=(".claude/skills/review-ui/SKILL.md")
fi

# React/훅/React Query 패턴 → react 룰
if echo "$PROMPT" | grep -qiE '훅|hook|use[A-Z]|커스텀 훅|react query|useQuery|리액트|react|상태 관리|state|nuqs|zod|react-hook-form'; then
  SKILLS+=(".claude/rules/react.md")
fi

# 커밋/배포 → ship 스킬
if echo "$PROMPT" | grep -qiE '/ship|커밋|commit|배포|deploy|ship|머지|merge|vercel'; then
  SKILLS+=(".claude/skills/ship/SKILL.md")
fi

# 접근성 → accessibility 룰
if echo "$PROMPT" | grep -qiE '접근성|a11y|accessibility|aria|스크린 리더|키보드 네비|포커스 트랩'; then
  SKILLS+=(".claude/rules/accessibility.md")
fi

# 컨벤션/네이밍/폴더 구조 → conventions 룰
if echo "$PROMPT" | grep -qiE '컨벤션|convention|네이밍|naming|코드 스타일|폴더 구조|파일 구조|import 순서'; then
  SKILLS+=(".claude/rules/conventions.md")
fi

# 안티패턴/리팩토링 → anti-patterns 룰
if echo "$PROMPT" | grep -qiE '안티패턴|anti-pattern|나쁜 패턴|리팩토링|refactor|코드 냄새|smell'; then
  SKILLS+=(".claude/rules/anti-patterns.md")
fi

# 공식 문서/라이브러리/버전 이슈 → external-docs 룰
if echo "$PROMPT" | grep -qiE '공식 문서|external docs|라이브러리 문서|github 이슈|버전|version|업스트림|upstream|deprecated'; then
  SKILLS+=(".claude/rules/external-docs.md")
fi

# AI 방어/환각/추측 방지 → ai-defense 룰
if echo "$PROMPT" | grep -qiE 'ai-defense|환각|hallucination|추측 금지|silent fail|반복 실수'; then
  SKILLS+=(".claude/rules/ai-defense.md")
fi

# 원칙/목표 주도 실행 → karpathy-principles 룰
if echo "$PROMPT" | grep -qiE 'karpathy|원칙|목표 주도|goal-driven'; then
  SKILLS+=(".claude/rules/karpathy-principles.md")
fi

# 코드 구조 파악/zoom-out
if echo "$PROMPT" | grep -qiE '이해가 안|어떻게 동작|모르겠|맵 그려|한 레벨 위|구조 파악|낯설|zoom.?out|전체 구조|흐름 파악'; then
  SKILLS+=(".claude/skills/zoom-out/SKILL.md")
fi

# 디버깅 → debugging 레퍼런스
if echo "$PROMPT" | grep -qiE '버그|디버깅|에러 났|에러가|안 돼|안 됨|이상하다|이상해|debug|왜 안'; then
  SKILLS+=(".claude/references/debugging.md")
fi

# 매칭된 스킬이 없으면 종료
if [ ${#SKILLS[@]} -eq 0 ]; then
  exit 0
fi

# 중복 제거 (bash 3.2 호환 — 연관 배열 미사용)
UNIQUE=$(printf '%s\n' "${SKILLS[@]}" | sort -u | tr '\n' ' ')
HINT="관련 스킬 참고: ${UNIQUE% }"

jq -n --arg hint "$HINT" \
  '{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":$hint}}'

exit 0
