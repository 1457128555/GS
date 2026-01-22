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
  - [HeroActor](#heroactor)
  - [EnemyActor](#enemyactor)
  - [PlayerActor](#playeractor)
- [组件](#组件)
  - [TextureComp](#texturecomp)
  - [AnimationComp](#animationcomp)
  - [LPCRenderComp](#lpcrendercomp)
  - [BattleComp](#battlecomp)
  - [HealthBarComp](#healthbarcomp)
- [管理器](#管理器)
  - [BattleManager](#battlemanager)
  - [HeroManager](#heromanager)
  - [EnemyManager](#enemymanager)
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

加载并显示场景，启动游戏主循环。

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

角色实体基类，包含状态机（动作+方向）和战斗属性。

**文件位置**：`src/actor/RoleActor.ts`

继承自 `Actor`。

#### 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `mDirection` | `Point` | `(0, 0)` | 移动方向向量 |
| `mSpeed` | `number` | `100` | 移动速度 |
| `mState` | `RoleState` | - | 当前状态 |
| `mFaction` | `RoleFaction` | `HERO` | 阵营 |
| `mHP` | `number` | `100` | 当前血量 |
| `mMaxHP` | `number` | `100` | 最大血量 |
| `mATK` | `number` | `10` | 攻击力 |
| `mAttackRange` | `number` | `60` | 攻击范围 |
| `mAttackCooldown` | `number` | `1.0` | 攻击冷却时间 |
| `mIsDead` | `boolean` | `false` | 是否死亡 |

#### Getter

```typescript
role.state;           // RoleState
role.faction;         // RoleFaction
role.hp;              // number
role.maxHP;           // number
role.atk;             // number
role.attackRange;     // number
role.attackCooldown;  // number
role.isDead;          // boolean
role.speed;           // number
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

##### `takeDamage(damage: number, attacker?: RoleActor): void`

受到伤害。

```typescript
role.takeDamage(25, attacker);
```

##### `heal(amount: number): void`

治疗（恢复血量）。

```typescript
role.heal(50);
```

##### `distanceTo(target: RoleActor): number`

计算与目标的距离。

```typescript
const dist = role.distanceTo(enemy);
```

##### `faceTarget(target: RoleActor): void`

朝向目标。

```typescript
role.faceTarget(enemy);
```

##### `moveToward(target: RoleActor, dt: number): void`

向目标移动（每帧调用）。

```typescript
role.moveToward(enemy, deltaTime);
```

##### `applyForce(forceX: number, forceY: number): void`

应用外力（用于碰撞分离）。

```typescript
role.applyForce(10, 5);
```

##### `addStateListener(listener: (state: RoleState) => void): void`

添加状态变化监听器。

```typescript
role.addStateListener((state) => {
    console.log('状态变化:', state.action, state.direction);
});
```

##### `removeStateListener(listener: (state: RoleState) => void): void`

移除状态监听器。

##### `addHPListener(listener: (hp: number, maxHP: number) => void): void`

添加血量变化监听器。

```typescript
role.addHPListener((hp, maxHP) => {
    console.log(`HP: ${hp}/${maxHP}`);
});
```

##### `removeHPListener(listener: (hp: number, maxHP: number) => void): void`

移除血量监听器。

##### `addDeathListener(listener: (role: RoleActor) => void): void`

添加死亡监听器。

```typescript
role.addDeathListener((role) => {
    console.log('角色死亡');
});
```

##### `removeDeathListener(listener: (role: RoleActor) => void): void`

移除死亡监听器。

#### initFromData 支持的属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `name` | `string` | - | 角色名称 |
| `position` | `{ x, y }` | - | 位置 |
| `direction` | `RoleDirection` | `DOWN` | 初始朝向 |
| `speed` | `number` | `100` | 移动速度 |
| `faction` | `RoleFaction` | `HERO` | 阵营 |
| `hp` | `number` | `100` | 血量（同时设置 maxHP） |
| `maxHP` | `number` | `100` | 最大血量 |
| `atk` | `number` | `10` | 攻击力 |
| `attackRange` | `number` | `60` | 攻击范围 |
| `attackCooldown` | `number` | `1.0` | 攻击冷却时间 |

---

### HeroActor

英雄角色，继承自 `RoleActor`。观众进入直播间生成的角色。

**文件位置**：`src/actor/HeroActor.ts`

#### 额外属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `mUserId` | `string` | 用户 ID |
| `mUserName` | `string` | 用户昵称 |

#### Getter

```typescript
hero.userId;    // string
hero.userName;  // string
```

#### initFromData 支持的属性

继承 `RoleActor` 的所有属性，额外支持：

| 属性 | 类型 | 说明 |
|------|------|------|
| `userId` | `string` | 用户 ID |
| `userName` | `string` | 用户昵称 |

#### 默认行为

- 阵营默认为 `RoleFaction.HERO`
- 初始朝向为 `UP`（朝向敌人）

---

### EnemyActor

敌人角色，继承自 `RoleActor`。地图上方的敌人小兵。

**文件位置**：`src/actor/EnemyActor.ts`

#### 额外属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `mEnemyId` | `string` | 敌人 ID |

#### Getter

```typescript
enemy.enemyId;  // string
```

#### initFromData 支持的属性

继承 `RoleActor` 的所有属性，额外支持：

| 属性 | 类型 | 说明 |
|------|------|------|
| `enemyId` | `string` | 敌人 ID |

#### 默认行为

- 阵营默认为 `RoleFaction.ENEMY`
- 初始朝向为 `DOWN`（朝向玩家）

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
| `frameCount` | `number` | ✅ | 总帧数 |
| `animationSpeed` | `number` | ❌ | 播放速度（默认 0.15） |
| `size` | `{ x, y }` | ❌ | 显示尺寸 |
| `position` | `{ x, y }` | ❌ | 位置偏移 |

```json
{
    "type": "AnimationComp",
    "properties": {
        "path": "/texture/spring_water/spring_water_sheet.png",
        "frameCount": 4,
        "animationSpeed": 0.1,
        "size": { "x": 64, "y": 64 }
    }
}
```

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
| IDLE | 8 | 1 | 否 |
| WALK | 8 | 9 | 是 |
| SLASH | 12 | 6 | 否 |
| BACK_SLASH | 16 | 13 | 否 |
| HURT | 32 | 6 | 否 |
| DEAD | 36 | 6 | 否 |

---

### BattleComp

战斗组件，处理角色的自动战斗 AI。

**文件位置**：`src/component/BattleComp.ts`

#### 战斗状态

| 状态 | 说明 |
|------|------|
| `IDLE` | 待机 |
| `SEEK_TARGET` | 寻找目标 |
| `MOVE_TO_TARGET` | 移动到目标 |
| `ATTACK` | 攻击中 |
| `COOLDOWN` | 攻击冷却 |

#### 行为

1. **挂载时**：注册到 `BattleManager`，开始寻找目标
2. **SEEK_TARGET**：调用 `BattleManager.getNearestEnemy()` 获取最近敌人
3. **MOVE_TO_TARGET**：调用 `role.moveToward()` 向目标移动，到达攻击范围后切换到攻击
4. **ATTACK**：面向目标，播放攻击动画，动画中间调用 `BattleManager.processAttack()` 造成伤害
5. **COOLDOWN**：等待冷却时间后重新寻找目标
6. **卸载时**：从 `BattleManager` 注销

```json
{
    "type": "BattleComp",
    "properties": {}
}
```

---

### HealthBarComp

血条组件，显示角色血量。

**文件位置**：`src/component/HealthBarComp.ts`

#### initFromData 支持的属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `width` | `number` | `40` | 血条宽度 |
| `height` | `number` | `6` | 血条高度 |
| `offsetY` | `number` | `-50` | Y 轴偏移（负数表示在角色上方） |
| `color` | `number` | `0x00ff00` | 血条颜色（十六进制） |

#### 行为

- 监听 `RoleActor` 的血量变化
- 血量 ≤ 30% 时变为橙色警告
- 死亡时隐藏血条

```json
{
    "type": "HealthBarComp",
    "properties": {
        "width": 40,
        "height": 6,
        "offsetY": -50,
        "color": 16711680
    }
}
```

---

## 管理器

### BattleManager

战斗管理器（单例），管理战斗逻辑和阵营。

**文件位置**：`src/manager/BattleManager.ts`

#### 方法

##### `static Instance(): BattleManager`

获取单例实例。

##### `registerRole(role: RoleActor): void`

注册角色到战斗系统。根据阵营分组，并监听死亡事件。

```typescript
BattleManager.Instance().registerRole(hero);
```

##### `unregisterRole(role: RoleActor): void`

取消注册角色。

##### `update(dt: number): void`

每帧更新，处理同阵营角色的碰撞分离。

##### `getEnemiesOf(role: RoleActor): RoleActor[]`

获取敌对阵营的所有存活角色。

```typescript
const enemies = BattleManager.Instance().getEnemiesOf(hero);
```

##### `getNearestEnemy(role: RoleActor): RoleActor | null`

获取最近的敌人。

```typescript
const nearest = BattleManager.Instance().getNearestEnemy(hero);
```

##### `processAttack(attacker: RoleActor, target: RoleActor): void`

处理攻击，对目标造成伤害。

```typescript
BattleManager.Instance().processAttack(hero, enemy);
```

##### `getAllAliveRoles(): RoleActor[]`

获取所有存活的角色。

##### `getHeroCount(): number`

获取存活英雄数量。

##### `getEnemyCount(): number`

获取存活敌人数量。

##### `isBattleOver(): boolean`

检查战斗是否结束（一方全灭）。

##### `clear(): void`

清理所有角色。

---

### HeroManager

英雄管理器（单例），管理观众英雄的创建和销毁。

**文件位置**：`src/manager/HeroManager.ts`

#### 方法

##### `static Instance(): HeroManager`

获取单例实例。

##### `init(scene: Scene): void`

初始化，绑定场景。

```typescript
HeroManager.Instance().init(scene);
```

##### `spawnHero(userId: string, userName?: string): HeroActor | null`

生成英雄。如果用户已有英雄则返回已存在的。

```typescript
const hero = HeroManager.Instance().spawnHero('user_123', '观众A');
```

##### `removeHero(userId: string): void`

移除英雄。

```typescript
HeroManager.Instance().removeHero('user_123');
```

##### `getHero(userId: string): HeroActor | undefined`

获取英雄。

##### `hasHero(userId: string): boolean`

检查英雄是否存在。

##### `getAllHeroes(): HeroActor[]`

获取所有英雄。

##### `getHeroCount(): number`

获取英雄数量。

##### `clear(): void`

清理所有英雄。

---

### EnemyManager

敌人管理器（单例），管理敌人小兵的创建和销毁。

**文件位置**：`src/manager/EnemyManager.ts`

#### 方法

##### `static Instance(): EnemyManager`

获取单例实例。

##### `init(scene: Scene): void`

初始化，绑定场景。

```typescript
EnemyManager.Instance().init(scene);
```

##### `spawnEnemiesPoisson(count: number, area: {...}, minDistance?: number): void`

使用泊松盘采样批量生成敌人（均匀随机分布）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `count` | `number` | 敌人数量 |
| `area` | `{ x, y, width, height }` | 生成区域 |
| `minDistance` | `number` | 最小间距（默认 60） |

```typescript
EnemyManager.Instance().spawnEnemiesPoisson(
    10,
    { x: 100, y: 100, width: 520, height: 300 },
    60
);
```

##### `spawnEnemy(enemyId: string, x: number, y: number): EnemyActor | null`

生成单个敌人。

```typescript
const enemy = EnemyManager.Instance().spawnEnemy('enemy_1', 200, 150);
```

##### `removeEnemy(enemyId: string): void`

移除敌人。

##### `getEnemy(enemyId: string): EnemyActor | undefined`

获取敌人。

##### `getAllEnemies(): EnemyActor[]`

获取所有敌人。

##### `getEnemyCount(): number`

获取敌人数量。

##### `clear(): void`

清理所有敌人。

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
const actor = TypeRegistry.createActor('HeroActor');
```

##### `createComponent(type: string): Component`

创建 Component 实例。

```typescript
const comp = TypeRegistry.createComponent('BattleComp');
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
const hero = ActorLoader.loadFromTemplate({
    path: '/actors/hero.json',
    override: { 
        name: 'Hero_1',
        userId: 'user_123',
        position: { x: 360, y: 950 }
    }
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
const data = AssetManager.Instance().getFile('/actors/hero.json');
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
    IDLE = 'idle',              // 待机
    WALK = 'walk',              // 行走
    SLASH = 'slash',            // 斩击
    BACK_SLASH = 'back_slash',  // 背斩
    HURT = 'hurt',              // 受伤
    DEAD = 'dead',              // 死亡
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

### RoleFaction

角色阵营枚举。

```typescript
enum RoleFaction {
    HERO = 'hero',    // 英雄阵营（观众）
    ENEMY = 'enemy',  // 敌人阵营（小兵）
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

### LPCSheetConfig

LPC 精灵表配置接口。

```typescript
interface LPCSheetConfig {
    frameWidth: number;
    frameHeight: number;
    actions: Record<RoleAction, {
        row: number;
        frameCount: number;
        loop: boolean;
    }>;
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

### 创建自定义管理器

```typescript
export class CustomManager {
    private static sInstance: CustomManager;
    
    static Instance(): CustomManager {
        if (!this.sInstance)
            this.sInstance = new CustomManager();
        return this.sInstance;
    }
    
    // 管理器方法...
}
```
