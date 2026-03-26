# SiYuan Windows 打包 - 快速参考

## 最终产物

**安装程序位置**: `d:\Develop\CodeSelf\siyuan\app\siyuan-3.5.4-win.exe`
**大小**: 209.56 MB  
**系统要求**: Windows 10 或更高版本

---

## 快速打包步骤 (3 行命令)

```powershell
# 前端 + 后端编译 + Electron 打包
cd d:\Develop\CodeSelf\siyuan\app
pnpm run build
cd ../kernel && go build --tags fts5 -v -o "../app/kernel/SiYuan-Kernel.exe" -ldflags "-s -w -H=windowsgui" .

# Electron 打包
cd ../app
pnpm run dist -- --config.win.target=dir

# 生成 NSIS 安装程序
cd build
"C:\Program Files (x86)\NSIS\makensis.exe" installer.nsi
```

---

## 必需工具

```
✓ Node.js 24.13.0+
✓ pnpm 10.28.1+
✓ Go 1.25.6+
✓ NSIS 3.11+
✓ Visual Studio Build Tools (C++)
```

---

## 打包过程概览

```
源代码
  ↓
[前端编译] → TypeScript → JavaScript 包
  ↓
[后端编译] → Go 代码 → SiYuan-Kernel.exe (77MB)
  ↓
[Electron 打包] → 打包所有资源
  ↓
[NSIS 编译] → Windows 安装程序
  ↓
siyuan-3.5.4-win.exe (209.56 MB)
```

---

## 安装程序功能

### 安装时
- 检查 Windows 10+ 系统
- 关闭正在运行的应用
- 安装到 Program Files
- 创建开始菜单和桌面快捷方式
- 配置卸载程序

### 卸载时
- 关闭应用
- 移除所有文件
- 删除快捷方式
- 清理注册表
- 可选：删除配置和工作空间

---

## 文件结构

```
app/
├── kernel/                    # 后端 (Go)
│   ├── SiYuan-Kernel.exe     # 核心引擎 (77MB)
│   └── elevator.exe          # 提权工具
├── resources/
│   ├── stage/                # 前端资源
│   ├── appearance/           # 主题/图标/字体
│   └── changelogs/           # 更新日志
└── build/
    └── win-unpacked/         # 打包后的应用
        └── siyuan-3.5.4-win.exe (最终安装包)
```

---

## 故障排除

| 问题 | 解决 |
|------|------|
| NSIS 下载失败 | 已安装本地 NSIS，使用手工编译 |
| Go 编译失败 | 安装 Visual Studio Build Tools |
| 代码签名错误 | 在 yml 中设置 signAndEditExecutable: false |
| 网络超时 | 使用国内镜像: npmmirror.com |

---

## 性能统计

- **前端编译**: ~15 秒
- **后端编译**: ~30 秒  
- **Electron 打包**: ~5 分钟
- **NSIS 编译**: ~5 分钟
- **总计**: ~15 分钟
- **最终包大小**: 209.56 MB (压缩率 44.2%)

---

## 完整文档

详见: `WINDOWS_PACKAGING_GUIDE.md`

---

## 验证安装包

```powershell
# 检查文件
Get-Item "d:\Develop\CodeSelf\siyuan\app\siyuan-3.5.4-win.exe" | Select-Object Name, @{N="SizeMB";E={[math]::Round($_.Length/1MB,2)}}

# 运行安装程序
.\siyuan-3.5.4-win.exe

# 选择安装路径并完成安装
```

---

**打包完成时间**: 2026-02-09 15:35 UTC+8  
**安装程序状态**: ✅ 已生成，可用于安装
