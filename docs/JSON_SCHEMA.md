# JSON 配置格式规范

本文档定义了 GS 弹幕游戏中所有 JSON 配置文件的格式规范。

## 概述

GS 使用 JSON 文件来定义游戏场景和实体，实现**数据驱动**的开发模式。主要优势：

- 无需修改代码即可调整游戏内容
- 支持热重载（开发时修改 JSON 立即生效）
- 易于非程序员（如策划）编辑
- 支持模板复用和属性覆盖

## 文件组织

```
public/
├── actors/                    # Actor 配置目录
│   ├── game_scene.json       # 主场景配置
│   ├── player.json           # 玩家配置
│   ├── spring_water.json     # 泉水配置
│   └── reborn_stone.json     # 复活石配置
└── ResourceCollect.json      # 资源清单（自动生成，勿手动编辑）
```

---

## 数据结构定义

### ActorData（Actor 配置）

完整的 Actor 定义，包含类型、属性、组件和子实体。

```typescript
interface ActorData {
    type: string;                        // 必填：Actor 类型名（需在 TypeRegistry 注册）
    properties?: Record<string, any>;    // 可选：Actor 的属性
    components?: ComponentData[];        // 可选：挂载的组件列表
    children?: ActorTemplateData[];      // 可选：子 Actor 列表（使用模板引用）
}
```

### ActorTemplateData（Actor 模板引用）

引用另一个 JSON 文件作为模板，并可覆盖部分属性。

```typescript
interface ActorTemplateData {
    path: string;                        // 必填：JSON 文件路径（以 / 开头）
    override?: Record<string, any>;      // 可选：覆盖模板中的属性
}
```

### ComponentData（Component 配置）

```typescript
interface ComponentData {
    type: string;                        // 必填：Component 类型名（需在 TypeRegistry 注册）
    name?: string;                       // 可选：组件名称（用于调试和查找）
    properties?: Record<string, any>;    // 可选：组件的属性
}
```

---

## 内置属性

### Actor 基类属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `name` | `string` | `"Actor"` | 实体名称 |
| `position` | `{ x: number, y: number }` | `{ x: 0, y: 0 }` | 位置坐标 |

### Scene 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `name` | `string` | `"Scene"` | 场景名称 |
| `width` | `number` | `720` | 场景宽度 |
| `height` | `number` | `1280` | 场景高度 |

### RoleActor 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `name` | `string` | `"Actor"` | 角色名称 |
| `position` | `{ x, y }` | `{ x: 0, y: 0 }` | 位置 |
| `direction` | `RoleDirection` | `2` (DOWN) | 初始朝向 |
| `speed` | `number` | `100` | 移动速度 |

---

## 内置组件属性

### TextureComp（静态纹理）

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `path` | `string` | ✅ | 纹理文件路径 |
| `size` | `{ x: number, y: number }` | ❌ | 显示尺寸 |
| `position` | `{ x: number, y: number }` | ❌ | 相对位置偏移 |

### AnimationComp（帧动画）

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `path` | `string` | ✅ | 精灵表文件路径 |
| `frameWidth` | `number` | ✅ | 单帧宽度 |
| `frameHeight` | `number` | ✅ | 单帧高度 |
| `frameCount` | `number` | ✅ | 帧数 |
| `animationSpeed` | `number` | ❌ | 播放速度（默认 0.1） |
| `loop` | `boolean` | ❌ | 是否循环（默认 true） |

### LPCRenderComp（LPC 角色渲染）

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `path` | `string` | ✅ | LPC 精灵表路径 |
| `zIndex` | `number` | ❌ | 渲染层级（默认 0） |
| `config` | `LPCSheetConfig` | ❌ | 精灵表配置（见下方） |

**LPCSheetConfig**（LPC 精灵表配置）：

```typescript
interface LPCSheetConfig {
    frameWidth: number;    // 单帧宽度，默认 64
    frameHeight: number;   // 单帧高度，默认 64
    actions: {
        [action: string]: {
            row: number;       // 起始行
            frameCount: number; // 帧数
            loop: boolean;     // 是否循环
        }
    };
}
```

---

## 完整示例

### 场景配置 (`public/actors/game_scene.json`)

