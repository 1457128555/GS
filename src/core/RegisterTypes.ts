/**
 * 集中注册所有Actor和Component类型
 * 在应用启动时调用
 */

import { TypeRegistry } from './TypeRegistry';

// Actor类型
import { Actor } from './Actor';
import { Scene } from '../actor/Scene';
import { PlayerActor } from '../actor/PlayerActor';
import { HeroActor } from '../actor/HeroActor';
import { EnemyActor } from '../actor/EnemyActor';

// Component类型
import { TextureComp } from '../component/TextureComp';
import { AnimationComp } from '../component/AnimationComp';
import { LPCRenderComp } from '../component/LPCRenderComp';
import { BattleComp } from '../component/BattleComp';
import { HealthBarComp } from '../component/HealthBarComp';

export function registerAllTypes(): void 
{
    // 注册Actor类型
    TypeRegistry.registerActor('Actor', Actor);
    TypeRegistry.registerActor('Scene', Scene);
    TypeRegistry.registerActor('PlayerActor', PlayerActor);
    TypeRegistry.registerActor('HeroActor', HeroActor);
    TypeRegistry.registerActor('EnemyActor', EnemyActor);
    
    // 注册Component类型
    TypeRegistry.registerComponent('TextureComp', TextureComp);
    TypeRegistry.registerComponent('AnimationComp', AnimationComp);
    TypeRegistry.registerComponent('LPCRenderComp', LPCRenderComp);
    TypeRegistry.registerComponent('BattleComp', BattleComp);
    TypeRegistry.registerComponent('HealthBarComp', HealthBarComp);
    
    console.log('All types registered successfully!');
}