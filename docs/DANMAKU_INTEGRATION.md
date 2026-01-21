# 抖音直播伴侣弹幕接入文档

本文档描述如何将 GS 弹幕游戏与抖音直播伴侣对接，实现弹幕互动功能。

## 概述

### 接入方式

抖音直播伴侣支持通过以下方式接入弹幕游戏：

1. **Web 内嵌页面**：游戏以网页形式内嵌到直播伴侣
2. **弹幕推送**：直播伴侣通过 JavaScript Bridge 或 WebSocket 推送弹幕事件

### 通信架构

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│   抖音直播间     │────▶│   抖音直播伴侣        │────▶│   GS 弹幕游戏    │
│                 │     │                      │     │                 │
│  - 观众弹幕      │     │  - 事件采集          │     │  - 事件处理      │
│  - 礼物         │     │  - 事件推送          │     │  - 游戏响应      │
│  - 关注/点赞    │     │  - JS Bridge         │     │  - 画面渲染      │
└─────────────────┘     └──────────────────────┘     └─────────────────┘
```

---

## 事件类型定义

### DanmakuEvent（弹幕事件基类）

```typescript
interface DanmakuEvent {
    type: DanmakuEventType;      // 事件类型
    userId: string;              // 用户唯一ID
    userName: string;            // 用户昵称
    userAvatar?: string;         // 用户头像URL
    timestamp: number;           // 事件时间戳
    data: any;                   // 事件特定数据
}

type DanmakuEventType = 
    | 'comment'    // 弹幕评论
    | 'gift'       // 礼物
    | 'like'       // 点赞
    | 'follow'     // 关注
    | 'share'      // 分享
    | 'enter';     // 进入直播间
```

### CommentEvent（弹幕评论）

```typescript
interface CommentEvent extends DanmakuEvent {
    type: 'comment';
    data: {
        content: string;         // 弹幕内容
        color?: string;          // 弹幕颜色（可选）
    };
}
```

### GiftEvent（礼物）

```typescript
interface GiftEvent extends DanmakuEvent {
    type: 'gift';
    data: {
        giftId: number;          // 礼物ID
        giftName: string;        // 礼物名称
        giftIcon?: string;       // 礼物图标URL
        count: number;           // 礼物数量
        totalPrice: number;      // 总价值（抖币）
    };
}
```

### LikeEvent（点赞）

```typescript
interface LikeEvent extends DanmakuEvent {
    type: 'like';
    data: {
        count: number;           // 点赞次数（可能批量）
    };
}
```

### FollowEvent（关注）

```typescript
interface FollowEvent extends DanmakuEvent {
    type: 'follow';
    data: {
        isFirstFollow: boolean;  // 是否首次关注
    };
}
```

### ShareEvent（分享）

```typescript
interface ShareEvent extends DanmakuEvent {
    type: 'share';
    data: {
        platform?: string;       // 分享平台
    };
}
```

### EnterEvent（进入直播间）

```typescript
interface EnterEvent extends DanmakuEvent {
    type: 'enter';
    data: {
        isVip?: boolean;         // 是否VIP
        level?: number;          // 用户等级
    };
}
```

---

## 模块设计

### DanmakuManager（弹幕管理器）

负责接收和分发弹幕事件的核心模块。

```typescript
// src/danmaku/DanmakuManager.ts（待实现）

type EventHandler<T extends DanmakuEvent = DanmakuEvent> = (event: T) => void;

class DanmakuManager {
    private static sInstance: DanmakuManager;
    
    // 事件监听器
    private mListeners: Map<DanmakuEventType, Set<EventHandler>>;
    
    // 单例获取
    static Instance(): DanmakuManager;
    
    // 初始化（连接直播伴侣）
    init(): void;
    
    // 注册事件监听
    on<T extends DanmakuEvent>(type: T['type'], handler: EventHandler<T>): void;
    
    // 移除事件监听
    off<T extends DanmakuEvent>(type: T['type'], handler: EventHandler<T>): void;
    
    // 触发事件（内部使用）
    private emit(event: DanmakuEvent): void;
    
    // 销毁
    destroy(): void;
}
```

### PlayerManager（玩家管理器）

管理观众对应的游戏角色。

```typescript
// src/danmaku/PlayerManager.ts（待实现）

interface PlayerInfo {
    userId: string;
    userName: string;
    userAvatar?: string;
    actor: PlayerActor;
    joinTime: number;
    lastActiveTime: number;
}

class PlayerManager {
    private static sInstance: PlayerManager;
    
    // 玩家映射表
    private mPlayers: Map<string, PlayerInfo>;
    
    // 单例获取
    static Instance(): PlayerManager;
    
    // 玩家加入游戏
    joinGame(event: DanmakuEvent): PlayerActor;
    
    // 获取玩家
    getPlayer(userId: string): PlayerInfo | undefined;
    
    // 检查玩家是否存在
    hasPlayer(userId: string): boolean;
    
