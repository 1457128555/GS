import { Actor } from '../core/Actor';
import { Game } from '../core/Game';

export class Scene extends Actor 
{
    readonly mWidth: number;
    readonly mHeight: number;

    constructor(width: number, height: number) 
    {
        super();
        this.mWidth = width;
        this.mHeight = height;
    }
}

