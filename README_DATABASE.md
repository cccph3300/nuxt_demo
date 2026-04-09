# Nuxt.js + MySQL 全栈用户管理系统

这是一个基于Nuxt.js 4和MySQL的全栈示例项目，展示了如何连接MySQL数据库并实现用户管理功能。

## 项目结构

```
├── server/
│   ├── utils/
│   │   └── database.ts      # 数据库连接配置
│   └── api/
│       ├── init.post.ts     # 数据库初始化API
│       ├── users.get.ts     # 获取用户列表API
│       └── users.post.ts    # 添加用户API
├── app/
│   └── pages/
│       └── index.vue        # 用户管理页面
├── .env                     # 环境变量配置
└── package.json
```

## 安装依赖

由于网络问题，需要手动安装MySQL驱动：

```bash
pnpm add mysql2
```

## 数据库配置

1. 确保MySQL服务正在运行
2. 修改 `.env` 文件中的数据库连接信息：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=nuxt_demo
```

3. 在MySQL中创建数据库：

```sql
CREATE DATABASE nuxt_demo;
```

## 运行项目

```bash
# 开发模式
pnpm dev

# 构建生产版本
pnpm build

# 预览生产版本
pnpm preview
```

## 功能说明

### 后端API

- `GET /api/users` - 获取用户列表
- `POST /api/users` - 添加新用户
- `POST /api/init` - 初始化数据库（创建表并插入示例数据）

### 前端功能

- 用户列表展示
- 添加新用户表单
- 数据库初始化按钮
- 实时状态显示
- 错误处理和成功提示

## 技术栈

- **前端**: Nuxt.js 4, Vue 3, TypeScript, Tailwind CSS
- **后端**: Nuxt Server API, MySQL
- **UI组件**: Nuxt UI
- **数据库**: MySQL

## 使用说明

1. 启动项目后，访问首页
2. 如果数据库为空，点击"初始化数据库"按钮
3. 在左侧表单中添加新用户
4. 右侧会实时显示用户列表

## 注意事项

- 确保MySQL服务已启动
- 修改.env文件中的数据库连接信息
- 首次使用需要先初始化数据库