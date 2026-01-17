import { AnimatedSprite, Texture, Rectangle, Point } from 'pixi.js';
import { AssetManager } from '../core/AssetManager';
import { Component } from '../core/Component';

export class AnimationComp extends Component 
{
    protected mPath: string = '';
    protected mFrameCount: number = 0;
    protected mAnimationSpeed: number = 0.15;

    protected mSize: Point = new Point(0, 0);
    protected mPosition: Point = new Point(0, 0);

    protected mAnimatedSprite?: AnimatedSprite;

    protected onAttach()
    {
        this.initSprite();
        this.parent?.container.addChild(this.mAnimatedSprite!);
    }

    protected onDetach(): void
    {
        this.mAnimatedSprite?.removeFromParent();
    }

    override initFromData(properties: Record<string, any>): void 
    {
        super.initFromData(properties);

        if('path' in properties)
            this.mPath = properties.path;
        if('frameCount' in properties)
            this.mFrameCount = properties.frameCount;
        if('animationSpeed' in properties)
            this.mAnimationSpeed = properties.animationSpeed;
        if('size' in properties)
            this.mSize = new Point(properties.size.x, properties.size.y);
        if('position' in properties)
            this.mPosition = new Point(properties.position.x, properties.position.y);
    }

    /**
     * 初始化Sprite（延迟初始化）
     */
    protected initSprite(): void 
    {
        if (this.mAnimatedSprite) return;

        // 从精灵图创建帧纹理
        const baseTexture = AssetManager.Instance().getTexture(this.mPath);
        const frameWidth = baseTexture.width / this.mFrameCount;
        const frameHeight = baseTexture.height;

        const frames: Texture[] = [];
        for (let i = 0; i < this.mFrameCount; i++) {
            const frame = new Texture({
                source: baseTexture.source,
                frame: new Rectangle(i * frameWidth, 0, frameWidth, frameHeight)
            });
            frames.push(frame);
        }
        
        this.mAnimatedSprite = new AnimatedSprite(frames);
        this.mAnimatedSprite.width = this.mSize.x;
        this.mAnimatedSprite.height = this.mSize.y;
        this.mAnimatedSprite.position.set(this.mPosition.x, this.mPosition.y);
        this.mAnimatedSprite.animationSpeed = this.mAnimationSpeed;
        this.mAnimatedSprite.loop = true;
        this.mAnimatedSprite.play();
    }
}