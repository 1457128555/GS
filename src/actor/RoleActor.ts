import { Point } from 'pixi.js';

import { Actor } from '../core/Actor';

export enum RoleAction {
    IDLE = 'idle',
    WALK = 'walk',
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

export class RoleActor extends Actor 
{
    protected mDirection: Point = new Point(0, 0);
    protected mSpeed: number = 100;

    protected mState: RoleState = {
        action: RoleAction.IDLE,
        direction: RoleDirection.DOWN
    };

    // 状态变化回调，供组件监听
    protected mStateListeners: Set<(state: RoleState) => void> = new Set();
    
    get state(): RoleState {
        return this.mState;
    }

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

    addStateListener(listener: (state: RoleState) => void): void {
        this.mStateListeners.add(listener);
    }

    removeStateListener(listener: (state: RoleState) => void): void {
        this.mStateListeners.delete(listener);
    }

    protected notifyStateChange(): void {
        for (const listener of this.mStateListeners) {
            listener(this.mState);
        }
    }

    override initFromData(properties: Record<string, any>): void 
    {
        super.initFromData(properties);

        if ('direction' in properties)
            this.setDirection(properties.direction);
        if ('speed' in properties)
            this.mSpeed = properties.speed;
    }

    protected override onUpdate(dt: number): void {
        if(this.mSpeed == 0)
            this.setAction(RoleAction.IDLE);
        else{
            const newX = this.mPosition.x + this.mDirection.x * this.mSpeed * dt;
            const newY = this.mPosition.y + this.mDirection.y * this.mSpeed * dt;
            this.setPosition(newX, newY);

            this.setAction(RoleAction.WALK);
            this.setDirection(this.calculateDirection(this.mDirection.x, this.mDirection.y));
        }
    }

    protected calculateDirection(dx: number, dy: number): RoleDirection {
        // 如果有水平移动，优先显示水平方向
        if (dx > 0) return RoleDirection.RIGHT;
        if (dx < 0) return RoleDirection.LEFT;
        
        // 否则显示垂直方向
        if (dy > 0) return RoleDirection.DOWN;
        if (dy < 0) return RoleDirection.UP;
        
        return this.mState.direction; // 保持当前方向
    }
}