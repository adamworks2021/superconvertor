# SuperConvertor - 智能图片格式转换与优化工具

一个功能强大的在线图片处理工具，支持格式转换、压缩优化和社交平台尺寸剪裁。

## 👨‍💻 作者信息

**原作者**: adamworks78
**微信**: adamworks78
**GitHub**: [adamworks2021](https://github.com/adamworks2021)

> 如需二次开发或商业使用，请保留原作者信息并注明出处。感谢您的支持！

## ✨ 主要功能

### 🔄 图片格式转换
- 支持多种格式互转：JPG、PNG、WebP、GIF
- 高质量转换算法，保持图片清晰度
- 批量处理多张图片

### 🗜️ 图片压缩优化
- 智能压缩算法，大幅减小文件大小
- 可调节压缩质量和尺寸
- 实时预览压缩效果
- 保持EXIF信息（可选）

### 📱 社交平台尺寸剪裁
支持主流社交平台的标准尺寸：

#### 国内平台
- **小红书**: 正方形 (1:1)、竖版 (3:4)、横版 (4:3)
- **抖音**: 竖屏 (9:16)、横屏 (16:9)、正方形 (1:1)
- **微信**: 朋友圈封面 (16:9)、公众号封面 (2.35:1)

#### 国际平台
- **Instagram**: 正方形 (1:1)、Story (9:16)、Reel (9:16)
- **Twitter/X**: 推文图片 (16:9)、头像 (1:1)、横幅 (3:1)
- **Facebook**: 封面 (16:9)、帖子 (1.91:1)、Story (9:16)

## 🚀 技术栈

- **前端框架**: Next.js 15 (App Router)
- **样式**: Tailwind CSS
- **图片处理**: browser-image-compression
- **图标**: Lucide React
- **语言**: TypeScript

## 🛠️ 开发指南

### 环境要求
- Node.js 18.0 或更高版本
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本
```bash
npm run build
npm start
```

## 📁 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 主页面
├── components/            # React 组件
│   ├── ImageUploader.tsx  # 图片上传组件
│   ├── FormatConverter.tsx # 格式转换组件
│   ├── ImageOptimizer.tsx # 图片优化组件
│   └── SocialCropper.tsx  # 社交平台剪裁组件
├── lib/                   # 工具函数
│   ├── imageUtils.ts      # 图片处理工具
│   └── socialPlatforms.ts # 社交平台配置
└── types/                 # TypeScript 类型定义
    └── index.ts
```

## 🎯 使用方法

1. **上传图片**: 点击上传区域或拖拽图片文件
2. **选择功能**:
   - 格式转换：选择目标格式
   - 压缩优化：调整质量和尺寸参数
   - 社交剪裁：选择目标平台和尺寸
3. **预览效果**: 实时查看处理结果
4. **下载图片**: 点击下载按钮保存处理后的图片

## 🔧 核心参数

### 压缩选项
- **最大文件大小**: 0.1MB - 10MB
- **最大宽高**: 100px - 4000px
- **图片质量**: 10% - 100%
- **保持EXIF**: 是/否

### 支持格式
- **输入**: JPG, PNG, WebP, GIF, BMP, TIFF, AVIF, SVG, ICO, HEIC/HEIF
- **输出**: JPG, PNG, WebP, GIF, BMP, TIFF, AVIF

## 🌟 特色功能

- ✅ 完全客户端处理，保护隐私
- ✅ 无需注册，即开即用
- ✅ 响应式设计，支持移动端
- ✅ 实时预览，所见即所得
- ✅ 批量处理，提高效率
- ✅ 智能压缩，平衡质量与大小

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- **GitHub Issues**: [提交问题](https://github.com/adamworks2021/superconvertor/issues)
- **微信**: adamworks78
- **作者GitHub**: [adamworks2021](https://github.com/adamworks2021)

## ⚖️ 开源协议

本项目采用 MIT 协议开源，允许自由使用、修改和分发。

**二次开发要求**：
- 保留原作者信息（adamworks78）
- 在衍生项目中注明原项目来源
- 遵循 MIT 协议的其他条款

## 🙏 致谢

感谢所有为这个项目贡献代码、提出建议和报告问题的开发者们！

---

**SuperConvertor** - 让图片处理变得简单高效！
*Created with ❤️ by adamworks78*