    // 移除玩家（超时/死亡）
    removePlayer(userId: string): void;
    
    // 获取所有玩家
    getAllPlayers(): PlayerInfo[];
    
    // 更新活跃时间
    updateActiveTime(userId: string): void;
    
    // 清理不活跃玩家
    cleanupInactivePlayers(timeout: number): void;
}
```

### CommandParser（指令解析器）

解析弹幕中的游戏指令。

```typescript
// src/danmaku/CommandParser.ts（待实现）

interface GameCommand {
    type: string;           // 指令类型
    args?: string[];        // 指令参数
}

class CommandParser {
    // 指令前缀（可选，如 "!" 或无前缀）
    private mPrefix: string = '';
    
    // 指令映射
    private mCommands: Map<string, string> = new Map([
        ['加入', 'join'],
        ['攻击', 'attack'],
        ['上', 'move_up'],
        ['下', 'move_down'],
        ['左', 'move_left'],
        ['右', 'move_right'],
    ]);
    
    // 解析弹幕内容
    parse(content: string): GameCommand | null;
    
    // 注册自定义指令
    registerCommand(keyword: string, commandType: string): void;
}
```

---

## 接入实现

### 方式一：JS Bridge（推荐）

抖音直播伴侣通过 `window` 对象注入回调：

```typescript
// src/danmaku/DouyinBridge.ts（待实现）

class DouyinBridge {
    init(): void {
        // 检查是否在直播伴侣环境
        if (typeof window.onDanmakuMessage !== 'undefined') {
            console.log('[DouyinBridge] 检测到直播伴侣环境');
        }
        
        // 注册全局回调
        window.onDanmakuMessage = (data: any) => {
            this.handleMessage(data);
        };
        
        window.onGiftMessage = (data: any) => {
            this.handleGift(data);
        };
        
        // ... 其他事件
    }
    
    private handleMessage(data: any): void {
        const event: CommentEvent = {
            type: 'comment',
            userId: data.user_id,
            userName: data.nickname,
            userAvatar: data.avatar,
            timestamp: Date.now(),
            data: {
                content: data.content,
            }
        };
        
        DanmakuManager.Instance().emit(event);
    }
    
    private handleGift(data: any): void {
        const event: GiftEvent = {
            type: 'gift',
            userId: data.user_id,
            userName: data.nickname,
            timestamp: Date.now(),
            data: {
                giftId: data.gift_id,
                giftName: data.gift_name,
                count: data.count,
                totalPrice: data.price * data.count,
            }
        };
        
        DanmakuManager.Instance().emit(event);
    }
}

// TypeScript 类型声明
declare global {
    interface Window {
        onDanmakuMessage?: (data: any) => void;
        onGiftMessage?: (data: any) => void;
        onLikeMessage?: (data: any) => void;
        onFollowMessage?: (data: any) => void;
    }
}
```

### 方式二：WebSocket（备选）

如果直播伴侣支持 WebSocket 推送：

```typescript
// src/danmaku/WebSocketBridge.ts（待实现）

class WebSocketBridge {
    private mSocket: WebSocket | null = null;
    private mReconnectAttempts: number = 0;
    private mMaxReconnectAttempts: number = 5;
    
    init(url: string): void {
        this.connect(url);
    }
    
    private connect(url: string): void {
        this.mSocket = new WebSocket(url);
        
        this.mSocket.onopen = () => {
            console.log('[WebSocket] 连接成功');
            this.mReconnectAttempts = 0;
        };
        
        this.mSocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
        };
        
        this.mSocket.onclose = () => {
            console.log('[WebSocket] 连接关闭');
            this.tryReconnect(url);
        };
        
        this.mSocket.onerror = (error) => {
            console.error('[WebSocket] 错误', error);
        };
    }
    
    private tryReconnect(url: string): void {
        if (this.mReconnectAttempts < this.mMaxReconnectAttempts) {
            this.mReconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, this.mReconnectAttempts), 30000);
            setTimeout(() => this.connect(url), delay);
        }
    }
    
    private handleMessage(data: any): void {
        // 根据 data.type 分发到不同处理器
        // ...
    }
    
    destroy(): void {
        this.mSocket?.close();
        this.mSocket = null;
    }
}
```

---

## 使用示例

### 初始化弹幕系统

```typescript
// src/main.ts 中添加

import { DanmakuManager } from './danmaku/DanmakuManager';
import { PlayerManager } from './danmaku/PlayerManager';
import { DouyinBridge } from './danmaku/DouyinBridge';

async function main() {
    // ... 现有初始化代码 ...
    
    // 初始化弹幕系统
    DanmakuManager.Instance().init();
    
    // 初始化抖音桥接
    new DouyinBridge().init();
    
    // 监听弹幕事件
    DanmakuManager.Instance().on('comment', handleComment);
    DanmakuManager.Instance().on('gift', handleGift);
}

