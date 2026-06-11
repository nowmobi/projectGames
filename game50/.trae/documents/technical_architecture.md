
# 咨询网站技术架构文档

## 1. 技术选型

### 1.1 前端框架

| 分类 | 技术 | 版本 | 选型理由 |
| :--- | :--- | :--- | :--- |
| 框架 | Vue 3 | 3.x | 轻量、响应式、Composition API便于维护 |
| 构建工具 | Vite | 6.x | 快速构建、热更新 |
| 样式 | TailwindCSS | 3.x | 原子化CSS、快速开发 |
| 图标 | Lucide Vue | 0.x | 轻量图标库 |

### 1.2 项目结构

```
src/
├── components/          # 组件目录
│   ├── Header.vue       # 头部组件
│   ├── SearchBox.vue    # 搜索框组件
│   └── NewsList.vue     # 资讯列表组件
├── data/                # 数据目录
│   └── data.json        # 模拟数据
├── utils/               # 工具函数
│   └── api.js           # API请求封装
├── App.vue              # 根组件
├── main.js              # 入口文件
└── style.css            # 全局样式
```

### 1.3 核心组件职责

| 组件 | 职责 | 状态管理 |
| :--- | :--- | :--- |
| Header | 展示域名标识和搜索框 | 通过props接收搜索关键词 |
| SearchBox | 处理搜索输入 | 内部维护输入状态 |
| NewsList | 展示资讯列表 | 通过props接收数据 |

## 2. API接口设计

### 2.1 接口列表

| 接口名称 | URL | 方法 | 用途 |
| :--- | :--- | :--- | :--- |
| 获取资讯列表 | `https://news-api.szwyi.com/api/compatible/finance_info/db.json?num=40&thirdCategoryIds=2234,2235,2236,2237,2238,2239,2240` | GET | 获取资讯数据 |

### 2.2 响应数据结构

```json
{
  "code": 200,
  "data": [
    {
      "id": "number",
      "title": "string",
      "description": "string",
      "image": "string",
      "category": "string",
      "publishTime": "string"
    }
  ]
}
```

## 3. 状态管理

### 3.1 全局状态

| 状态 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| newsList | Array | [] | 资讯列表数据 |
| searchKeyword | String | "" | 搜索关键词 |
| loading | Boolean | false | 加载状态 |

### 3.2 状态流转

```
用户输入搜索关键词
    ↓
更新searchKeyword状态
    ↓
触发搜索请求
    ↓
更新loading状态为true
    ↓
获取数据成功
    ↓
更新newsList状态
    ↓
更新loading状态为false
```

## 4. 路由设计

| 路径 | 组件 | 说明 |
| :--- | :--- | :--- |
| / | App.vue | 首页，展示资讯列表 |

## 5. 性能优化

### 5.1 图片懒加载

- 使用Intersection Observer API实现图片懒加载
- 设置占位符避免布局偏移

### 5.2 请求优化

- 使用防抖处理搜索输入
- 缓存请求结果

## 6. 安全性

### 6.1 XSS防护

- 使用Vue模板语法自动转义
- 对用户输入进行过滤

### 6.2 CORS处理

- 配置代理处理跨域请求
