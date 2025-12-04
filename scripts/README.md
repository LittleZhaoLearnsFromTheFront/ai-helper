# 开发环境启动脚本

跨平台开发环境启动脚本，支持 macOS、Linux 和 Windows。

## 使用方法

### macOS / Linux

**方法一：自动检测（推荐）**
```bash
./scripts/dev
```

**方法二：直接运行**
```bash
./scripts/dev.sh
```

### Windows

**方法一：批处理文件（最简单）**
```cmd
scripts\dev.bat
```

**方法二：PowerShell 脚本**
```powershell
.\scripts\dev.ps1
```

**方法三：自动检测脚本（如果安装了 Git Bash 或 WSL）**
```bash
./scripts/dev
```

所有方法都会自动检测操作系统并使用相应的启动方式。

## 功能说明

脚本会在一个终端窗口中创建分屏，分别运行：

- **左侧面板**: UI 开发服务器 (`ui` 目录)
- **右侧面板**: Server 开发服务器 (`server` 目录)

每个面板会自动：
1. 切换到对应目录
2. 使用 Node.js v22 (`nvm use v22`)
3. 启动开发服务器 (`npm run dev`)

## 平台特定说明

### macOS / Linux

- 使用 `tmux` 进行分屏
- 自动检测 nvm 安装路径（支持 Homebrew、标准安装等）
- 如果已有同名会话，会自动附加到现有会话

**tmux 快捷键**：
- `Ctrl+B` + `←`/`→`: 切换面板
- `Ctrl+B` + `D`: 分离会话（后台运行）
- `Ctrl+B` + `X`: 关闭当前面板

### Windows

- 优先使用 **Windows Terminal** 进行分屏（如果已安装）
- 如果没有 Windows Terminal，会打开两个独立的 PowerShell 窗口
- 支持 nvm-windows

**Windows Terminal 快捷键**：
- `Alt+Shift+←`/`→`: 切换面板
- `Alt+Shift+D`: 关闭当前面板

## 依赖要求

### 所有平台
- Node.js v22
- npm
- nvm (推荐)

### macOS / Linux
- tmux

### Windows (可选)
- Windows Terminal (推荐，用于分屏体验)

## 故障排除

### macOS / Linux: 找不到 tmux

```bash
# macOS
brew install tmux

# Ubuntu/Debian
sudo apt-get install tmux

# CentOS/RHEL
sudo yum install tmux
```

### Windows: PowerShell 执行策略错误

如果遇到执行策略错误，运行：

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### nvm 未找到

脚本会自动检测常见的 nvm 安装位置。如果仍然找不到，请确保：
- nvm 已正确安装
- nvm 已添加到 PATH 环境变量
- 或者手动修改脚本中的 nvm 路径