```json
{
    "type": "Scene",
    "properties": {
        "name": "GameScene",
        "width": 720,
        "height": 1280
    },
    "components": [
        {
            "type": "TextureComp",
            "name": "Background",
            "properties": {
                "path": "/texture/main_map/main_map.png",
                "size": { "x": 720, "y": 1280 },
                "position": { "x": 0, "y": 0 }
            }
        }
    ],
    "children": [
        {
            "path": "/actors/spring_water.json",
            "override": {
                "name": "SpringWater_0",
                "position": { "x": 295, "y": 1180 }
            }
        },
        {
            "path": "/actors/spring_water.json",
            "override": {
                "name": "SpringWater_1",
                "position": { "x": 295, "y": 0 }
            }
        },
        {
            "path": "/actors/player.json",
            "override": {
                "name": "Player"
            }
        }
    ]
}
```

### 玩家配置 (`public/actors/player.json`)

```json
{
    "type": "PlayerActor",
    "properties": {
        "name": "Player",
        "position": { "x": 360, "y": 640 }
    },
    "components": [
        {
            "name": "BodyRender",
            "type": "LPCRenderComp",
            "properties": {
                "path": "/texture/character/body/body.png",
                "zIndex": 100
            }
        },
        {
            "name": "HeadRender",
            "type": "LPCRenderComp",
            "properties": {
                "path": "/texture/character/head/level_1.png",
                "zIndex": 101
            }
        },
        {
            "name": "JacketRender",
            "type": "LPCRenderComp",
            "properties": {
                "path": "/texture/character/jacket/level_1.png",
                "zIndex": 102
            }
        },
        {
            "name": "PantsRender",
            "type": "LPCRenderComp",
            "properties": {
                "path": "/texture/character/pants/level_1.png",
                "zIndex": 103
            }
        },
        {
            "name": "ShoeRender",
            "type": "LPCRenderComp",
            "properties": {
                "path": "/texture/character/shoe/level_1.png",
                "zIndex": 104
            }
        },
        {
            "name": "SwordRender",
            "type": "LPCRenderComp",
            "properties": {
                "path": "/texture/character/sword/level_1.png",
                "zIndex": 105
            }
        }
    ],
    "children": []
}
```

### 动画实体配置示例

```json
{
    "type": "Actor",
    "properties": {
        "name": "SpringWater",
        "position": { "x": 0, "y": 0 }
    },
    "components": [
        {
            "type": "AnimationComp",
            "name": "WaterAnimation",
            "properties": {
                "path": "/texture/spring_water/spring_water_sheet.png",
                "frameWidth": 128,
                "frameHeight": 128,
                "frameCount": 8,
                "animationSpeed": 0.15,
                "loop": true
            }
        }
    ],
    "children": []
}
```

---

## 模板复用

### 基本用法

使用 `path` 引用其他 JSON 文件作为模板：

```json
{
    "children": [
        { "path": "/actors/enemy.json" }
    ]
}
```

### 属性覆盖

使用 `override` 覆盖模板中的属性：

```json
{
    "children": [
        {
            "path": "/actors/enemy.json",
            "override": {
                "name": "Enemy_01",
                "position": { "x": 100, "y": 200 }
            }
        },
        {
            "path": "/actors/enemy.json",
            "override": {
                "name": "Enemy_02",
                "position": { "x": 300, "y": 400 }
            }
        }
    ]
}
```

### 覆盖规则

- `override` 中的属性会与模板的 `properties` 合并
- 相同属性以 `override` 为准
- 不影响 `components` 和 `children`

---

## 路径规范

### 资源路径

- 以 `/` 开头，表示相对于 `public/` 目录
- 示例：`/texture/character/body/body.png` → `public/texture/character/body/body.png`

### Actor 配置路径

- 统一放在 `public/actors/` 目录
- 路径格式：`/actors/xxx.json`

---

## 常见错误

### 1. 类型未注册

```
Error: Unknown actor type: "MyActor". Did you forget to register it?
```

**解决**：在 `src/core/RegisterTypes.ts` 中注册类型。

### 2. 资源未加载

```
Error: Texture "/xxx.png" not loaded!
```

**解决**：
1. 确认文件存在于 `public/` 目录
2. 运行 `npm run manifest` 更新资源清单

### 3. JSON 语法错误

```
SyntaxError: Unexpected token...
```

**解决**：检查 JSON 格式，使用 JSON 验证工具。

---

## JSON Schema（可选）

如需 IDE 智能提示，可在 JSON 文件开头添加 `$schema` 引用：

```json
{
    "$schema": "../schemas/actor.schema.json",
    "type": "Actor",
    ...
}
```

> 注：Schema 文件需要另外创建，这里只是预留支持。
