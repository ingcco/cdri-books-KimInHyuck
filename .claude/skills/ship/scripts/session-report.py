#!/usr/bin/env python3
"""세션 JSONL 분석 + 리포트 생성 — /ship 세션 리포트 단계의 핵심 구현.

집계 항목:
  - 슬래시 커맨드 (user content의 <command-name>)
  - Skill tool 호출 (assistant tool_use name=Skill, input.skill)
  - Agent 호출 (assistant tool_use name=Agent, input.subagent_type)
  - 도구 사용 (기타 tool_use 상위 10)
  - 토큰 (message.usage 합산)
  - 예상 비용 (하드코딩 단가 기준 — PRICING dict)
  - 중복 호출 (2회 이상)
  - 스킬 관련성 분석 (사용 / 관련 미사용 / 무관련)
  - 한줄 인사이트

JSONL 포맷이 바뀌어 파싱 실패해도 gracefully 스킵.
"""

import json
import re
import subprocess
import sys
from collections import Counter
from pathlib import Path

PRICING = {
    "opus": {"input": 5.0, "output": 25.0, "cache_read": 0.5, "cache_write_5m": 6.25},
    "sonnet": {"input": 3.0, "output": 15.0, "cache_read": 0.3, "cache_write_5m": 3.75},
    "haiku": {"input": 1.0, "output": 5.0, "cache_read": 0.1, "cache_write_5m": 1.25},
}

# 스킬별 관련 파일 패턴 — 해당 패턴 파일이 변경됐을 때 이 스킬이 "관련성 높음"으로 분류됨
# 스킬이 추가되면 여기에 매핑 추가
SKILL_FILE_PATTERNS = {
    "review": [r"\.tsx?$", r"\.css$", r"\.ts$"],  # 모든 코드 변경
    "review-ui": [r"app/.*/(page|page\.style)\.tsx?$", r"components/"],
    "security": [r"app/api/", r"lib/"],
    "nextjs": [r"app/.*/(page|layout)\.tsx?$", r"app/api/.*/route\.ts", r"middleware\.ts"],
    "planning": [],  # 계획 수립 시 명시적 호출
    "ship": [],  # 마무리 시 명시적 호출
    "zoom-out": [],  # 구조 파악 시 명시적 호출
}

# 스킬별 "언제 쓰는 스킬인지" 한 줄 설명 — 리포트에 같이 출력
SKILL_PURPOSE = {
    "review": "변경 코드 컨벤션 리뷰",
    "review-ui": "브라우저 시각 검증",
    "security": "OWASP 보안 리뷰",
    "nextjs": "Next.js 페이지/라우트",
    "planning": "계획 수립 + 구현",
    "ship": "커밋 + 세션 리포트",
    "zoom-out": "코드 구조 파악",
}


