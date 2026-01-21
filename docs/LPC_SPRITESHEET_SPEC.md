# LPC 精灵表规范文档

本文档详细说明 LPC (Liberated Pixel Cup) 风格精灵表的行布局和动作定义。

## 基本信息

| 属性 | 值 |
|------|-----|
| 单帧尺寸 | 64 × 64 像素 |
| 方向数量 | 4 (UP, LEFT, DOWN, RIGHT) |
| 每个动作 | 占用 4 行（每个方向 1 行） |

## 方向映射

| 方向 | 枚举值 | 行偏移 |
|------|--------|--------|
| UP (上) | 0 | +0 |
| LEFT (左) | 1 | +1 |
| DOWN (下) | 2 | +2 |
| RIGHT (右) | 3 | +3 |

**计算公式**：`实际行号 = 动作起始行 + 方向偏移`

---

## 完整动作列表

根据预览工具显示的动作列表：

| 序号 | 中文名 | 英文名 | 起始行 | 帧数 | 说明 |
|------|--------|--------|--------|------|------|
| 1 | 施法 | Spellcast | 0 | 7 | 双手举起施法 |
| 2 | 推力 | Thrust | 4 | 8 | 长矛刺击 |
| 3 | 步行 | Walk | 8 | 9 | 行走动画 |
| 4 | 斜杀 | Slash | 12 | 6 | 挥剑斩击 |
| 5 | 开枪 | Shoot | 16 | 13 | 射击/拉弓 |
| 6 | 受伤 | Hurt | 20 | 6 | 受伤倒下 |
| 7 | 攀登 | Climb | 24 | ? | 爬梯子 |
| 8 | **怠速** | **Idle** | 28 | 1 | ⭐ **待机站立** |
| 9 | 跳 | Jump | 32 | ? | 跳跃 |
| 10 | 坐下 | Sit | 36 | ? | 坐姿 |
| 11 | 表情动作 | Emote | 40 | ? | 表情/情绪 |
| 12 | 跑 | Run | 44 | ? | 奔跑 |
| 13 | 浇水 | Water | 48 | ? | 浇水动作 |
| 14 | **战斗怠速** | **Combat Idle** | 52 | 1 | ⭐ **战斗待机** |
| 15 | 单手斩击 | One-hand Slash | 56 | 6 | 单手挥剑 |
| 16 | 单手背斩 | One-hand Back Slash | 60 | 6 | 单手背斩 |
| 17 | 单手半斩 | One-hand Half Slash | 64 | 6 | 单手半斩 |
| 18 | 同线 128 | - | 68 | ? | 128尺寸动作 |
| 19 | 反斜线 128 | - | 72 | ? | 128尺寸动作 |
| 20 | 半斜线 128 | - | 76 | ? | 128尺寸动作 |

---

## 详细行布局

### 行 0-3: 施法 (Spellcast)

| 行号 | 方向 | 帧数 |
|------|------|------|
| 0 | UP | 7 |
| 1 | LEFT | 7 |
| 2 | DOWN | 7 |
| 3 | RIGHT | 7 |

**武器**：❌ 无

---

### 行 4-7: 推力 (Thrust)

| 行号 | 方向 | 帧数 |
|------|------|------|
| 4 | UP | 8 |
| 5 | LEFT | 8 |
| 6 | DOWN | 8 |
| 7 | RIGHT | 8 |

**武器**：✅ 有（长矛轨迹）

---

### 行 8-11: 步行 (Walk)

| 行号 | 方向 | 帧数 |
|------|------|------|
| 8 | UP | 9 |
| 9 | LEFT | 9 |
| 10 | DOWN | 9 |
| 11 | RIGHT | 9 |

**武器**：⚠️ 少量（行走时武器收起）

---

### 行 12-15: 斜杀 (Slash)

| 行号 | 方向 | 帧数 |
|------|------|------|
| 12 | UP | 6 |
| 13 | LEFT | 6 |
| 14 | DOWN | 6 |
| 15 | RIGHT | 6 |

**武器**：✅ 完整（挥剑轨迹）

---

### 行 16-19: 开枪 (Shoot)

| 行号 | 方向 | 帧数 |
|------|------|------|
| 16 | UP | 13 |
| 17 | LEFT | 13 |
| 18 | DOWN | 13 |
| 19 | RIGHT | 13 |

**武器**：✅ 有（弓箭轨迹）

---

### 行 20-23: 受伤 (Hurt)

| 行号 | 方向 | 帧数 |
|------|------|------|
| 20 | UP | 6 |
| 21 | LEFT | 6 |
| 22 | DOWN | 6 |
| 23 | RIGHT | 6 |

**武器**：❌ 无

---

### 行 24-27: 攀登 (Climb)

