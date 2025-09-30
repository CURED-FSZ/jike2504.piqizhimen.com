# 计科2504班级网站

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 简介

欢迎来到**计科2504**的官方班级网站！这是一个试验性质的试验品，我们用 Node.js + Express + MySQL 搭建，旨在让班级事务更透明、更有趣。想看班费动向？想匿名吐槽？想重温课程表？全都有！（余额：114514￥，最新：老八直播打赏 +114514￥ 😎）

目前功能包括：首页展示、课程表、成员列表、班费公开、投票、重要事项、匿名反馈。未来会继续迭代——毕竟，我们是计科生，代码就是我们的第二语言。

## ✨ 功能亮点

- **首页概览**：班级视窗、课程表、成员卡片、轮播图。
- **匿名反馈**：提交留言（标题+内容），存储到 MySQL，支持前端验证（标题≤255，内容≤1000）。
- **班务公开**：静态展示投票和事项，未来可扩展动态。
- **响应式设计**：手机/平板/PC 全适配，CSS 模块化。
- **数据库管理**：封装 MySQL 连接池，支持查询/插入/更新。

## 🛠️ 技术栈

- **后端**：Node.js, Express, MySQL2 (Promise)
- **前端**：EJS 模板, jQuery, Vanilla JS + CSS (响应式 + 动画)
- **数据库**：MySQL (表：comments 等)
- **工具**：dotenv (环境变量), mysql2/promise (连接池)

## 📦 安装 & 运行

### 先决条件
- Node.js ≥ 14
- MySQL ≥ 5.7
- Git

### 步骤
1. **克隆仓库**：
   ```bash
   git clone https://github.com/your-username/jike2504-website.git
   cd jike2504-website
   ```

2. **安装依赖**：
   ```bash
   npm install
   ```

3. **配置数据库**：
   - 创建 MySQL 数据库（默认：`test` 或 `.env` 中的 `DB_NAME`）。
   - 运行 SQL 创建表（示例：`comments` 表）：
     ```sql
     CREATE TABLE comments (
         id INT AUTO_INCREMENT PRIMARY KEY,
         title VARCHAR(255) NOT NULL,
         content TEXT NOT NULL,
         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
     );
     ```

4. **启动服务器**：
   ```bash
   #在控制台运行以下命令
   npm ./bin/www
   ```
   - 在浏览器里访问 `http://localhost:4000`。
   - 留言测试：POST `/api/message` { "name": "标题", "comments": "内容" }。
  
   - *注意：*
   - 当您在本地环境运行该项目时，某些（大部分）api接口将不可用！

### 开发模式
```bash
npm run dev  # 若添加 nodemon
```

## 🔌 API 接口

- **POST /api/message**：提交留言（JSON: {name, comments}），返回 {message: '成功'} 或 {error: '...'}。
- **GET /api/tables**：列出所有表。
- **GET /api/columns/:table**：获取表列名。
- **GET /**：渲染首页 (index.ejs)。
- **GET /person**：成员页。
- **GET /class**：课程页。

## 📁 项目结构

```
├── app.js          # Express 应用入口
├── db.js           # MySQL 封装类
├── routes/
│   └── index.js    # 路由处理
├── public/         # 静态资源 (CSS, JS, download)
├── views/          # EJS 模板 (index.ejs 等)
├── .env.example    # 环境变量模板
└── README.md       # 你现在看的这个
```

## 🤝 贡献指南

1. Fork 项目，创建分支 `feature/xxx`。
2. 提交 PR，描述变更（e.g., "修复留言验证"）。
3. 遵守代码风格：ES6+, 注释规范（如 db.js）。
4. 测试：运行后检查留言插入、页面切换。

有 Bug 或idea？开 Issue 吐槽吧！（匿名反馈也行 😏）

## 📄 许可证

MIT License - 随意 fork，但别忘了 star 哦~

## 🙌 鸣谢

- 等待你的加入！

**嗨嗨嗨，我们来辣！** 🚀
