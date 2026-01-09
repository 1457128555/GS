import { Point, Sprite } from 'pixi.js';
import { AssetManager } from '../core/AssetManager';
import { Component } from '../core/Component';

export class TextureComp extends Component 
{
    private mSprite: Sprite;

    constructor(path: string, size: Point, pos: Point)
    {
        super();

        this.mSprite = new Sprite(AssetManager.Instance().getTexture(path));

        this.mSprite.width = size.x;
        this.mSprite.height = size.y;
        this.mSprite.position.set(pos.x, pos.y);
    }

    protected onAttach()
    {
        this.parent?.container.addChild(this.mSprite);
    }

    protected onDetach(): void
    {
        this.mSprite.removeFromParent();
    }
}