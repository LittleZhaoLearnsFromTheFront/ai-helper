#!/bin/bash

# 跨平台开发脚本 - macOS/Linux 版本
# Windows 用户请使用 dev.ps1

# 获取脚本所在目录的父目录（项目根目录）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# 会话名称
SESSION_NAME="ai-system-dev"

# 检查是否已有同名会话
if tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
    echo "会话 $SESSION_NAME 已存在，正在附加..."
    tmux attach-session -t "$SESSION_NAME"
    exit 0
fi

# 检测 nvm 路径
if [ -s "/opt/homebrew/opt/nvm/nvm.sh" ]; then
    NVM_SCRIPT="/opt/homebrew/opt/nvm/nvm.sh"
elif [ -s "$HOME/.nvm/nvm.sh" ]; then
    NVM_SCRIPT="$HOME/.nvm/nvm.sh"
elif [ -s "$HOME/.config/nvm/nvm.sh" ]; then
    NVM_SCRIPT="$HOME/.config/nvm/nvm.sh"
else
    echo "警告: 未找到 nvm.sh，尝试使用系统 nvm 命令"
    NVM_SCRIPT=""
fi

# 构建命令
if [ -n "$NVM_SCRIPT" ]; then
    NVM_CMD="source $NVM_SCRIPT && nvm use v22 && npm run dev"
else
    NVM_CMD="nvm use v22 && npm run dev"
fi

# 创建新会话，第一个面板用于 ui（左侧）
tmux new-session -d -s "$SESSION_NAME" -c "$PROJECT_ROOT/ui"

# 在第一个面板执行 ui 命令
tmux send-keys -t "$SESSION_NAME:0.0" "$NVM_CMD" C-m

# 水平分屏创建第二个面板用于 server（右侧）
tmux split-window -h -t "$SESSION_NAME:0" -c "$PROJECT_ROOT/server"

# 在第二个面板执行 server 命令
tmux send-keys -t "$SESSION_NAME:0.1" "$NVM_CMD" C-m

# 选择第一个面板（左侧）
tmux select-pane -t "$SESSION_NAME:0.0"

# 附加到会话
tmux attach-session -t "$SESSION_NAME"