| 行号 | 方向 | 帧数 |
|------|------|------|
| 24 | UP | ? |
| 25 | LEFT | ? |
| 26 | DOWN | ? |
| 27 | RIGHT | ? |

---

### 行 28-31: 怠速 (Idle) ⭐ 待机

| 行号 | 方向 | 帧数 |
|------|------|------|
| 28 | UP | 1 |
| 29 | LEFT | 1 |
| 30 | DOWN | 1 |
| 31 | RIGHT | 1 |

**说明**：这是真正的**待机站立**动作！

**武器**：❓ 需要确认

---

### 行 32-35: 跳 (Jump)

| 行号 | 方向 | 帧数 |
|------|------|------|
| 32 | UP | ? |
| 33 | LEFT | ? |
| 34 | DOWN | ? |
| 35 | RIGHT | ? |

---

### 行 36-39: 坐下 (Sit)

| 行号 | 方向 | 帧数 |
|------|------|------|
| 36 | UP | ? |
| 37 | LEFT | ? |
| 38 | DOWN | ? |
| 39 | RIGHT | ? |

---

### 行 40-43: 表情动作 (Emote)

| 行号 | 方向 | 帧数 |
|------|------|------|
| 40 | UP | ? |
| 41 | LEFT | ? |
| 42 | DOWN | ? |
| 43 | RIGHT | ? |

---

### 行 44-47: 跑 (Run)

| 行号 | 方向 | 帧数 |
|------|------|------|
| 44 | UP | ? |
| 45 | LEFT | ? |
| 46 | DOWN | ? |
| 47 | RIGHT | ? |

---

### 行 48-51: 浇水 (Water)

| 行号 | 方向 | 帧数 |
|------|------|------|
| 48 | UP | ? |
| 49 | LEFT | ? |
| 50 | DOWN | ? |
| 51 | RIGHT | ? |

---

### 行 52-55: 战斗怠速 (Combat Idle) ⭐ 战斗待机

| 行号 | 方向 | 帧数 |
|------|------|------|
| 52 | UP | 1 |
| 53 | LEFT | 1 |
| 54 | DOWN | 1 |
| 55 | RIGHT | 1 |

**说明**：**战斗姿态的待机**，可能包含武器！

**武器**：✅ 应该有

---

### 行 56-59: 单手斩击 (One-hand Slash)

| 行号 | 方向 | 帧数 |
|------|------|------|
| 56 | UP | 6 |
| 57 | LEFT | 6 |
| 58 | DOWN | 6 |
| 59 | RIGHT | 6 |

**武器**：✅ 有

---

### 行 60-63: 单手背斩 (One-hand Back Slash)

| 行号 | 方向 | 帧数 |
|------|------|------|
| 60 | UP | 6 |
| 61 | LEFT | 6 |
| 62 | DOWN | 6 |
| 63 | RIGHT | 6 |

**武器**：✅ 有

---

### 行 64-67: 单手半斩 (One-hand Half Slash)

| 行号 | 方向 | 帧数 |
|------|------|------|
| 64 | UP | 6 |
| 65 | LEFT | 6 |
| 66 | DOWN | 6 |
| 67 | RIGHT | 6 |

**武器**：✅ 有

---

## 游戏中推荐配置

### 基础配置（待机有武器）

```typescript
actions: {
    // 使用战斗怠速作为 IDLE（应该包含武器）
    [RoleAction.IDLE]: { row: 52, frameCount: 1, loop: false },
    [RoleAction.WALK]: { row: 8, frameCount: 9, loop: true },
    [RoleAction.SLASH]: { row: 56, frameCount: 6, loop: false },      // 单手斩击
    [RoleAction.BACK_SLASH]: { row: 60, frameCount: 6, loop: false }, // 单手背斩
}
```

### 备选配置

```typescript
actions: {
    // 如果战斗怠速没有武器，可以尝试普通怠速
    [RoleAction.IDLE]: { row: 28, frameCount: 1, loop: false },
    [RoleAction.WALK]: { row: 8, frameCount: 9, loop: true },
    [RoleAction.SLASH]: { row: 12, frameCount: 6, loop: false },
    [RoleAction.BACK_SLASH]: { row: 16, frameCount: 13, loop: false },
}
```

---

## 图层叠加顺序

从下到上的渲染顺序：

```
1. body      (身体)      - zIndex: 100
2. pants     (裤子)      - zIndex: 101
3. shoe      (鞋子)      - zIndex: 102
4. jacket    (上衣)      - zIndex: 103
5. head      (头部)      - zIndex: 104
6. sword     (武器)      - zIndex: 105
```

---

## 参考资料

- [LPC Spritesheet Generator](https://sanderfrenken.github.io/Universal-LPC-Spritesheet-Character-Generator/)
- [OpenGameArt LPC Collection](https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles)
