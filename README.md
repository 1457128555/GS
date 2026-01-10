# GS 弹幕游戏

基于 PixiJS + TypeScript 的游戏框架。

## 环境要求

- [Node.js](https://nodejs.org/) >= 18.0.0（推荐 LTS 版本）
- npm >= 9.0.0（随 Node.js 一起安装）

### 安装 Node.js

**Windows:**
1. 访问 [Node.js 官网](https://nodejs.org/)
2. 下载 LTS 版本安装包
3. 双击运行，一路 Next 完成安装
4. 打开命令行，输入 `node -v` 和 `npm -v` 验证安装成功

**macOS:**
```bash
# 使用 Homebrew
brew install node

# 或下载官网安装包
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

浏览器访问 http://localhost:5173

### 3. 构建生产版本

```bash
npm run build
```

构建产物在 `dist/` 目录下。

### 4. 预览生产版本

```bash
npm run preview
```

## 项目结构

```
GS/
├── public/                 # 静态资源
│   ├── scenes/            # 场景 JSON 配置
│   │   └── main_scene.json
│   ├── map.png
│   └── spring_water.png
├── src/
│   ├── actor/             # Actor 类
│   │   └── Scene.ts
│   ├── component/         # Component 组件
│   │   ├── TextureComp.ts
│   │   └── SpringWaterComp.ts
│   ├── core/              # 核心框架
│   │   ├── Actor.ts
│   │   ├── Component.ts
│   │   ├── Game.ts
│   │   ├── AssetManager.ts
│   │   ├── SceneLoader.ts
│   │   ├── TypeRegistry.ts
│   │   └── RegisterTypes.ts
│   └── main.ts            # 入口文件
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 场景配置

场景使用 JSON 格式配置，支持 Actor 嵌套和 Component 挂载：

```json
{
    "type": "Scene",
    "properties": { "name": "GameScene", "width": 720, "height": 1280 },
    "components": [
        {
            "type": "TextureComp",
            "properties": {
                "path": "/map.png",
                "size": { "x": 720, "y": 1280 },
                "position": { "x": 0, "y": 0 }
            }
        }
    ],
    "children": [
        {
            "type": "Actor",
            "properties": { "name": "Player" },
            "components": [...],
            "children": []
        }
    ]
}
```

## 技术栈

- [PixiJS](https://pixijs.com/) v8 - 2D 渲染引擎
- [TypeScript](https://www.typescriptlang.org/) - 类型安全
- [Vite](https://vitejs.dev/) - 构建工具

## License

MIT
