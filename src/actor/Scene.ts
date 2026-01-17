import { Actor } from '../core/Actor';

export class Scene extends Actor 
{
    protected mWidth: number = 720;
    protected mHeight: number = 1280;

    override initFromData(properties: Record<string, any>): void 
    {
        super.initFromData(properties);

        if('width' in properties)
            this.mWidth = properties.width;
        if('height' in properties)
            this.mHeight = properties.height;
    }
}

