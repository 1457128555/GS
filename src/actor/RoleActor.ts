import { Point } from 'pixi.js';

import { Actor } from '../core/Actor';

export enum RoleAction {
    IDLE = 'idle',
    WALK = 'walk',
    SLASH = 'slash',
    BACK_SLASH = 'back_slash',
    HURT = 'hurt',
    DEAD = 'dead',
}

export enum RoleDirection {
    UP    = 0,
    LEFT  = 1,
    DOWN  = 2,
    RIGHT = 3,
}

export interface RoleState {
    action: RoleAction;
    direction: RoleDirection;
}

// 阵营枚举
export enum RoleFaction {
    HERO = 'hero',
    ENEMY = 'enemy',
}

export class RoleActor extends Actor 
{
    protected mDirection: Point = new Point(0, 0);
    protected mSpeed: number = 100;

    protected mState: RoleState = {
        action: RoleAction.IDLE,
        direction: RoleDirection.DOWN
    };

    // ========== 战斗属性 ==========
    protected mFaction: RoleFaction = RoleFaction.HERO;  // 阵营
    protected mHP: number = 100;                         // 当前血量
    protected mMaxHP: number = 100;                      // 最大血量
    protected mATK: number = 10;                         // 攻击力
    protected mAttackRange: number = 60;                 // 攻击范围
    protected mAttackCooldown: number = 1.0;             // 攻击冷却时间

    protected mIsDead: boolean = false;                  // 是否死亡

    // 状态变化回调，供组件监听
    protected mStateListeners: Set<(state: RoleState) => void> = new Set();
    // 血量变化回调
    protected mHPListeners: Set<(hp: number, maxHP: number) => void> = new Set();
    // 死亡回调
    protected mDeathListeners: Set<(role: RoleActor) => void> = new Set();
    
    // ========== Getters ==========
    get state(): RoleState { return this.mState; }
    get faction(): RoleFaction { return this.mFaction; }
    get hp(): number { return this.mHP; }
    get maxHP(): number { return this.mMaxHP; }
    get atk(): number { return this.mATK; }
    get attackRange(): number { return this.mAttackRange; }
    get attackCooldown(): number { return this.mAttackCooldown; }
    get isDead(): boolean { return this.mIsDead; }
    get speed(): number { return this.mSpeed; }

    // ========== 状态控制 ==========
    setAction(action: RoleAction): void {
        if (this.mState.action !== action) {
            this.mState.action = action;
            this.notifyStateChange();
        }
    }

    setDirection(direction: RoleDirection): void {
        if (this.mState.direction !== direction) {
            this.mState.direction = direction;
            this.notifyStateChange();
        }
    }

    // ========== 战斗方法 ==========
    
    /**
     * 受到伤害
     */
    takeDamage(damage: number, _attacker?: RoleActor): void {
        if (this.mIsDead) return;

        this.mHP = Math.max(0, this.mHP - damage);
        this.notifyHPChange();

        if (this.mHP <= 0) {
            this.die();
        }
    }

    /**
     * 死亡
     */
    protected die(): void {
        if (this.mIsDead) return;
        
        this.mIsDead = true;
        this.setAction(RoleAction.DEAD);
        
        // 通知死亡监听器
        for (const listener of this.mDeathListeners) {
            listener(this);
        }
    }

    /**
     * 治疗
     */
    heal(amount: number): void {
        if (this.mIsDead) return;

        this.mHP = Math.min(this.mMaxHP, this.mHP + amount);
        this.notifyHPChange();
    }

    /**
     * 计算与目标的距离
     */
    distanceTo(target: RoleActor): number {
        const dx = target.position.x - this.mPosition.x;
        const dy = target.position.y - this.mPosition.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * 朝向目标
     */
    faceTarget(target: RoleActor): void {
        const dx = target.position.x - this.mPosition.x;
        const dy = target.position.y - this.mPosition.y;
        this.setDirection(this.calculateDirection(dx, dy));
    }

    /**
     * 向目标移动
     */
    moveToward(target: RoleActor, dt: number): void {
        const dx = target.position.x - this.mPosition.x;
        const dy = target.position.y - this.mPosition.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            const moveX = (dx / dist) * this.mSpeed * dt;
            const moveY = (dy / dist) * this.mSpeed * dt;
            this.setPosition(this.mPosition.x + moveX, this.mPosition.y + moveY);
            this.setDirection(this.calculateDirection(dx, dy));
        }
    }

    /**
     * 应用外力（用于碰撞分离等）
     */
    applyForce(forceX: number, forceY: number): void {
        if (this.mIsDead) return;
        this.setPosition(this.mPosition.x + forceX, this.mPosition.y + forceY);
    }

    // ========== 监听器 ==========
    addStateListener(listener: (state: RoleState) => void): void {
        this.mStateListeners.add(listener);
    }

    removeStateListener(listener: (state: RoleState) => void): void {
        this.mStateListeners.delete(listener);
    }

    addHPListener(listener: (hp: number, maxHP: number) => void): void {
        this.mHPListeners.add(listener);
    }

    removeHPListener(listener: (hp: number, maxHP: number) => void): void {
        this.mHPListeners.delete(listener);
    }

    addDeathListener(listener: (role: RoleActor) => void): void {
        this.mDeathListeners.add(listener);
    }

    removeDeathListener(listener: (role: RoleActor) => void): void {
        this.mDeathListeners.delete(listener);
    }

    protected notifyStateChange(): void {
        for (const listener of this.mStateListeners) {
            listener(this.mState);
        }
    }

    protected notifyHPChange(): void {
        for (const listener of this.mHPListeners) {
            listener(this.mHP, this.mMaxHP);
        }
    }

    // ========== 初始化 ==========
    override initFromData(properties: Record<string, any>): void 
    {
        super.initFromData(properties);

        if ('direction' in properties)
            this.setDirection(properties.direction);
        if ('speed' in properties)
            this.mSpeed = properties.speed;
        
        // 战斗属性
        if ('faction' in properties)
            this.mFaction = properties.faction;
        if ('hp' in properties) {
            this.mHP = properties.hp;
            this.mMaxHP = properties.hp;
        }
        if ('maxHP' in properties)
            this.mMaxHP = properties.maxHP;
        if ('atk' in properties)
            this.mATK = properties.atk;
        if ('attackRange' in properties)
            this.mAttackRange = properties.attackRange;
        if ('attackCooldown' in properties)
            this.mAttackCooldown = properties.attackCooldown;
    }

    protected override onUpdate(_dt: number): void {
        // 基类不再自动移动，交给子类或组件处理
    }

    protected calculateDirection(dx: number, dy: number): RoleDirection {
        // 如果有水平移动，优先显示水平方向
        if (Math.abs(dx) > Math.abs(dy)) {
            return dx > 0 ? RoleDirection.RIGHT : RoleDirection.LEFT;
        }
        // 否则显示垂直方向
        if (dy > 0) return RoleDirection.DOWN;
        if (dy < 0) return RoleDirection.UP;
        
        return this.mState.direction; // 保持当前方向
    }
}
