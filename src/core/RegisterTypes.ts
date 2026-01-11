/**
 * 集中注册所有Actor和Component类型
 * 在应用启动时调用
 */

import { TypeRegistry } from './TypeRegistry';

// Actor类型
import { Actor } from './Actor';
import { Scene } from '../actor/Scene';

// Component类型
import { TextureComp } from '../component/TextureComp';
import { AnimationComp } from '../component/AnimationComp';

export function registerAllTypes(): void 
{
    // 注册Actor类型
    TypeRegistry.registerActor('Actor', Actor);
    TypeRegistry.registerActor('Scene', Scene);
    
    // 注册Component类型
    TypeRegistry.registerComponent('TextureComp', TextureComp);
    TypeRegistry.registerComponent('AnimationComp', AnimationComp);
    
    console.log('All types registered successfully!');
}