# Imgoo - 在线图片压缩工具

> 一个基于 Vue3 + Vite + Element Plus 的响应式图片压缩工具网站，支持批量压缩、格式转换和尺寸调整。所有处理在浏览器本地完成，保护用户隐私。

[![Vue.js](https://img.shields.io/badge/Vue.js-3.4-4FC08D?logo=vue.js)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite)](https://vitejs.dev/)
[![Element Plus](https://img.shields.io/badge/Element_Plus-2.5-409EFF?logo=element)](https://element-plus.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## ✨ 功能特性

- 🖼️ **图片压缩** - 支持 JPG、PNG、WebP、GIF 格式的智能压缩
- 📦 **批量处理** - 一次最多处理 20 张图片，支持分批处理
- 🔄 **格式转换** - 在 JPG、PNG、WebP 之间自由转换
- 📐 **尺寸调整** - 自定义最大宽度/高度，保持宽高比
- 🌐 **国际化** - 支持中文和英文无缝切换
- 📱 **响应式设计** - 完美适配桌面端和移动端
- 🔒 **隐私安全** - 所有处理在浏览器本地完成，不上传服务器
- ⚡ **高性能** - 使用 Web Worker 处理，不阻塞主线程

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装

```bash
# 克隆项目
git clone https://github.com/yourusername/imgoo.git
cd imgoo

# 安装依赖
npm install
```

### 开发

```bash
# 启动开发服务器
npm run dev

# 访问 http://localhost:5173/
```

### 构建

```bash
# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 📖 开发文档

### 项目结构

```
imgoo/
├── public/                    # 静态资源
│   └── favicon.ico
├── src/
│   ├── assets/
│   │   ├── styles/
│   │   │   ├── variables.scss      # 全局变量（颜色、断点）
│   │   │   ├── global.scss         # 全局样式
│   │   │   └── responsive.scss     # 响应式 Mixin
│   │   └── images/                 # 静态图片
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppHeader.vue       # 导航栏 + 语言切换
│   │   │   ├── AppFooter.vue       # 页脚
│   │   │   └── MainLayout.vue      # 主布局
│   │   ├── home/
│   │   │   ├── HeroSection.vue     # 主视觉区
│   │   │   ├── UploadArea.vue      # 拖拽上传组件
│   │   │   ├── ControlPanel.vue    # 压缩控制面板
│   │   │   ├── ToolsSection.vue    # 功能工具展示
│   │   │   ├── FormatsSection.vue  # 格式展示
│   │   │   └── FeatureCard.vue     # 功能卡片
│   │   └── common/
│   │       ├── ImageCard.vue       # 图片卡片
│   │       └── BatchSummary.vue    # 批量摘要
│   ├── composables/
│   │   ├── useImageCompress.js     # 图片压缩逻辑
│   │   ├── useBatchProcessor.js    # 批量处理逻辑
│   │   ├── useResponsive.js        # 响应式检测
│   │   └── useImagePreview.js      # 预览逻辑
│   ├── i18n/
│   │   ├── index.js                # i18n 配置
│   │   ├── locales/zh.js           # 中文翻译
│   │   └── locales/en.js           # 英文翻译
│   ├── views/
│   │   └── HomeView.vue            # 首页
│   ├── stores/
│   │   └── imageStore.js           # Pinia 状态管理
│   ├── utils/
│   │   ├── validators.js           # 文件验证
│   │   └── formatters.js           # 格式化工具
│   ├── router/
│   │   └── index.js                # 路由配置
│   ├── App.vue                     # 根组件
│   └── main.js                     # 入口文件
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Actions 部署
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

### 核心技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue 3 | ^3.4.0 | 核心框架 |
| Vite | ^5.0.8 | 构建工具 |
| Element Plus | ^2.5.0 | UI 组件库 |
| vue-i18n | ^9.8.0 | 国际化 |
| Pinia | ^2.1.7 | 状态管理 |
| browser-image-compression | ^2.0.2 | 图片压缩 |
| SCSS | ^1.69.5 | CSS 预处理器 |

### 响应式设计

项目采用**移动优先**的响应式设计策略，仅使用两个断点：

| 断点 | 宽度范围 | 布局特点 |
|------|----------|----------|
| Mobile | ≤ 768px | 单列布局，汉堡菜单，垂直堆叠 |
| Desktop | > 768px | 多列布局，完整导航，左右分栏 |

```scss
// 响应式 Mixin 使用示例
@include mobile {
  // 移动端样式
}

@include desktop {
  // 桌面端样式
}
```

### 国际化

项目使用 `vue-i18n` 实现中英文切换：

```javascript
// 切换语言
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
locale.value = 'en' // 切换到英文
locale.value = 'zh' // 切换到中文
```

翻译文件位于 `src/i18n/locales/` 目录。

### 图片压缩实现

核心压缩逻辑使用 `browser-image-compression` 库：

```javascript
import imageCompression from 'browser-image-compression'

const options = {
  maxSizeMB: 0.6,           // 目标最大大小 (MB)
  maxWidthOrHeight: 1920,   // 最大宽度/高度
  useWebWorker: true,       // 使用 Web Worker
  fileType: 'image/webp'    // 输出格式
}

const compressedFile = await imageCompression(file, options)
```

### 批量处理策略

为避免内存溢出，采用分批处理策略：

```javascript
const BATCH_SIZE = 5  // 每批处理 5 张
const MAX_FILES = 20  // 最多 20 张

// 分批处理
for (let i = 0; i < files.length; i += BATCH_SIZE) {
  const batch = files.slice(i, i + BATCH_SIZE)
  await Promise.allSettled(batch.map(processImage))
}
```

### 文件限制

| 限制项 | 值 | 说明 |
|--------|-----|------|
| 单张文件大小 | 20MB | 浏览器处理限制 |
| 总文件大小 | 100MB | 内存考虑 |
| 批量文件数 | 20 张 | 性能考虑 |
| 并发处理数 | 5 张 | 平衡速度和稳定性 |

## 🗺️ 后期规划

### v1.1.0 - 功能增强

- [ ] **图片裁剪功能** - 支持手动裁剪图片区域
- [ ] **水印添加** - 支持添加文字/图片水印
- [ ] **EXIF 信息保留** - 压缩时保留原始 EXIF 数据
- [ ] **暗色模式** - 支持深色主题切换
- [ ] **PWA 支持** - 添加离线使用能力

### v1.2.0 - 性能优化

- [ ] **WebAssembly 压缩** - 集成 @squoosh/lib 实现更高压缩率
- [ ] **增量压缩** - 支持只压缩修改过的图片
- [ ] **缓存机制** - 本地缓存压缩结果
- [ ] **拖拽排序** - 批量处理时支持拖拽调整顺序
- [ ] **进度保存** - 支持中断后恢复处理

### v1.3.0 - 用户体验

- [ ] **对比滑块** - Before/After 对比查看
- [ ] **批量下载** - 打包下载所有压缩结果
- [ ] **历史记录** - 本地存储处理历史
- [ ] **快捷键支持** - 键盘快捷操作
- [ ] **多语言扩展** - 添加日语、韩语等更多语言

### v2.0.0 - 高级功能

- [ ] **AI 智能压缩** - 基于内容的智能质量调整
- [ ] **API 接口** - 提供 RESTful API 供第三方调用
- [ ] **插件系统** - 支持自定义压缩插件
- [ ] **团队协作** - 支持多用户共享配置
- [ ] **统计分析** - 压缩效果数据统计

### 技术债务

- [ ] 优化 SCSS 变量注入方式，避免重复编译
- [ ] 拆分大型组件，提高可维护性
- [ ] 添加单元测试和 E2E 测试
- [ ] 优化打包体积，实现代码分割
- [ ] 添加错误边界处理

## 🌐 部署

### GitHub Pages

项目已配置 GitHub Actions 自动部署：

1. 推送代码到 `main` 分支
2. GitHub Actions 自动构建和部署
3. 访问 `https://yourusername.github.io/imgoo/`

### 其他平台

本项目为纯静态网站，可部署到任何静态托管平台：

- **Vercel**: 连接 GitHub 仓库即可自动部署
- **Netlify**: 拖拽 `dist` 文件夹或连接 Git
- **Cloudflare Pages**: 支持 Git 集成和自动构建

### 自定义域名

在 GitHub Pages 设置中添加自定义域名，并在 `public` 目录下添加 `CNAME` 文件。

## 🤝 贡献

欢迎贡献代码、报告问题或提出建议！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Element Plus](https://element-plus.org/) - Vue 3 组件库
- [browser-image-compression](https://github.com/Donaldcwl/browser-image-compression) - 浏览器端图片压缩库
- [Vite](https://vitejs.dev/) - 下一代前端构建工具

---

**Made with ❤️ by Imgoo Team**