def analyze_session(jsonl_path):
    slash_commands = Counter()
    skills_used = Counter()
    agents_used = Counter()
    tools_used = Counter()
    total_usage = {"input_tokens": 0, "output_tokens": 0, "cache_creation_input_tokens": 0, "cache_read_input_tokens": 0}
    assistant_count = 0
    start_time = None
    end_time = None

    cmd_pattern = re.compile(r"<command-name>([^<]+)</command-name>")

    with open(jsonl_path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                d = json.loads(line)
            except Exception:
                continue

            msg_type = d.get("type")
            ts = d.get("timestamp")
            if ts:
                if start_time is None or ts < start_time:
                    start_time = ts
                if end_time is None or ts > end_time:
                    end_time = ts

            msg = d.get("message")
            if not isinstance(msg, dict):
                continue

            if msg_type == "user":
                content = msg.get("content", [])
                texts = []
                if isinstance(content, list):
                    for c in content:
                        if isinstance(c, dict) and c.get("type") == "text":
                            texts.append(c.get("text", ""))
                elif isinstance(content, str):
                    texts.append(content)
                for t in texts:
                    for m in cmd_pattern.findall(t):
                        slash_commands[m.lstrip("/")] += 1

            if msg_type == "assistant":
                assistant_count += 1
                usage = msg.get("usage") or {}
                for k in total_usage:
                    total_usage[k] += int(usage.get(k) or 0)

                content = msg.get("content", [])
                if isinstance(content, list):
                    for c in content:
                        if isinstance(c, dict) and c.get("type") == "tool_use":
                            name = c.get("name") or ""
                            tools_used[name] += 1
                            if name == "Skill":
                                skill = (c.get("input") or {}).get("skill", "?")
                                skills_used[skill] += 1
                            elif name == "Agent":
                                sub = (c.get("input") or {}).get("subagent_type", "?")
                                agents_used[sub] += 1

    return {
        "slash_commands": slash_commands,
        "skills_used": skills_used,
        "agents_used": agents_used,
        "tools_used": tools_used,
        "usage": total_usage,
        "assistant_count": assistant_count,
        "start_time": start_time,
        "end_time": end_time,
    }


def get_changed_files():
    """git에서 변경 파일 목록 수집 (커밋 + staged + unstaged)."""
    files = set()
    for cmd in [
        ["git", "diff", "--name-only", "HEAD"],
        ["git", "diff", "--cached", "--name-only"],
        ["git", "ls-files", "--others", "--exclude-standard"],
    ]:
        try:
            out = subprocess.check_output(cmd, text=True, stderr=subprocess.DEVNULL)
            for f in out.strip().split("\n"):
                if f:
                    files.add(f)
        except Exception:
            continue
    return files


def estimate_cost(usage, model="opus"):
    p = PRICING.get(model, PRICING["opus"])
    return (
        usage["input_tokens"] * p["input"]
        + usage["output_tokens"] * p["output"]
        + usage["cache_read_input_tokens"] * p["cache_read"]
        + usage["cache_creation_input_tokens"] * p["cache_write_5m"]
    ) / 1_000_000


def available_skills():
    skills_dir = Path(".claude/skills")
    if not skills_dir.is_dir():
        return set()
    return {d.name for d in skills_dir.iterdir() if d.is_dir()}


def classify_skills(used_skills, available, changed_files):
    """스킬을 USED / RELEVANT_UNUSED / IRRELEVANT 세 분류로 나눔."""
    used_set = set(used_skills)
    used = []
    relevant_unused = []
    irrelevant = []

    for skill in sorted(available):
        if skill in used_set:
            used.append(skill)
            continue

        patterns = SKILL_FILE_PATTERNS.get(skill, [])
        if not patterns:
            irrelevant.append(skill)
            continue

        has_match = any(
            re.search(p, f) for p in patterns for f in changed_files
        )
        if has_match:
            relevant_unused.append(skill)
        else:
            irrelevant.append(skill)

    return used, relevant_unused, irrelevant


def generate_insights(data, used, relevant_unused, irrelevant, changed_files):
    """세션 패턴 기반 한줄 인사이트 생성."""
    u = data["usage"]
    cache_read = u["cache_read_input_tokens"]
    cache_create = u["cache_creation_input_tokens"]
    fresh_input = u["input_tokens"]
    total_input = fresh_input + cache_read + cache_create
    cache_hit = (cache_read / total_input * 100) if total_input else 0

    top_tool = data["tools_used"].most_common(1)
    top_tool_name = top_tool[0][0] if top_tool else "-"
    top_tool_count = top_tool[0][1] if top_tool else 0
    total_tools = sum(data["tools_used"].values())
    top_ratio = (top_tool_count / total_tools * 100) if total_tools else 0

    insights = []

    if cache_hit > 85:
        insights.append(f"캐시 효율 **매우 우수** ({cache_hit:.0f}%) — 컨텍스트 유지 잘 됨")
    elif cache_hit > 70:
        insights.append(f"캐시 효율 양호 ({cache_hit:.0f}%)")
    elif cache_hit > 0:
        insights.append(f"캐시 효율 낮음 ({cache_hit:.0f}%) — 세션 분할 또는 `/clear` 적극 활용 검토")

    if top_ratio > 40:
        insights.append(f"**{top_tool_name} 편중** ({top_ratio:.0f}%) — 작업 성격이 {'조사' if top_tool_name in ('Read', 'Grep', 'Bash') else '편집'} 중심")

    if data["agents_used"]:
        agent_total = sum(data["agents_used"].values())
        insights.append(f"에이전트 {agent_total}회 spawn — 탐색/리포트 위임 활용")

    if len(relevant_unused) > 0:
        skills_str = ", ".join(f"/{s}" for s in relevant_unused[:3])
        insights.append(f"**관련 스킬 미사용**: {skills_str} — 변경 파일이 영역에 속하지만 안 씀, 활용 검토 권장")

    if data["assistant_count"] > 100:
        insights.append("장시간 세션 — 작업 분할 + `/ship` 중간 커밋 고려")

    cost_opus = estimate_cost(u, "opus")
    if cost_opus > 50:
        insights.append(f"Opus 기준 비용 ${cost_opus:.1f} — Sonnet로 일부 전환 가능 여부 검토")

    return insights


def print_report(data, jsonl_path):
    print("## 세션 리포트")
    print()
    print(f"- 세션 JSONL: `{Path(jsonl_path).name}`")
    if data["start_time"] and data["end_time"]:
        print(f"- 기간: `{data['start_time']}` ~ `{data['end_time']}`")
    print(f"- Assistant 응답: {data['assistant_count']}")
    print()

    changed_files = get_changed_files()
    available = available_skills()
    all_used_skills = set(data["slash_commands"].keys()) | set(data["skills_used"].keys())
    used, relevant_unused, irrelevant = classify_skills(all_used_skills, available, changed_files)

    # === 스킬 활용 분석 (통합 표) ===
    print("### 스킬 활용 분석")
    print()
    print(f"변경 파일 {len(changed_files)}개 기준으로 스킬별 관련성 분류.")
    print()
    print("| 상태 | 스킬 | 호출 | 용도 | 비고 |")
    print("|------|------|------|------|------|")

    for skill in sorted(used):
        count = data["slash_commands"].get(skill, 0) + data["skills_used"].get(skill, 0)
        purpose = SKILL_PURPOSE.get(skill, "-")
        print(f"| ✅ 사용 | `/{skill}` | {count}회 | {purpose} | 활용됨 |")

    for skill in relevant_unused:
        purpose = SKILL_PURPOSE.get(skill, "-")
        patterns = SKILL_FILE_PATTERNS.get(skill, [])
        matches = [f for f in changed_files if any(re.search(p, f) for p in patterns)]
        sample = matches[0] if matches else "-"
        if len(matches) > 1:
            sample = f"{sample} 외 {len(matches) - 1}개"
        print(f"| ⚠️ 관련 미사용 | `/{skill}` | 0회 | {purpose} | 변경: `{sample}` |")

    for skill in irrelevant:
        purpose = SKILL_PURPOSE.get(skill, "-")
        print(f"| ⚫ 무관련 | `/{skill}` | 0회 | {purpose} | 영역 불일치 |")

    print()
    print(f"- ✅ **사용** {len(used)}개 / ⚠️ **관련 미사용** {len(relevant_unused)}개 / ⚫ **무관련** {len(irrelevant)}개")
    print()

    # === 에이전트 ===
    if data["agents_used"]:
        print("### 사용 에이전트")
        print()
        print("| subagent_type | 횟수 |")
        print("|---------------|------|")
        for name, n in data["agents_used"].most_common():
            print(f"| {name} | {n} |")
        print()

    # === 도구 사용 ===
    if data["tools_used"]:
        print("### 주요 도구 사용 (상위 10)")
        print()
        print("| 도구 | 횟수 |")
        print("|------|------|")
        for name, n in data["tools_used"].most_common(10):
            print(f"| {name} | {n} |")
        print()

    # === 토큰 ===
    u = data["usage"]
    cache_read = u["cache_read_input_tokens"]
    cache_create = u["cache_creation_input_tokens"]
    fresh_input = u["input_tokens"]
    total_input = fresh_input + cache_read + cache_create
    cache_hit = (cache_read / total_input * 100) if total_input else 0

    print("### 토큰 소비")
    print()
    print("| 항목 | 토큰 |")
    print("|------|------|")
    print(f"| Fresh Input | `{fresh_input:,}` |")
    print(f"| Cache Read | `{cache_read:,}` (캐시 적중 {cache_hit:.1f}%) |")
    print(f"| Cache Create | `{cache_create:,}` |")
    print(f"| Output | `{u['output_tokens']:,}` |")
    print(f"| **총합** | **`{total_input + u['output_tokens']:,}`** |")
    print()

    # === 비용 ===
    cost_opus = estimate_cost(u, "opus")
    cost_sonnet = estimate_cost(u, "sonnet")
    cost_haiku = estimate_cost(u, "haiku")
    print("### 예상 비용 (USD)")
    print()
    print("| 모델 | 비용 |")
    print("|------|------|")
    print(f"| Opus | `${cost_opus:.4f}` |")
    print(f"| Sonnet | `${cost_sonnet:.4f}` |")
    print(f"| Haiku | `${cost_haiku:.4f}` |")
    print()

    # === 중복 ===
    dupes = []
    for k, v in data["slash_commands"].items():
        if v >= 2:
            dupes.append((f"/{k}", v))
    for k, v in data["skills_used"].items():
        if v >= 2:
            dupes.append((f"Skill:{k}", v))
    if dupes:
        print("### 중복 호출 (2회 이상)")
        print()
        print("| 이름 | 횟수 |")
        print("|------|------|")
        for name, n in sorted(dupes, key=lambda x: -x[1]):
            print(f"| `{name}` | {n} |")
        print()

    # === 인사이트 (한줄씩) ===
    insights = generate_insights(data, used, relevant_unused, irrelevant, changed_files)
    if insights:
        print("### 💡 인사이트")
        print()
        for msg in insights:
            print(f"- {msg}")
        print()

    # === 한줄 요약 ===
    summary = (
        f"스킬 {len(used)}/{len(available)} 활용 · "
        f"캐시 {cache_hit:.0f}% · "
        f"비용 ${cost_opus:.2f} (Opus 기준) · "
        f"{data['assistant_count']}턴 · "
        f"에이전트 {sum(data['agents_used'].values())}회"
    )
    print(f"> **한줄 요약**: {summary}")
    print()


def main():
    if len(sys.argv) < 2:
        print("Usage: session-report.py <jsonl_path>", file=sys.stderr)
        return 1

    jsonl_path = sys.argv[1]
    if not Path(jsonl_path).is_file():
        print(f"⚠️ JSONL not found: {jsonl_path}", file=sys.stderr)
        return 0

    try:
        data = analyze_session(jsonl_path)
        print_report(data, jsonl_path)
    except Exception as e:
        print(f"⚠️ 세션 리포트 생성 실패: {e}", file=sys.stderr)
        return 0

    return 0


if __name__ == "__main__":
    sys.exit(main())
