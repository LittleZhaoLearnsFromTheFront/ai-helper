# 跨平台开发脚本 - Windows PowerShell 版本
# macOS/Linux 用户请使用 dev.sh

# 获取脚本所在目录的父目录（项目根目录）
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$PROJECT_ROOT = Split-Path -Parent $SCRIPT_DIR

# 检测 nvm 路径（Windows 上通常是 nvm-windows）
# 注意：nvm-windows 在 PowerShell 中需要特殊处理
$HAS_NVM = $false
if (Get-Command nvm -ErrorAction SilentlyContinue) {
    $HAS_NVM = $true
} else {
    # 尝试使用 nvm-windows 的路径
    $NVM_PATH = "$env:APPDATA\nvm\nvm.exe"
    if (Test-Path $NVM_PATH) {
        $HAS_NVM = $true
    }
}

# 构建命令（在 PowerShell 中，nvm 命令需要特殊处理）
if ($HAS_NVM) {
    # nvm-windows 在 PowerShell 中可能需要先加载
    $NVM_CMD = "if (Get-Command nvm -ErrorAction SilentlyContinue) { nvm use 22.0.0 }; npm run dev"
} else {
    # 如果没有 nvm，直接使用 npm（假设 Node.js 已安装）
    Write-Host "警告: 未找到 nvm，将直接使用系统 Node.js" -ForegroundColor Yellow
    $NVM_CMD = "npm run dev"
}

# 检查是否安装了 Windows Terminal
$USE_WT = $false
if (Get-Command wt -ErrorAction SilentlyContinue) {
    $USE_WT = $true
}

# UI 目录路径
$UI_DIR = Join-Path $PROJECT_ROOT "ui"
$SERVER_DIR = Join-Path $PROJECT_ROOT "server"

if ($USE_WT) {
    # 使用 Windows Terminal 分屏
    Write-Host "使用 Windows Terminal 启动开发环境..." -ForegroundColor Green
    
    # 构建命令字符串（需要转义引号）
    $UI_CMD_ESCAPED = "cd `"$UI_DIR`"; if (Get-Command nvm -ErrorAction SilentlyContinue) { nvm use 22.0.0 }; npm run dev"
    $SERVER_CMD_ESCAPED = "cd `"$SERVER_DIR`"; if (Get-Command nvm -ErrorAction SilentlyContinue) { nvm use 22.0.0 }; npm run dev"
    
    # 使用 Windows Terminal 的分屏功能
    # 先创建新标签页，然后分割
    wt new-tab -d "$UI_DIR" powershell -NoExit -Command $UI_CMD_ESCAPED
    Start-Sleep -Milliseconds 800
    wt split-pane -H -d "$SERVER_DIR" powershell -NoExit -Command $SERVER_CMD_ESCAPED
    
    Write-Host "开发环境已在 Windows Terminal 中启动！" -ForegroundColor Green
    Write-Host "左侧面板: UI 开发服务器" -ForegroundColor Cyan
    Write-Host "右侧面板: Server 开发服务器" -ForegroundColor Cyan
} else {
    # 如果没有 Windows Terminal，使用多个 PowerShell 窗口
    Write-Host "未检测到 Windows Terminal，将打开两个独立的 PowerShell 窗口..." -ForegroundColor Yellow
    
    # 构建完整的命令
    $UI_FULL_CMD = "cd `"$UI_DIR`"; $NVM_CMD"
    $SERVER_FULL_CMD = "cd `"$SERVER_DIR`"; $NVM_CMD"
    
    # 启动 UI 窗口
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $UI_FULL_CMD
    
    # 启动 Server 窗口
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $SERVER_FULL_CMD
    
    Write-Host "已打开两个 PowerShell 窗口：" -ForegroundColor Green
    Write-Host "窗口 1: UI 开发服务器" -ForegroundColor Cyan
    Write-Host "窗口 2: Server 开发服务器" -ForegroundColor Cyan
}

