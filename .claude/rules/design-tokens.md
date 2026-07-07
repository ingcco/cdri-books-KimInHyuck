---
description: "디자인 토큰 전역화 범위 — Figma Style 레이어가 명시 정의한 값만 @theme 전역 토큰, 나머지는 컴포넌트 스코프."
paths:
  - "src/index.css"
  - "src/components/ui/**"
---

# 디자인 토큰 — 전역화 판단 원칙

Figma "Style" 레이어(`.docs/design/tokens.md` 실측 SOT)가 **명시적으로 정의한 값만** `@theme` 전역 토큰으로 승격한다. 색상·radius·spacing 등 종류를 불문하고 동일 원칙을 적용한다.

## 판단 기준

| 값의 출처 | 처리 |
|---|---|
| Style 레이어가 재사용 토큰으로 선언(Color/Typography 섹션) | `@theme` 전역 토큰 |
| 개별 컴포넌트 인스턴스를 실측한 값(버튼 radius, 아이콘 색 등) | 전역 토큰화 금지 — 실사용 컴포넌트에서 arbitrary value(`rounded-[8px]`, `text-[#b1b8c0]`) 또는 컴포넌트 로컬 상수 |

**현재 확정**: 색상 9종(Palette 6 + Text 3)만 전역 토큰. radius(8px/100px)는 Style 레이어에 섹션 자체가 없어 컴포넌트 스코프(Phase 3 Button/Input/Popover).

## 네이밍

토큰 이름은 Figma 원본 명칭 그대로 1:1 사용한다. 용도 기반 의미 네이밍(`red`→`like`, `black`→`input-text` 등)으로 임의 변경하지 않는다 — 의미별 별칭이 필요하면 전역 토큰명이 아니라 컴포넌트 스코프에서만 부여한다.

## 재검증 시 주의

Figma 재조회로 실측값을 갱신할 때, 이미 전역화된 다른 토큰(예: radius)이 같은 `@theme` 블록에 있다면 편집 시 실수로 함께 삭제되지 않았는지 diff로 확인한다. 반대로, 사용자가 의도적으로 삭제한 토큰을 도구 경고(린터 등)만으로 판단해 되살리지 않는다 — 먼저 이 원칙에 비추어 삭제 의도를 검토한다.
