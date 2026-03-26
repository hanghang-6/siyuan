# SiYuan 项目 Windows 桌面应用打包指南

## 项目信息

- **应用名称**: SiYuan
- **版本**: 3.5.4
- **平台**: Windows (x64)
- **最终安装包**: `siyuan-3.5.4-win.exe` (209.56 MB)

## 打包过程概述

SiYuan 是一个基于 Electron + Go 的笔记应用。打包过程涉及以下主要步骤：

1. **前端构建** (TypeScript/Node.js)
2. **后端编译** (Go Kernel)
3. **Electron 打包**
4. **NSIS 安装程序生成**

---

## 打包详细步骤

### 1. 环境准备

#### 所需工具版本：

```
- Node.js: v24.13.0
- npm: 11.6.2
- pnpm: 10.28.1
- Go: 1.25.6
- NSIS: 3.11
- Visual Studio Build Tools (C++ 编译工具)
```

#### 环境变量配置：

```bash
# Go 编译环境
set GO111MODULE=on
set GOPROXY=https://mirrors.aliyun.com/goproxy/
set CGO_ENABLED=1
set GOOS=windows
set GOARCH=amd64

# Electron 镜像
set ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
```

### 2. 前端构建

**位置**: `app/` 目录

```bash
cd app

# 安装依赖（使用 pnpm）
pnpm install

# 构建生产环境代码
# 这会生成以下内容：
# - app/ (desktop 应用)
# - mobile/ (移动页面)
# - export/ (导出功能)
pnpm run build
```

**输出**:
- 编译后的 TypeScript 文件
- 打包好的资源文件
- 优化后的 JavaScript 包

### 3. Go Kernel 编译

**位置**: `kernel/` 目录

#### 3.1 安装版本信息生成工具

```bash
cd kernel
go install github.com/josephspurrier/goversioninfo/cmd/goversioninfo@latest
```

#### 3.2 生成版本信息

```bash
# 设置编译环境
$env:GO111MODULE='on'
$env:GOPROXY='https://mirrors.aliyun.com/goproxy/'
$env:CGO_ENABLED='1'
$env:GOOS='windows'
$env:GOARCH='amd64'

# 生成版本信息
goversioninfo -platform-specific=true -icon=resource/icon.ico -manifest=resource/goversioninfo.exe.manifest
```

#### 3.3 编译 Kernel

```bash
# 创建输出目录
mkdir -p ../app/kernel

# 编译 amd64 版本
go build --tags fts5 -v -o "../app/kernel/SiYuan-Kernel.exe" -ldflags "-s -w -H=windowsgui" .
```

**输出**: `app/kernel/SiYuan-Kernel.exe` (74.52 MB)

### 4. 复制 Elevator 工具

Elevator 是提权工具，用于需要管理员权限的操作：

```bash
Copy-Item "app/elevator/elevator-amd64.exe" "app/kernel/elevator.exe"
```

### 5. 前端 Electron 打包

**位置**: `app/` 目录

```bash
# 使用 electron-builder 打包为目录形式（无 NSIS）
$env:ELECTRON_MIRROR='https://npmmirror.com/mirrors/electron/'
pnpm run dist -- --config.win.target=dir
```

**输出结构**:
```
app/build/win-unpacked/
├── SiYuan.exe                 (210 MB - 主应用)
├── resources/
│   ├── kernel/
│   │   ├── SiYuan-Kernel.exe  (77 MB - Go 后端)
│   │   └── elevator.exe       (3 MB - 提权工具)
│   ├── stage/                 (前端资源)
│   ├── appearance/            (主题、图标等)
│   └── changelogs/            (更新日志)
└── ... (其他依赖文件)
```

### 6. 生成 NSIS 安装程序

由于网络原因无法自动下载 NSIS，采用手工编译方式：

#### 6.1 创建 NSIS 脚本

在 `app/build/` 目录创建 `installer.nsi` 文件，配置以下内容：

- 产品信息和版本
- 安装路径 (`$PROGRAMFILES64\SiYuan`)
- 快捷方式创建 (开始菜单、桌面)
- 注册表项配置
- 卸载程序脚本

