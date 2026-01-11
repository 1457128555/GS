








// import { AnimatedSprite, Texture, Rectangle, Point } from 'pixi.js';
// import { AssetManager } from '../core/AssetManager';
// import { Component } from '../core/Component';
// import { RoleActor, RoleState, RoleAction, RoleDirection } from '../actor/RoleActor';

// // LPC精灵表配置
// interface LPCSheetConfig {
//     frameWidth: number;     // 单帧宽度
//     frameHeight: number;    // 单帧高度
//     actions: {
//         [key: string]: {
//             row: number;        // 该动作在精灵表的起始行
//             frameCount: number; // 帧数
//             loop: boolean;      // 是否循环
//         };
//     };
// }

// export class LPCPartComp extends Component {
//     protected mPath: string = '';
//     protected mPartName: string = '';  // body, hair, clothes等
//     protected mZIndex: number = 0;     // 渲染层级
//     protected mAnchor: Point = new Point(0.5, 0.5);

//     protected mConfig: LPCSheetConfig = {
//         frameWidth: 64,
//         frameHeight: 64,
//         actions: {
//             [RoleAction.IDLE]: { row: 0, frameCount: 1, loop: false },
//             [RoleAction.WALK]: { row: 8, frameCount: 9, loop: true },
//             [RoleAction.ATTACK]: { row: 12, frameCount: 6, loop: false }
//         }
//     };

//     protected mAnimatedSprite?: AnimatedSprite;
//     protected mTextureCache: Map<string, Texture[]> = new Map();
//     protected mCurrentState?: RoleState;

//     // 状态变化回调
//     protected mStateHandler = (state: RoleState) => this.onRoleStateChange(state);

//     protected onAttach(): void {
//         this.initSprite();
//         this.parent?.container.addChild(this.mAnimatedSprite!);
        
//         // 监听RoleActor的状态变化
//         if (this.parent instanceof RoleActor) {
//             this.parent.addStateListener(this.mStateHandler);
//             // 初始化到当前状态
//             this.onRoleStateChange(this.parent.state);
//         }
//     }

//     protected onDetach(): void {
//         if (this.parent instanceof RoleActor) {
//             this.parent.removeStateListener(this.mStateHandler);
//         }
//         this.mAnimatedSprite?.removeFromParent();
//     }

//     override initFromData(properties: Record<string, any>): void {
//         super.initFromData(properties);
//         this.mPath = properties.path;
//         this.mPartName = properties.partName || 'body';
//         this.mZIndex = properties.zIndex || 0;
        
//         if (properties.config) {
//             this.mConfig = { ...this.mConfig, ...properties.config };
//         }
//     }

//     protected initSprite(): void {
//         if (this.mAnimatedSprite) return;

//         // 先用默认帧创建
//         const defaultFrames = this.getFrames(RoleAction.IDLE, RoleDirection.DOWN);
//         this.mAnimatedSprite = new AnimatedSprite(defaultFrames);
//         this.mAnimatedSprite.anchor.set(this.mAnchor.x, this.mAnchor.y);
//         this.mAnimatedSprite.zIndex = this.mZIndex;
//         this.mAnimatedSprite.animationSpeed = 0.15;
//     }

//     // 根据动作和方向获取帧
//     protected getFrames(action: RoleAction, direction: RoleDirection): Texture[] {
//         const cacheKey = `${action}_${direction}`;
        
//         if (this.mTextureCache.has(cacheKey)) {
//             return this.mTextureCache.get(cacheKey)!;
//         }

//         const baseTexture = AssetManager.Instance().getTexture(this.mPath);
//         const actionConfig = this.mConfig.actions[action];
        
//         if (!actionConfig) {
//             console.warn(`Action ${action} not found in config`);
//             return [];
//         }

//         const frames: Texture[] = [];
//         const row = actionConfig.row + direction; // LPC每个方向占一行
        
//         for (let i = 0; i < actionConfig.frameCount; i++) {
//             const frame = new Texture({
//                 source: baseTexture.source,
//                 frame: new Rectangle(
//                     i * this.mConfig.frameWidth,
//                     row * this.mConfig.frameHeight,
//                     this.mConfig.frameWidth,
//                     this.mConfig.frameHeight
//                 )
//             });
//             frames.push(frame);
//         }

//         this.mTextureCache.set(cacheKey, frames);

//         return frames;
//     }

//     protected onRoleStateChange(state: RoleState): void {
//         if (!this.mAnimatedSprite) return;
        
//         // 状态未变化时跳过
//         if (this.mCurrentState?.action === state.action && 
//             this.mCurrentState?.direction === state.direction) {
//             return;
//         }
        
//         this.mCurrentState = { ...state };
        
//         const frames = this.getFrames(state.action, state.direction);
//         if (frames.length > 0) {
//             this.mAnimatedSprite.textures = frames;
//             const actionConfig = this.mConfig.actions[state.action];
//             this.mAnimatedSprite.loop = actionConfig?.loop ?? true;
//             this.mAnimatedSprite.gotoAndPlay(0);
//         }
//     }
// }