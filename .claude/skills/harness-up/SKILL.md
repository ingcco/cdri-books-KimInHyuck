---
name: harness-up
description: 하네스(스킬/훅/룰/메모리) 지속 개선. 세션 학습 codify 또는 트렌드 조사 → 평가 → 제안 → 승인 → plan → 적용 → changelog → /ship. 트리거 - "/harness-up", "스킬업", "하네스 업데이트", "하네스 개선"
effort: high
---

# /harness-up — 하네스 지속 개선

> **이 프로젝트 특성**: Vite + React CSR **단독 사전과제**(모노레포/`packages/`·copy-template 아님). VXT류 "템플릿 범용성 필터"는 적용하지 않는다. 대신 **면접관이 읽는 코드**라는 특성 + Karpathy "과엔지니어링 금지"(`.claude/rules/karpathy-principles.md`) + **보안 불변식**(카카오 키 노출·`.env` 커밋 금지, CLAUDE.md)을 도입 필터로 쓴다.
> 기본 워크플로우(CLAUDE.md): 모든 변경은 `.docs/plans/` 문서 → 체크리스트 → `/ship` 루프. harness-up도 예외 아님.

## 트리거

"/harness-up", "스킬업", "하네스 업데이트/개선".

## 모드 판정 (먼저)

| 모드 | 언제 | 절차 |
|---|---|---|
| **A. 세션 학습 codify** (기본·경량) | 방금 세션에서 얻은 재사용 지식을 룰/메모리로 박제할 때. **트렌드 웹조사 생략** | Step 0 → 3(제안) → 4 → 4.5 → 5 → 6 → 8 |
| **B. 트렌드 조사** (무거움) | 주제가 주어지거나 "트렌드 조사" 명시 | Step 0 → 1 → 2 → 3 → … → 8 전체 |

> 사용자가 스코프를 주면 그대로. 애매하면 **A부터** 제안(컨텍스트 절약). 예: "e2e 정합 패턴 룰화 + Figma 파서 노하우 메모리화"는 A.

## 절차

### 0. 현재 하네스 전수조사

```bash
find .claude -type f | sort
wc -l CLAUDE.md .claude/rules/*.md
ls .claude/skills/ .claude/rules/ .claude/agents/ 2>/dev/null
ls ~/.claude/projects/-Users-apple-git-cdri-books-KimInHyuck/memory/*.md
```

현황표(skills/rules/agents/hooks 수 + 이슈) + 프로젝트 특성(단독 CSR 앱·면접 제출·보안 불변식·React19/Tailwind v4 스택). 이 현황이 Step 2 "현재 상태" 컬럼의 근거.

### 1. 조사 (모드 B만)

- 소스 권위/도메인·fallback 순서: `.claude/rules/external-docs.md`. 공식(Tier1) 1개+ 필수, 커뮤니티/블로그는 2곳+ 교차 검증. 제목만 보고 판단 금지 — WebFetch로 실제 내용 확인.
- **"X 불가/안 됨"을 룰에 박기 전 (필수)**: 공식 문서 + 해당 라이브러리 GitHub 이슈로 (a) 우리 미스컨피그인지 (b) 업스트림 버그인지 판별. 버그면 open/closed·affected/fixed version 확인 후 **"현재(버전·이슈 open) 한정 + 재평가 트리거"** 프레이밍으로 기록. "영구 불가" 단정 금지. 절차: `.claude/references/debugging.md`.

### 2. 현재 대비 평가 (모드 B)

표: `발견 항목 | 소스(Tier) | 우리 현재 상태(Step0 근거) | 갭 여부 | 도입 근거`. 추측 금지.

### 3. 제안

항목별: **소스 · 현재 · 변경(구체적) · 효과 · 비용 · 판단(✅권장/⚠️선택/❌불필요)**.

**도입 필터 (단독 앱):**

| 체크 | 판단 |
|---|---|
| 면접 노출 코드/문서에 부합하는가(프로세스·타 레포 언급 잔재 없음) | 미부합 → ❌ |
| 과엔지니어링 아닌가(Karpathy — 요청 범위·불필요 추상화) | 위반 → ❌/⚠️ |
| 보안 불변식(키 노출·`.env` 커밋) 위반 없는가 | 위반 → ❌ |
| always-load 토큰 증가 최소인가(룰은 되도록 `paths:` 스코프) | 증가 크면 → ⚠️ + 스코프 요구 |

