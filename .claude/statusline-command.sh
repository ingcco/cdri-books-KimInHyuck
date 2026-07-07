#!/bin/bash
input=$(cat)
git_branch=$(git branch --show-current 2>/dev/null | tr -d '\n')
current_dir=$(basename "$(echo "$input" | jq -r '.workspace.current_dir // .cwd')")
model=$(echo "$input" | jq -r '.model.display_name')
usage=$(echo "$input" | jq '.context_window.current_usage')

if [ "$usage" != "null" ]; then
  current=$(echo "$usage" | jq '.input_tokens + .cache_creation_input_tokens')
  size=$(echo "$input" | jq '.context_window.context_window_size')
  autocompact_buffer=45000
  free_space=$((size - current - autocompact_buffer))
  pct=$((free_space * 100 / size))
  context_info=$(printf '%d%%' "$pct")
else
  context_info="100%"
fi

current_time=$(date "+%I:%M %p")

printf "\033[36m🌿 %s\033[0m" "$git_branch"
printf "\033[34m 📁 %s\033[0m" "$current_dir"
printf "\033[35m 🤖 %s\033[0m" "$model"
printf "\033[33m 💾 %s\033[0m" "$context_info"
printf "\033[32m 🕐 %s\033[0m\n" "$current_time"
