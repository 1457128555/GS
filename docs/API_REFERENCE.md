# API 参考手册

本文档提供 GS 弹幕游戏框架的完整 API 参考。

---

## 目录

- [核心类](#核心类)
  - [Game](#game)
  - [Actor](#actor)
  - [Component](#component)
  - [Scene](#scene)
- [角色系统](#角色系统)
  - [RoleActor](#roleactor)
  - [PlayerActor](#playeractor)
- [组件](#组件)
  - [TextureComp](#texturecomp)
  - [AnimationComp](#animationcomp)
  - [LPCRenderComp](#lpcrendercomp)
- [工具类](#工具类)
  - [TypeRegistry](#typeregistry)
  - [ActorLoader](#actorloader)
  - [AssetManager](#assetmanager)
- [枚举和接口](#枚举和接口)

---

## 核心类

### Game

游戏主类，负责初始化和管理游戏生命周期。

**文件位置**：`src/core/Game.ts`

#### 属性

| 属性 | 类型 | 访问 | 说明 |
|------|------|------|------|
| `mWidth` | `number` | readonly | 游戏宽度，默认 720 |
| `mHeight` | `number` | readonly | 游戏高度，默认 1280 |

#### 方法

##### `constructor()`

创建游戏实例。

```typescript
const game = new Game();
```

##### `init(container: HTMLElement): Promise<void>`

初始化游戏，包括 PixiJS 和资源加载。

| 参数 | 类型 | 说明 |
|------|------|------|
| `container` | `HTMLElement` | 游戏画布容器 |

```typescript
const container = document.getElementById('game');
await game.init(container);
```

##### `loadScene(scene: Scene): void`

加载并显示场景。

| 参数 | 类型 | 说明 |
|------|------|------|
| `scene` | `Scene` | 要加载的场景 |

```typescript
const scene = ActorLoader.loadFromTemplate({ path: '/actors/game_scene.json' }) as Scene;
game.loadScene(scene);
```

##### `destroy(): void`

销毁游戏，释放资源。

```typescript
game.destroy();
```

---

### Actor

游戏实体基类，所有游戏对象的基础。

**文件位置**：`src/core/Actor.ts`

#### 属性

| 属性 | 类型 | 访问 | 说明 |
|------|------|------|------|
| `mName` | `string` | protected | 实体名称 |
| `mPosition` | `Point` | protected | 位置坐标 |
| `mParent` | `Actor \| null` | protected | 父实体 |
| `mChildren` | `Set<Actor>` | protected | 子实体集合 |
| `mComponents` | `Set<Component>` | protected | 组件集合 |
| `mContainer` | `Container` | protected | PixiJS 容器 |

#### Getter

##### `container: Container`

获取 PixiJS 容器。

```typescript
actor.container.addChild(sprite);
```

##### `position: Point`

获取当前位置。

```typescript
const pos = actor.position;
console.log(pos.x, pos.y);
```

#### 方法

##### `setPosition(x: number, y: number): void`

设置位置。

```typescript
actor.setPosition(100, 200);
```

##### `addChild(child: Actor): void`

添加子实体。

```typescript
const child = new Actor();
actor.addChild(child);
```

##### `removeChild(child: Actor): void`

移除子实体。

```typescript
actor.removeChild(child);
```

##### `addComponent(component: Component): void`

添加组件。

```typescript
const comp = new TextureComp();
actor.addComponent(comp);
```

##### `removeComponent(component: Component): void`

移除组件。

```typescript
actor.removeComponent(comp);
```

##### `initFromData(properties: Record<string, any>): void`

从 JSON 属性初始化。子类应重写此方法。

| 支持的属性 | 类型 | 说明 |
|------------|------|------|
| `name` | `string` | 实体名称 |
| `position` | `{ x, y }` | 位置坐标 |

```typescript
actor.initFromData({
    name: 'MyActor',
    position: { x: 100, y: 200 }
});
```

#### 生命周期钩子（可重写）

##### `protected onAttach(): void`

挂载到父实体时调用。

##### `protected onUpdate(dt: number): void`

每帧更新时调用。

| 参数 | 类型 | 说明 |
|------|------|------|
| `dt` | `number` | 距上一帧的时间（秒） |

##### `protected onDetach(): void`

从父实体移除时调用。

---

### Component

组件抽象基类，所有组件的基础。

**文件位置**：`src/core/Component.ts`

#### 属性

| 属性 | 类型 | 访问 | 说明 |
|------|------|------|------|
| `mName` | `string` | protected | 组件名称 |
| `mParent` | `Actor \| null` | protected | 所属实体 |

#### Getter

##### `parent: Actor | null`

获取所属实体。

```typescript
const actor = component.parent;
```

#### 方法

##### `initFromData(properties: Record<string, any>): void`

从 JSON 属性初始化。

| 支持的属性 | 类型 | 说明 |
|------------|------|------|
| `name` | `string` | 组件名称 |

#### 生命周期钩子（可重写）

##### `protected onAttach(): void`

挂载到实体时调用。此时 `this.parent` 可用。

##### `protected onUpdate(dt: number): void`

每帧更新时调用。

##### `protected onDetach(): void`

从实体移除时调用。

---

### Scene

场景类，作为 Actor 树的根节点。

**文件位置**：`src/actor/Scene.ts`

继承自 `Actor`。

#### 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `mWidth` | `number` | 场景宽度 |
| `mHeight` | `number` | 场景高度 |

#### initFromData 支持的属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `name` | `string` | `"Scene"` | 场景名称 |
| `width` | `number` | `720` | 场景宽度 |
| `height` | `number` | `1280` | 场景高度 |

---

## 角色系统

### RoleActor

角色实体，包含状态机（动作+方向）。

**文件位置**：`src/actor/RoleActor.ts`

继承自 `Actor`。

#### 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `mDirection` | `Point` | 移动方向向量 |
| `mSpeed` | `number` | 移动速度 |
| `mState` | `RoleState` | 当前状态 |

#### Getter

##### `state: RoleState`

获取当前状态。

```typescript
const state = role.state;
console.log(state.action, state.direction);
```

#### 方法

##### `setAction(action: RoleAction): void`

设置动作。

```typescript
role.setAction(RoleAction.WALK);
```

##### `setDirection(direction: RoleDirection): void`

设置朝向。

```typescript
role.setDirection(RoleDirection.LEFT);
```

##### `addStateListener(listener: (state: RoleState) => void): void`

添加状态变化监听器。

```typescript
role.addStateListener((state) => {
    console.log('状态变化:', state);
});
```

##### `removeStateListener(listener: (state: RoleState) => void): void`

移除状态监听器。

#### initFromData 支持的属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `name` | `string` | - | 角色名称 |
| `position` | `{ x, y }` | - | 位置 |
| `direction` | `RoleDirection` | `DOWN` | 初始朝向 |
| `speed` | `number` | `100` | 移动速度 |

---

### PlayerActor

玩家角色，继承自 `RoleActor`。

**文件位置**：`src/actor/PlayerActor.ts`

当前实现为测试用途，每秒自动攻击并切换方向。

---

## 组件

### TextureComp

静态纹理组件，显示单张图片。

**文件位置**：`src/component/TextureComp.ts`

#### initFromData 支持的属性

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `path` | `string` | ✅ | 纹理文件路径 |
| `size` | `{ x, y }` | ❌ | 显示尺寸 |
| `position` | `{ x, y }` | ❌ | 位置偏移 |

```json
{
    "type": "TextureComp",
    "properties": {
        "path": "/texture/main_map/main_map.png",
        "size": { "x": 720, "y": 1280 }
    }
}
```

---

### AnimationComp

帧动画组件，播放精灵表动画。

**文件位置**：`src/component/AnimationComp.ts`

#### initFromData 支持的属性

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `path` | `string` | ✅ | 精灵表路径 |
| `frameWidth` | `number` | ✅ | 单帧宽度 |
| `frameHeight` | `number` | ✅ | 单帧高度 |
| `frameCount` | `number` | ✅ | 总帧数 |
| `animationSpeed` | `number` | ❌ | 播放速度（默认 0.1） |
| `loop` | `boolean` | ❌ | 是否循环（默认 true） |

---

### LPCRenderComp

LPC 风格角色渲染组件，支持多动作多方向。

**文件位置**：`src/component/LPCRenderComp.ts`

#### initFromData 支持的属性

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `path` | `string` | ✅ | LPC 精灵表路径 |
| `zIndex` | `number` | ❌ | 渲染层级 |
| `config` | `LPCSheetConfig` | ❌ | 精灵表配置 |

#### LPCSheetConfig

```typescript
interface LPCSheetConfig {
    frameWidth: number;     // 单帧宽度，默认 64
    frameHeight: number;    // 单帧高度，默认 64
    actions: Record<RoleAction, {
        row: number;        // 起始行
        frameCount: number; // 帧数
        loop: boolean;      // 是否循环
    }>;
}
```

**默认配置**：

| 动作 | 起始行 | 帧数 | 循环 |
|------|--------|------|------|
| IDLE | 10 | 1 | 否 |
| WALK | 8 | 9 | 是 |
| SLASH | 12 | 6 | 否 |
| BACK_SLASH | 18 | 6 | 否 |

---

## 工具类

### TypeRegistry

类型注册表，管理可序列化的 Actor 和 Component 类型。

**文件位置**：`src/core/TypeRegistry.ts`

#### 静态方法

##### `registerActor(type: string, ctor: ActorConstructor): void`

注册 Actor 类型。

```typescript
TypeRegistry.registerActor('MyActor', MyActor);
```

##### `registerComponent(type: string, ctor: ComponentConstructor): void`

注册 Component 类型。

```typescript
TypeRegistry.registerComponent('MyComp', MyComp);
```

##### `createActor(type: string): Actor`

创建 Actor 实例。

```typescript
const actor = TypeRegistry.createActor('PlayerActor');
```

##### `createComponent(type: string): Component`

创建 Component 实例。

```typescript
const comp = TypeRegistry.createComponent('TextureComp');
```

##### `hasActor(type: string): boolean`

检查 Actor 类型是否已注册。

##### `hasComponent(type: string): boolean`

检查 Component 类型是否已注册。

---

### ActorLoader

Actor 加载器，将 JSON 配置转换为 Actor 实例。

**文件位置**：`src/core/ActorLoader.ts`

#### 静态方法

##### `loadFromTemplate(data: ActorTemplateData): Actor`

从模板加载 Actor。

```typescript
interface ActorTemplateData {
    path: string;                      // JSON 文件路径
    override?: Record<string, any>;    // 覆盖属性
}
```

```typescript
const player = ActorLoader.loadFromTemplate({
    path: '/actors/player.json',
    override: { name: 'Player_1' }
});
```

##### `loadFromActorData(data: ActorData): Actor`

从完整配置加载 Actor。

```typescript
interface ActorData {
    type: string;
    properties?: Record<string, any>;
    components?: ComponentData[];
    children?: ActorTemplateData[];
}
```

---

### AssetManager

资源管理器（单例），管理纹理和 JSON 文件。

**文件位置**：`src/core/AssetManager.ts`

#### 静态方法

##### `Instance(): AssetManager`

获取单例实例。

```typescript
const assets = AssetManager.Instance();
```

#### 实例方法

##### `load(onProgress?: (progress: number, message: string) => void): Promise<void>`

加载所有资源（根据 ResourceCollect.json）。

```typescript
await AssetManager.Instance().load((progress, message) => {
    console.log(`${Math.round(progress * 100)}% - ${message}`);
});
```

##### `unload(): void`

卸载所有资源。

##### `getTexture(path: string): Texture`

获取纹理。

```typescript
const texture = AssetManager.Instance().getTexture('/texture/map.png');
```

##### `getFile(path: string): any`

获取 JSON 文件内容（返回深拷贝）。

```typescript
const data = AssetManager.Instance().getFile('/actors/player.json');
```

##### `hasTexture(path: string): boolean`

检查纹理是否已加载。

##### `hasFile(path: string): boolean`

检查文件是否已加载。

---

## 枚举和接口

### RoleAction

角色动作枚举。

```typescript
enum RoleAction {
    IDLE = 'idle',           // 待机
    WALK = 'walk',           // 行走
    SLASH = 'slash',         // 斩击
    BACK_SLASH = 'back_slash', // 背斩
}
```

### RoleDirection

角色方向枚举。

```typescript
enum RoleDirection {
    UP = 0,     // 上
    LEFT = 1,   // 左
    DOWN = 2,   // 下
    RIGHT = 3,  // 右
}
```

### RoleState

角色状态接口。

```typescript
interface RoleState {
    action: RoleAction;
    direction: RoleDirection;
}
```

### ActorData

Actor 配置数据接口。

```typescript
interface ActorData {
    type: string;
    properties?: Record<string, any>;
    components?: ComponentData[];
    children?: ActorTemplateData[];
}
```

### ActorTemplateData

Actor 模板引用接口。

```typescript
interface ActorTemplateData {
    path: string;
    override?: Record<string, any>;
}
```

### ComponentData

组件配置数据接口。

```typescript
interface ComponentData {
    type: string;
    name?: string;
    properties?: Record<string, any>;
}
```

### ResourceManifest

资源清单接口。

```typescript
interface ResourceManifest {
    textures?: string[];    // 纹理路径数组
    files?: string[];       // JSON 文件路径数组
}
```

---

## 扩展指南

### 创建自定义 Actor

```typescript
import { Actor } from '../core/Actor';
import { TypeRegistry } from '../core/TypeRegistry';

export class CustomActor extends Actor {
    private mHealth: number = 100;
    
    override initFromData(properties: Record<string, any>): void {
        super.initFromData(properties);
        if ('health' in properties)
            this.mHealth = properties.health;
    }
    
    protected override onUpdate(dt: number): void {
        // 自定义更新逻辑
    }
}

// 注册类型
TypeRegistry.registerActor('CustomActor', CustomActor);
```

### 创建自定义 Component

```typescript
import { Component } from '../core/Component';
import { TypeRegistry } from '../core/TypeRegistry';

export class CustomComp extends Component {
    private mDuration: number = 1.0;
    
    override initFromData(properties: Record<string, any>): void {
        super.initFromData(properties);
        if ('duration' in properties)
            this.mDuration = properties.duration;
    }
    
    protected override onAttach(): void {
        // 初始化，this.parent 可用
    }
    
    protected override onUpdate(dt: number): void {
        // 每帧更新
    }
    
    protected override onDetach(): void {
        // 清理
    }
}

// 注册类型
TypeRegistry.registerComponent('CustomComp', CustomComp);
```
