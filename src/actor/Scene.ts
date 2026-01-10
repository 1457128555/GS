import { Actor } from '../core/Actor';

export class Scene extends Actor 
{
    mWidth: number = 720;
    mHeight: number = 1280;

    override initFromData(properties: Record<string, any>): void 
    {
        super.initFromData(properties);
        
        this.mWidth = properties.width;
        this.mHeight = properties.height;
    }
}

