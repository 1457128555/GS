import { AnimatedSprite, Texture, Rectangle } from 'pixi.js';

import { RoleState, RoleAction, RoleDirection, RoleActor } from '../actor/RoleActor';
import { AssetManager } from '../core/AssetManager';
import { Component } from '../core/Component';

interface LPCSheetConfig {
    frameWidth: number;             // 单帧宽度
    frameHeight: number;            // 单帧高度
    actions: Record<RoleAction, { 
        row: number;                // 该动作在精灵表的起始行
        frameCount: number;         // 该动作的帧数
        loop: boolean;              // 是否循环播放
    }>;
}

export class LPCRenderComp extends Component {
    protected mPath: string = '';
    protected mConfig: LPCSheetConfig = {
        frameWidth: 64,
        frameHeight: 64,
        actions: {
            // IDLE 使用 Walk 的第一帧（精灵表没有独立的战斗待机）
            [RoleAction.IDLE]: { row: 8, frameCount: 1, loop: false },
            [RoleAction.WALK]: { row: 8, frameCount: 9, loop: true },
            [RoleAction.SLASH]: { row: 12, frameCount: 6, loop: false }, 
            [RoleAction.BACK_SLASH]: { row: 16, frameCount: 13, loop: false },
            [RoleAction.HURT]: { row: 32, frameCount: 6, loop: false },
            [RoleAction.DEAD]: { row: 36, frameCount: 6, loop: false },
        },
    };
    protected mZIndex: number = 0;

    protected mAnimatedSprite?: AnimatedSprite;
    protected mTextureCache: Map<string, Texture[]> = new Map();
    protected mCurrentState?: RoleState;

    private get roleParent(): RoleActor {
        return this.parent as RoleActor;
    }
    
    // 状态变化回调
    protected mStateHandler = (state: RoleState) => this.onRoleStateChange(state);

    protected onAttach(): void {
        this.initSprite();
        this.parent?.container.addChild(this.mAnimatedSprite!);
        
        // 监听RoleActor的状态变化
        this.roleParent.addStateListener(this.mStateHandler);
        // 初始化到当前状态
        this.onRoleStateChange(this.roleParent.state);
    }

    protected onDetach(): void {
        this.roleParent.removeStateListener(this.mStateHandler);
        this.mAnimatedSprite?.removeFromParent();
    }

    override initFromData(properties: Record<string, any>): void {
        super.initFromData(properties);

        if ('path' in properties) 
            this.mPath = properties.path;
        if ('config' in properties) 
            this.mConfig = { ...this.mConfig, ...properties.config };
        if ('zIndex' in properties) 
            this.mZIndex = properties.zIndex;
    }

    protected initSprite(): void {
        if (this.mAnimatedSprite) return;

        // 先用默认帧创建
        const defaultFrames = this.getFrames(RoleAction.IDLE, RoleDirection.DOWN);
        this.mAnimatedSprite = new AnimatedSprite(defaultFrames);
        this.mAnimatedSprite.zIndex = this.mZIndex;
        this.mAnimatedSprite.animationSpeed = 0.15;
        // 设置锚点为底部中心，这样位置就是角色脚下的位置
        this.mAnimatedSprite.anchor.set(0.5, 1);
    }

    // 根据动作和方向获取帧
    protected getFrames(action: RoleAction, direction: RoleDirection): Texture[] {
        const cacheKey = `${action}_${direction}`;
        
        if (this.mTextureCache.has(cacheKey)) {
            return this.mTextureCache.get(cacheKey)!;
        }

        const baseTexture = AssetManager.Instance().getTexture(this.mPath);
        const actionConfig = this.mConfig.actions[action];
        
        if (!actionConfig) {
            console.warn(`Action ${action} not found in config`);
            return [];
        }

        const frames: Texture[] = [];
        const row = actionConfig.row + direction; // LPC每个方向占一行
        
        for (let i = 0; i < actionConfig.frameCount; i++) {
            const frame = new Texture({
                source: baseTexture.source,
                frame: new Rectangle(
                    i * this.mConfig.frameWidth,
                    row * this.mConfig.frameHeight,
                    this.mConfig.frameWidth,
                    this.mConfig.frameHeight
                )
            });
            frames.push(frame);
        }

        this.mTextureCache.set(cacheKey, frames);

        return frames;
    }

    protected onRoleStateChange(state: RoleState): void {
        if (!this.mAnimatedSprite) return;
        
        // 状态未变化时跳过
        if (this.mCurrentState?.action === state.action && 
            this.mCurrentState?.direction === state.direction) {
            return;
        }
        
        this.mCurrentState = { ...state };
        
        const frames = this.getFrames(state.action, state.direction);
        if (frames.length > 0) {
            this.mAnimatedSprite.textures = frames;
            const actionConfig = this.mConfig.actions[state.action];
            this.mAnimatedSprite.loop = actionConfig?.loop ?? true;
            this.mAnimatedSprite.gotoAndPlay(0);
        }
    }
}