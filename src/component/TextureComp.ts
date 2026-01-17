import { Point, Sprite } from 'pixi.js';
import { AssetManager } from '../core/AssetManager';
import { Component } from '../core/Component';

export class TextureComp extends Component 
{
    protected mPath: string = '';
    protected mSize: Point = new Point(0, 0);
    protected mPosition: Point = new Point(0, 0);

    protected mSprite?: Sprite;

    protected onAttach()
    {
        this.initSprite();
        this.parent?.container.addChild(this.mSprite!);
    }

    protected onDetach(): void
    {
        this.mSprite?.removeFromParent();
    }

    override initFromData(properties: Record<string, any>): void 
    {
        super.initFromData(properties);
        if('path' in properties)
            this.mPath = properties.path;
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
        if (this.mSprite) return;
        
        this.mSprite = new Sprite(AssetManager.Instance().getTexture(this.mPath));
        this.mSprite.width = this.mSize.x;
        this.mSprite.height = this.mSize.y;
        this.mSprite.position.set(this.mPosition.x, this.mPosition.y);
    }
}