### 4. 사용자 승인

제안 보고 → 어떤 항목 적용할지 승인.

### 4.5 plan 문서 생성 (필수)

`/planning`(`.claude/skills/planning/SKILL.md`) Phase 2 템플릿으로 `.docs/plans/harness-{작업명}.md` + **짝 `.backlog.md`** 신설(Phase 2.5 의무). 저장 위치는 항상 루트 `.docs/plans/`(하네스는 `.claude/**`·CLAUDE.md 영향). 소규모(파일 1~2개)면 섹션 축약.

### 4.6 Pre-flight Review (plan 직후)

`/planning` Phase 3의 **3렌즈**(🎯기획자 / 🖥️프론트엔드 / 🎨디자이너)로 plan 문서만 읽어 교차 검증. BLOCK 0건 → 진행, 1건+ → 중단·보고.

### 5. 적용

plan 체크리스트 순 구현 → 즉시 `- [ ]`→`- [x]`. 룰/메모리/스킬/CLAUDE.md 수정. **새 룰은 `paths:` 프론트매터로 스코프**(always-load 0). 스킬 수정 시 frontmatter(name/description[트리거]/effort) 유지.

### 6. changelog (`.docs/harness-changelog.md`, 없으면 생성)

```markdown
## YYYY-MM-DD: [변경 제목]
**커밋**: `hash`(ship 후)
### 변경 / ### 근거(소스 Tier+URL, 왜) / ### 효과 / ### 트레이드오프
```

plan(`.docs/plans/harness-*.md`)=실행 추적(ship 후 `completed/`), changelog=영구 히스토리.

### 7. 하네스 위생 점검 (단독 앱용 간소)

| 영역 | 목표 |
|---|---|
| Always Loaded (CLAUDE.md + `paths:` 없는 룰) | 되도록 작게 — 가능한 룰은 전부 path-scoping |
| CLAUDE.md | 모듈화 유지(비대 시 룰로 분리) |
| 스킬 크기 | 각 SKILL.md < 500줄 |
| 메모리 | MEMORY.md 인덱스 ↔ `memory/*.md` 정합 |

> VXT의 MCP Deferred/packages/8영역 정량 점수는 이 프로젝트에 불필요 — 위 4개만 본다.

#### 7.1 메모리 stale 체크

```bash
ls ~/.claude/projects/-Users-apple-git-cdri-books-KimInHyuck/memory/*.md | xargs -n1 basename | sort > /tmp/mem-actual.txt
grep -oE '\(([a-z0-9_-]+\.md)\)' ~/.claude/projects/-Users-apple-git-cdri-books-KimInHyuck/memory/MEMORY.md | tr -d '()' | sort -u > /tmp/mem-index.txt
diff /tmp/mem-actual.txt /tmp/mem-index.txt
```

dangling(인덱스만) → MEMORY.md에서 제거. 미동기화(파일만) → 인덱스 한 줄 추가. 3개월+ 미수정 + 완료된 plan 참조 → 사용자 확인 후 정리.

**중복/제거 체크**: 새 스킬이 기존과 역할 중복 없음 · 새 룰이 CLAUDE.md/기존 룰과 모순 없음 · 코드에서 직접 읽히는 내용의 룰은 두지 않음.

### 8. `/ship` (조건부 자동 호출)

plan 체크 전부 ✅ + changelog 작성 시 `/ship`(`.claude/skills/ship/SKILL.md`) 호출 → 린트/타입체크 → 커밋 → plan을 `completed/` 이동 → 세션 리포트.

**스킵 조건**: ① 사용자가 ship 보류를 지시 → 커밋은 다음 ship에 위임(변경은 작업 트리에 유지) ② 조사만/적용 없음 → changelog에 "조사만, 적용 없음" 기록 후 종료.

## 주의사항

- 조사만 하고 적용은 승인 후.
- Tier3 이하 소스는 교차 검증.
- **보안 불변식** 관련 변경(키·`.env`·API 호출 경로)은 특히 신중 — 위반 시 즉시 중단(CLAUDE.md).
- 검증 명령: `pnpm lint && pnpm check-types && pnpm test:unit`(+ e2e 변경 시 `pnpm test:e2e`).
