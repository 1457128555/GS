import { Point } from 'pixi.js';

import {TextureComp} from './TextureComp';

export class SpringWaterComp extends TextureComp
{
    constructor(size: Point, pos: Point)
    {
        super('/spring_water.png', size, pos);
    }
}