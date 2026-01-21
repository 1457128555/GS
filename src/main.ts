import './style.css';

import { Game } from './core/Game';
import { Scene } from './actor/Scene';
import { ActorLoader } from './core/ActorLoader';
import { registerAllTypes } from './core/RegisterTypes';
import { HeroManager } from './manager/HeroManager';
import { EnemyManager } from './manager/EnemyManager';
import { BattleManager } from './manager/BattleManager';

async function main() 
{
    // 1. 注册所有类型（必须在加载场景之前）
    registerAllTypes();

    // 创建游戏实例
    const game = new Game();

    // 获取容器并初始化
    const container = document.getElementById('game');
    if (!container) 
        throw new Error('找不到 #game 容器');

    await game.init(container);

    // 从JSON加载场景
    const scene = ActorLoader.loadFromTemplate({ 
        path: '/actors/game_scene.json', 
        override: { name: 'GameScene' } 
    }) as Scene;

    // 加载游戏场景
    game.loadScene(scene);

    // 初始化英雄管理器
    HeroManager.Instance().init(scene);

    // 初始化敌人管理器
    EnemyManager.Instance().init(scene);

    // ========== 测试：生成一个英雄 ==========
    HeroManager.Instance().spawnHero('test_user_001', '测试玩家');

    // ========== 使用泊松盘采样生成10个敌人 ==========
    EnemyManager.Instance().spawnEnemiesPoisson(10, {
        x: 80,      // 左边距
        y: 120,     // 顶部位置
        width: 560, // 可用宽度 (720 - 80*2)
        height: 250 // 可用高度
    }, 70);  // 最小间距

    // 页面关闭时清理
    window.addEventListener('beforeunload', () => {
        BattleManager.Instance().clear();
        HeroManager.Instance().clear();
        EnemyManager.Instance().clear();
        game.destroy();
    });
}

main().catch(console.error);
