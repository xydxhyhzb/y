# 💌 校园表白墙

一个基于HTML5、CSS3和JavaScript的现代化表白墙应用，支持图片、视频上传和全屏相册浏览。

## 🌟 功能特点

### 核心功能
- ✅ 表白发布与管理
- ✅ 多种表白类型（爱情、友情、欣赏、感谢）
- ✅ 图片和视频上传支持
- ✅ 全屏相册浏览功能
- ✅ 点赞互动
- ✅ 按类型筛选

### 技术特性
- 🎨 响应式设计，适配各种设备
- 📱 移动端优化体验
- 💾 本地数据存储
- 🖼️ 文件预览和验证
- 🔧 纯前端实现，无需服务器

### 管理功能
- 🛡️ 管理员登录系统
- 📊 数据统计与分析
- 🔍 内容搜索和管理
- 📥 数据导出功能

## 📦 快速部署

### 最简部署
```bash
# 仅需要这三个文件
├── index.html
├── style.css
└── script.js
```

### 完整部署
```bash
# 包含所有功能
├── index.html              # 主页面
├── style.css               # 样式文件
├── script.js               # 主逻辑
├── admin.html              # 管理登录
├── admin-dashboard.html     # 管理后台
└── admin-script.js         # 管理逻辑
```

## 🚀 使用方法

### 在线部署
1. 下载所需文件
2. 上传到Web服务器
3. 访问index.html即可使用

### 本地测试
```bash
# 方法1：直接打开文件
双击 index.html

# 方法2：使用本地服务器
npm start
# 或
node quick-server.js

# 方法3：使用构建脚本
npm run build
npm run dev
```

## 📱 兼容性

- ✅ Chrome 60+
- ✅ Firefox 60+
- ✅ Safari 12+
- ✅ Edge 79+

## 🎯 测试功能

项目包含多个测试页面：
- `test-upload.html` - 文件上传测试
- `video-test.html` - 视频功能测试
- `gallery-test.html` - 相册功能测试

## 🔧 构建工具

使用构建脚本快速生成部署包：
```bash
# 最小部署包
npm run build:minimal

# 标准部署包
npm run build:standard

# 完整部署包
npm run build:full

# 构建所有类型
npm run build:all
```

## 📊 数据存储

数据存储在浏览器LocalStorage中，包括：
- 表白内容
- 上传的媒体文件（Base64编码）
- 用户操作历史

## 🔒 安全特性

- HTML转义防止XSS攻击
- 文件类型和大小验证
- 输入内容过滤和转义

## 📈 性能优化

- 文件懒加载
- 图片压缩和优化
- 代码结构优化

## 🤝 贡献指南

欢迎提交Issue和Pull Request来改进项目。

## 📄 许可证

MIT License - 详见LICENSE文件

---

**维护者**：表白墙开发团队  
**版本**：v1.0  
**更新时间**：2023-12-01
