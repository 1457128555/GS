# 架构设计文档

## 概述

GS 是一个基于 **PixiJS v8 + TypeScript** 的弹幕互动游戏框架，采用 **Actor-Component** 架构模式，支持 JSON 配置驱动的场景和实体定义。

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| [PixiJS](https://pixijs.com/) | v8.x | 2D 渲染引擎 |
| [TypeScript](https://www.typescriptlang.org/) | v5.6+ | 类型安全 |
| [Vite](https://vitejs.dev/) | v6.x | 构建工具 |

## 系统架构图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              Game                                        │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐  │
│  │   Application    │  │   AssetManager   │  │    TypeRegistry      │  │
│  │    (PixiJS)      │  │    (资源管理)     │  │    (类型注册表)       │  │
│  │                  │  │                  │  │                      │  │
│  │  - 渲染循环       │  │  - 纹理加载       │  │  - Actor 类型注册     │  │
│  │  - 画布管理       │  │  - JSON 加载      │  │  - Component 类型注册 │  │
│  │  - Ticker        │  │  - 资源缓存       │  │  - 实例创建工厂       │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           ActorLoader                                    │
│                                                                          │
│   JSON 配置文件  ──────▶  解析 & 实例化  ──────▶  Actor 对象树           │
│                                                                          │
│   职责：                                                                  │
│   1. 读取 Actor JSON 配置                                                │
│   2. 通过 TypeRegistry 创建 Actor/Component 实例                         │
│   3. 调用 initFromData() 初始化属性                                       │
│   4. 递归处理子 Actor                                                     │
│   5. 支持 path 引用和 override 覆盖                                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              Scene                                       │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                         Actor 树                                 │   │
│  │                                                                  │   │
│  │   Scene (根节点)                                                 │   │
│  │     │                                                            │   │
│  │     ├── Actor (背景)                                             │   │
│  │     │     └── [TextureComp]                                      │   │
│  │     │                                                            │   │
│  │     ├── Actor (泉水)                                             │   │
│  │     │     └── [AnimationComp]                                    │   │
│  │     │                                                            │   │
│  │     └── RoleActor (玩家)                                         │   │
│  │           ├── [LPCRenderComp] - body                             │   │
│  │           ├── [LPCRenderComp] - head                             │   │
│  │           ├── [LPCRenderComp] - jacket                           │   │
│  │           └── ...                                                │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

## 核心模块

### 1. Game (`src/core/Game.ts`)

游戏主类，负责：
- 初始化 PixiJS Application
- 管理游戏画布和自适应缩放
- 场景加载和切换
- 游戏主循环 (Ticker)

```typescript
class Game {
    private mApp: Application;           // PixiJS 应用实例
    private mCurrentScene: Scene | null; // 当前场景
    
    async init(container: HTMLElement);  // 初始化游戏
    loadScene(scene: Scene);             // 加载场景
    destroy();                           // 销毁游戏
}
```

### 2. Actor (`src/core/Actor.ts`)

游戏实体基类，核心概念：

```typescript
class Actor {
    // 属性
    protected mName: string;
    protected mPosition: Point;
    protected mParent: Actor | null;
    protected mChildren: Set<Actor>;
    protected mComponents: Set<Component>;
    protected mContainer: Container;     // PixiJS 容器
    
    // 子实体管理
    addChild(child: Actor);
    removeChild(child: Actor);
    
    // 组件管理
    addComponent(component: Component);
    removeComponent(component: Component);
    
    // 生命周期（可重写）
    protected onAttach(): void;
    protected onUpdate(dt: number): void;
    protected onDetach(): void;
    
    // JSON 属性初始化
    initFromData(properties: Record<string, any>): void;
}
```

### 3. Component (`src/core/Component.ts`)

组件基类，挂载到 Actor 上：

```typescript
abstract class Component {
    protected mName: string;
    protected mParent: Actor | null;
    
    // 生命周期（可重写）
    protected onAttach(): void;
    protected onUpdate(dt: number): void;
    protected onDetach(): void;
    
    // JSON 属性初始化
    initFromData(properties: Record<string, any>): void;
}
```

### 4. TypeRegistry (`src/core/TypeRegistry.ts`)

类型注册表，实现 JSON 配置到运行时实例的映射：

```typescript
class TypeRegistry {
    // 注册
    static registerActor(type: string, ctor: ActorConstructor);
    static registerComponent(type: string, ctor: ComponentConstructor);
    
    // 创建实例
    static createActor(type: string): Actor;
    static createComponent(type: string): Component;
    
    // 检查
    static hasActor(type: string): boolean;
    static hasComponent(type: string): boolean;
}
```

### 5. ActorLoader (`src/core/ActorLoader.ts`)

JSON 配置加载器：

```typescript
class ActorLoader {
    // 从模板加载（支持 path 引用和 override）
    static loadFromTemplate(data: ActorTemplateData): Actor;
    
    // 从完整数据加载
    static loadFromActorData(data: ActorData): Actor;
}
```

### 6. AssetManager (`src/core/AssetManager.ts`)

资源管理器（单例）：

```typescript
class AssetManager {
    static Instance(): AssetManager;
    
    // 加载所有资源（根据 ResourceCollect.json）
    async load(onProgress?: (progress: number, message: string) => void);
    
    // 获取资源
    getTexture(path: string): Texture;
    getFile(path: string): any;
    
    // 卸载
    unload(): void;
}
```

## 生命周期

### Actor 生命周期

```
创建 ──▶ initFromData() ──▶ _attach() ──▶ onAttach()
                                              │
                                              ▼
                                    ┌─────────────────┐
                                    │  Game Loop      │
                                    │  _update(dt)    │◀────┐
                                    │  onUpdate(dt)   │     │
                                    └────────┬────────┘     │
                                             │              │
                                             └──────────────┘
                                              │
                                              ▼
                              onDetach() ──▶ _detach() ──▶ 销毁
```

### Component 生命周期

与 Actor 类似，但组件的 `onAttach()` 在被添加到 Actor 后立即调用。

```
创建 ──▶ initFromData() ──▶ actor.addComponent() ──▶ _attach() ──▶ onAttach()
                                                                      │
                                                        ┌─────────────┘
                                                        ▼
                                              ┌─────────────────┐
                                              │  每帧更新        │
                                              │  _update(dt)    │
                                              │  onUpdate(dt)   │
                                              └─────────────────┘
                                                        │
                                                        ▼
                              actor.removeComponent() ──▶ onDetach() ──▶ _detach()
```

## 数据流

### 启动流程

```
main.ts
    │
    ├── 1. registerAllTypes()          // 注册所有 Actor/Component 类型
    │
    ├── 2. new Game()
    │
    ├── 3. game.init(container)
    │       ├── 初始化 PixiJS Application
    │       └── AssetManager.load()    // 加载所有资源
    │
    ├── 4. ActorLoader.loadFromTemplate()
    │       ├── 读取 JSON 配置
    │       ├── 递归创建 Actor 树
    │       └── 初始化所有 Component
    │
    └── 5. game.loadScene(scene)
            ├── 添加到舞台
            └── 启动 Ticker 更新循环
```

### JSON 加载流程

```
JSON 文件 (path)
    │
    ▼
AssetManager.getFile(path)
    │
    ▼
ActorLoader.loadFromTemplate({ path, override })
    │
    ├── TypeRegistry.createActor(type)   // 创建 Actor 实例
    │
    ├── actor.initFromData(properties)   // 初始化属性
    │
    ├── 遍历 components[]
    │   ├── TypeRegistry.createComponent(type)
    │   ├── component.initFromData(properties)
    │   └── actor.addComponent(component)
    │
    └── 遍历 children[]
        └── ActorLoader.loadFromTemplate(child)  // 递归
            └── actor.addChild(childActor)
```

## 目录结构

```
GS/
├── public/                    # 静态资源（会被原样复制到构建产物）
│   ├── actors/               # Actor JSON 配置
│   │   ├── game_scene.json   # 主场景
│   │   ├── player.json       # 玩家配置
│   │   └── ...
│   ├── texture/              # 纹理资源
│   │   ├── character/        # 角色精灵表
│   │   ├── main_map/         # 地图纹理
│   │   └── ...
│   └── ResourceCollect.json  # 资源清单（自动生成）
│
├── src/
│   ├── actor/                # Actor 类
│   │   ├── Scene.ts          # 场景 Actor
│   │   ├── RoleActor.ts      # 角色 Actor（带状态机）
│   │   └── PlayerActor.ts    # 玩家 Actor
│   │
│   ├── component/            # Component 组件
│   │   ├── TextureComp.ts    # 静态纹理组件
│   │   ├── AnimationComp.ts  # 动画组件
│   │   └── LPCRenderComp.ts  # LPC 角色渲染组件
│   │
│   ├── core/                 # 核心框架
│   │   ├── Actor.ts          # Actor 基类
│   │   ├── Component.ts      # Component 基类
│   │   ├── Game.ts           # 游戏主类
│   │   ├── ActorLoader.ts    # JSON 加载器
│   │   ├── TypeRegistry.ts   # 类型注册表
│   │   ├── AssetManager.ts   # 资源管理器
│   │   └── RegisterTypes.ts  # 类型注册入口
│   │
│   ├── main.ts               # 入口文件
│   └── style.css             # 样式
│
├── scripts/
│   └── resource_collect.cjs  # 资源清单生成脚本
│
├── docs/                     # 项目文档
├── .cursor/                  # Cursor AI 配置
├── index.html                # HTML 入口
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 扩展指南

### 添加新的 Actor 类型

1. 在 `src/actor/` 创建新文件
2. 继承 `Actor` 或已有子类
3. 实现 `initFromData()` 处理 JSON 属性
4. 在 `src/core/RegisterTypes.ts` 注册

### 添加新的 Component 类型

1. 在 `src/component/` 创建新文件
2. 继承 `Component`
3. 实现 `initFromData()` 和生命周期方法
4. 在 `src/core/RegisterTypes.ts` 注册

### 添加新的资源

1. 将资源文件放入 `public/` 对应目录
2. 运行 `npm run manifest` 更新资源清单
3. 在 JSON 配置或代码中使用 `/path/to/resource` 引用