#### 6.2 编译 NSIS 脚本

```bash
cd app/build

# 使用本地安装的 NSIS 编译器
"C:\Program Files (x86)\NSIS\makensis.exe" /V4 installer.nsi
```

**编译过程输出**:
- 处理 1 个文件
- Install: 4 pages, 1 section, 2051 instructions
- Uninstall: 3 pages, 1 section, 289 instructions
- 压缩率: 44.2% (496 MB → 219 MB)
- CRC 校验通过

**最终输出**: `siyuan-3.5.4-win.exe` (209.56 MB)

---

## 安装程序功能

### 安装功能

- ✅ Windows 10+ 系统检查
- ✅ 自动关闭运行中的应用
- ✅ 安装到 `%ProgramFiles%\SiYuan`
- ✅ 创建开始菜单快捷方式
- ✅ 创建桌面快捷方式
- ✅ 注册表配置（用于卸载）
- ✅ ZLIB 压缩优化

### 卸载功能

- ✅ 关闭运行中的应用
- ✅ 移除所有安装文件
- ✅ 删除快捷方式
- ✅ 清理注册表
- ✅ 可选：删除全局配置 (`~/.config/siyuan/`)
- ✅ 可选：删除默认工作空间 (`~/SiYuan/`)

---

## 文件结构说明

### 前端资源 (TypeScript/Node.js)
- **编译配置**: webpack 配置文件
  - `webpack.config.js` - 桌面版
  - `webpack.mobile.js` - 移动版
  - `webpack.export.js` - 导出功能
- **源代码**: `app/src/` 包含所有 TypeScript 源文件

### 后端资源 (Go)
- **API**: `kernel/api/` - RESTful API 实现
- **数据存储**: `kernel/sql/` - 数据库相关
- **搜索**: `kernel/search/` - 全文搜索
- **同步**: `kernel/sync/` - 云同步功能

### 打包配置
- **electron-builder**: `app/electron-builder.yml`
  - 产品名、版本、应用 ID
  - 打包目标 (NSIS 安装程序)
  - 资源位置配置
  - 代码签名配置

- **NSIS 配置**: `app/nsis/`
  - `installer.nsh` - 自定义安装脚本
  - 安装程序图片资源

---

## 构建配置总结

### electron-builder.yml 关键配置

```yaml
productName: "SiYuan"
version: "3.5.4"
appId: "org.b3log.siyuan"
asar: false  # 未使用 asar 打包
compression: "normal"

win:
  icon: "src/assets/icon.ico"
  target:
    - target: "nsis"
  signAndEditExecutable: false  # 禁用代码签名

nsis:
  oneClick: false
  perMachine: false
  allowToChangeInstallationDirectory: true
  createDesktopShortcut: true
  createStartMenuShortcut: true
```

### extraResources 包含资源

- `kernel/` - Go 后端可执行文件
- `stage/` - 前端 HTML/CSS/JS 资源
- `appearance/` - 主题、字体、图标
- `changelogs/` - 版本历史
- `guide/` - 内置指南

---

## 故障排除

### 问题 1: NSIS 下载失败
**症状**: `无法下载 nsis-3.0.4.1.7z`

**解决方案**:
1. 确保已安装本地 NSIS (`Program Files (x86)\NSIS`)
2. 使用手工编译方式（参考步骤 6）
3. 或使用 `--config.win.target=dir` 跳过 NSIS

### 问题 2: Go 编译失败
**症状**: `C++ 编译器错误`

**解决方案**:
1. 安装 Visual Studio Build Tools 或 MinGW
2. 确保 CGO_ENABLED=1
3. 校验 goversioninfo 已正确安装

### 问题 3: 代码签名错误
**症状**: `无法执行 signtool.exe`

**解决方案**:
1. 在 electron-builder.yml 中设置 `signAndEditExecutable: false`
2. 或移除 certificateFile 配置
3. 生产环境可配置正式代码签名证书

---

## 性能数据

