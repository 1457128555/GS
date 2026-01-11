// import { Point } from 'pixi.js';
// import { Actor } from '../core/Actor';

// // LPC标准动作
// export enum RoleAction
// {
//     IDLE = 'idle',
//     WALK = 'walk',
//     ATTACK = 'attack',
//     CAST = 'cast',
//     DIE = 'die'
// }

// // 八方向
// export enum RoleDirection
// {
//     DOWN = 0,
//     LEFT = 1,
//     RIGHT = 2,
//     UP = 3,
//     DOWN_LEFT = 4,
//     DOWN_RIGHT = 5,
//     UP_LEFT = 6,
//     UP_RIGHT = 7
// }

// export interface RoleState
// {
//     action: RoleAction;
//     direction: RoleDirection;
// }



// export class RoleActor extends Actor 
// {
//     protected mPosition: Point = new Point(0, 0);
//     protected mSpeed: number = 200;
//     protected mVelocity = { x: 0, y: 0 };

//     protected mState: RoleState = {
//         action: RoleAction.IDLE,
//         direction: RoleDirection.DOWN
//     };

//     // 状态变化回调，供组件监听
//     protected mStateListeners: Set<(state: RoleState) => void> = new Set();

//     get state(): RoleState {
//         return this.mState;
//     }

//     get position(): Point {
//         return this.mPosition;
//     }

//     setPosition(x: number, y: number): void {
//         this.mPosition.set(x, y);
//         this.mContainer.position.set(x, y);
//     }

//     setAction(action: RoleAction): void {
//         if (this.mState.action !== action) {
//             this.mState.action = action;
//             this.notifyStateChange();
//         }
//     }

//     setDirection(direction: RoleDirection): void {
//         if (this.mState.direction !== direction) {
//             this.mState.direction = direction;
//             this.notifyStateChange();
//         }
//     }

//     addStateListener(listener: (state: RoleState) => void): void {
//         this.mStateListeners.add(listener);
//     }

//     removeStateListener(listener: (state: RoleState) => void): void {
//         this.mStateListeners.delete(listener);
//     }

//     protected notifyStateChange(): void {
//         for (const listener of this.mStateListeners) {
//             listener(this.mState);
//         }
//     }

//     override initFromData(properties: Record<string, any>): void 
//     {
//         super.initFromData(properties);
//         if (properties.position) 
//             this.setPosition(properties.position.x, properties.position.y);
//         if (properties.speed)
//             this.mSpeed = properties.speed;
//     }

//     protected override onUpdate(dt: number): void {
//         // 根据速度更新位置
//         if (this.mVelocity.x !== 0 || this.mVelocity.y !== 0) {
//             const newX = this.mPosition.x + this.mVelocity.x * dt;
//             const newY = this.mPosition.y + this.mVelocity.y * dt;
//             this.setPosition(newX, newY);
//         }
//     }

//     move(dx: number, dy: number): void {
//         if (dx === 0 && dy === 0) {
//             this.mVelocity.x = 0;
//             this.mVelocity.y = 0;
//             this.setAction(RoleAction.IDLE);
//         } else {
//             // 归一化方向向量，确保斜向移动速度一致

//             const length = Math.sqrt(dx * dx + dy * dy);
//             const normalizedDx = dx / length;
//             const normalizedDy = dy / length;
            
//             this.mVelocity.x = normalizedDx * this.mSpeed;
//             this.mVelocity.y = normalizedDy * this.mSpeed;
            
//             this.setAction(RoleAction.WALK);
//             this.setDirection(this.calculateDirection(dx, dy));
//         }
//     }

//     protected calculateDirection(dx: number, dy: number): RoleDirection {
//         // 斜向优先判断
//         if (dx < 0 && dy > 0) return RoleDirection.DOWN_LEFT;
//         if (dx > 0 && dy > 0) return RoleDirection.DOWN_RIGHT;
//         if (dx < 0 && dy < 0) return RoleDirection.UP_LEFT;
//         if (dx > 0 && dy < 0) return RoleDirection.UP_RIGHT;
        
//         // 四正方向
//         if (dy > 0) return RoleDirection.DOWN;
//         if (dy < 0) return RoleDirection.UP;
//         if (dx > 0) return RoleDirection.RIGHT;
//         if (dx < 0) return RoleDirection.LEFT;
        
//         return this.mState.direction;
//     }
// }