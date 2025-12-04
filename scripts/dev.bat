@echo off
REM 跨平台开发启动脚本 - Windows 批处理版本
REM 自动调用 PowerShell 脚本

echo 检测到 Windows 系统，启动开发环境...
powershell -ExecutionPolicy Bypass -File "%~dp0dev.ps1"