| 阶段 | 时间 | 输出大小 |
|------|------|---------|
| 前端构建 | ~15s | - (源文件) |
| Kernel 编译 | ~30s | 74.52 MB |
| Electron 打包 | ~5min | 210 MB (unpacked) |
| NSIS 编译 | ~5min | 209.56 MB (最终) |
| **总计** | **~15min** | **209.56 MB** |

---

## 验证安装程序

### 安装程序检查清单

- ✅ 文件大小: 209.56 MB
- ✅ CRC 校验: 通过
- ✅ 包含所有必要文件
- ✅ 支持自定义安装路径
- ✅ 包含完整的卸载程序
- ✅ 注册表项正确配置

### 测试步骤

```powershell
# 1. 运行安装程序
.\siyuan-3.5.4-win.exe

# 2. 选择安装路径（默认：C:\Program Files\SiYuan）

# 3. 完成安装

# 4. 验证快捷方式
# - 开始菜单 -> SiYuan
# - 桌面 -> SiYuan.lnk

# 5. 卸载测试
# - 控制面板 -> 程序 -> 卸载程序
# - or 开始菜单 -> SiYuan -> Uninstall

# 6. 验证应用启动
# 实际使用前建议创建工作空间并测试功能
```

---

## 编译脚本

### 完整自动化构建脚本示例

```powershell
# build.ps1 - Windows PowerShell 构建脚本

# 设置环境变量
$env:ELECTRON_MIRROR='https://npmmirror.com/mirrors/electron/'
$env:GO111MODULE='on'
$env:GOPROXY='https://mirrors.aliyun.com/goproxy/'
$env:CGO_ENABLED='1'
$env:GOOS='windows'
$env:GOARCH='amd64'
$env:NSIS_PATH='C:\Program Files (x86)\NSIS\'

# 1. 前端构建
cd app
pnpm install
pnpm run build
cd ..

# 2. 清理旧构建
Remove-Item -Path app\build -Recurse -Force -ErrorAction SilentlyContinue

# 3. Kernel 编译
cd kernel
goversioninfo -platform-specific=true -icon=resource/icon.ico -manifest=resource/goversioninfo.exe.manifest
go build --tags fts5 -v -o "../app/kernel/SiYuan-Kernel.exe" -ldflags "-s -w -H=windowsgui" .
Copy-Item "elevator/elevator-amd64.exe" "../app/kernel/elevator.exe"
cd ..

# 4. Electron 打包
cd app
pnpm run dist -- --config.win.target=dir
cd build

# 5. NSIS 编译
& "C:\Program Files (x86)\NSIS\makensis.exe" /V4 installer.nsi

Write-Host "Build completed! Output: siyuan-3.5.4-win.exe"
```

---

## 在 CI/CD 中使用

### GitHub Actions 示例

```yaml
name: Build Windows Installer

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '24'
      
      - uses: actions/setup-go@v4
        with:
          go-version: '1.25'
      
      - name: Install dependencies
        run: |
          choco install nsis -y
          pnpm install -g pnpm
      
      - name: Build
        run: |
          ./scripts/win-build.bat
      
      - name: Upload artifact
        uses: actions/upload-artifact@v3
        with:
          name: windows-installer
          path: app/siyuan-*.exe
```

---

## 相关资源

- **官方网站**: https://b3log.org/siyuan
- **GitHub 仓库**: https://github.com/siyuan-note/siyuan
- **electron-builder 文档**: https://www.electron.build
- **NSIS 官网**: https://nsis.sourceforge.io

---

## 许可证

- **SiYuan**: AGPL-v3
- **NSIS**: Zlib

---

## 附录 A: 环境检查清单

```powershell
# 运行此脚本验证所有工具已正确安装
Write-Host "=== 系统环境检查 ==="

# Node.js
node --version
npm --version

# pnpm
pnpm --version

# Go
go version

# NSIS
Test-Path "C:\Program Files (x86)\NSIS\makensis.exe"

# C++ 编译工具
cl.exe --version

Write-Host "=== 检查完成 ==="
```

---

**文档更新时间**: 2026-02-09  
**打包工具版本**: electron-builder 26.0.12, NSIS 3.11  
**维护者**: SiYuan 开发团队