function handleComment(event: CommentEvent): void {
    console.log(`[弹幕] ${event.userName}: ${event.data.content}`);
    
    // 解析指令
    const command = CommandParser.parse(event.data.content);
    if (command) {
        executeCommand(event.userId, command);
    }
}

function handleGift(event: GiftEvent): void {
    console.log(`[礼物] ${event.userName} 送出 ${event.data.giftName} x${event.data.count}`);
    
    // 处理礼物效果
    const player = PlayerManager.Instance().getPlayer(event.userId);
    if (player) {
        applyGiftEffect(player, event.data);
    }
}
```

### 创建弹幕相关组件

```typescript
// src/component/DanmakuDisplayComp.ts（示例）

import { Component } from '../core/Component';
import { Text, Container } from 'pixi.js';

export class DanmakuDisplayComp extends Component {
    private mContainer: Container;
    private mMessages: Text[] = [];
    private mMaxMessages: number = 10;
    
    protected onAttach(): void {
        this.mContainer = new Container();
        this.parent?.container.addChild(this.mContainer);
        
        // 监听弹幕
        DanmakuManager.Instance().on('comment', this.onComment);
    }
    
    protected onDetach(): void {
        DanmakuManager.Instance().off('comment', this.onComment);
        this.mContainer.removeFromParent();
    }
    
    private onComment = (event: CommentEvent): void => {
        this.addMessage(`${event.userName}: ${event.data.content}`);
    };
    
    private addMessage(text: string): void {
        // 创建文字
        const message = new Text({ text, style: { fill: 0xffffff, fontSize: 16 } });
        this.mContainer.addChild(message);
        this.mMessages.push(message);
        
        // 限制数量
        while (this.mMessages.length > this.mMaxMessages) {
            const old = this.mMessages.shift();
            old?.destroy();
        }
        
        // 更新位置
        this.layoutMessages();
    }
    
    private layoutMessages(): void {
        let y = 0;
        for (const msg of this.mMessages) {
            msg.y = y;
            y += 24;
        }
    }
}
```

---

## 开发调试

### 模拟弹幕事件

在开发环境中模拟弹幕事件进行测试：

```typescript
// src/debug/DanmakuSimulator.ts

class DanmakuSimulator {
    // 模拟发送弹幕
    static sendComment(userName: string, content: string): void {
        const event: CommentEvent = {
            type: 'comment',
            userId: `test_${Date.now()}`,
            userName,
            timestamp: Date.now(),
            data: { content }
        };
        DanmakuManager.Instance().emit(event);
    }
    
    // 模拟送礼物
    static sendGift(userName: string, giftName: string, count: number): void {
        const event: GiftEvent = {
            type: 'gift',
            userId: `test_${Date.now()}`,
            userName,
            timestamp: Date.now(),
            data: {
                giftId: 1,
                giftName,
                count,
                totalPrice: count * 10
            }
        };
        DanmakuManager.Instance().emit(event);
    }
}

// 开发时挂载到 window 方便调试
if (import.meta.env.DEV) {
    (window as any).DanmakuSimulator = DanmakuSimulator;
}
```

在浏览器控制台测试：

```javascript
// 模拟弹幕
DanmakuSimulator.sendComment('测试用户', '加入');

// 模拟礼物
DanmakuSimulator.sendGift('土豪用户', '嘉年华', 1);
```

---

## 注意事项

### 性能优化

1. **事件节流**：高频事件（如点赞）需要节流处理
2. **对象池**：角色创建使用对象池减少 GC
3. **批量处理**：累积一定时间的事件后批量处理

### 安全考虑

1. **输入过滤**：过滤敏感词和恶意内容
2. **频率限制**：限制单用户操作频率
3. **数据验证**：验证事件数据完整性

### 抖音平台要求

1. 遵守抖音开放平台开发者协议
2. 不收集用户敏感信息
3. 游戏内容符合审核规范
4. 礼物效果不能过于"氪金"导向

---

## 待实现模块清单

| 模块 | 文件路径 | 优先级 | 状态 |
|------|----------|--------|------|
| DanmakuManager | `src/danmaku/DanmakuManager.ts` | P0 | ⏳ 待实现 |
| PlayerManager | `src/danmaku/PlayerManager.ts` | P0 | ⏳ 待实现 |
| CommandParser | `src/danmaku/CommandParser.ts` | P1 | ⏳ 待实现 |
| DouyinBridge | `src/danmaku/DouyinBridge.ts` | P0 | ⏳ 待实现 |
| WebSocketBridge | `src/danmaku/WebSocketBridge.ts` | P2 | ⏳ 待实现 |
| DanmakuDisplayComp | `src/component/DanmakuDisplayComp.ts` | P1 | ⏳ 待实现 |
| GiftEffectComp | `src/component/GiftEffectComp.ts` | P1 | ⏳ 待实现 |
| DanmakuSimulator | `src/debug/DanmakuSimulator.ts` | P2 | ⏳ 待实现 |
