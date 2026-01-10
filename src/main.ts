import './style.css';

import { Game } from './core/Game';
import { Scene } from './actor/Scene';
import { SceneLoader } from './core/SceneLoader';
import { registerAllTypes } from './core/RegisterTypes';


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
    const scene = await SceneLoader.loadFromFile('/scenes/main_scene.json') as Scene;

    // 加载游戏场景
    game.loadScene(scene);

    // 页面关闭时清理
    window.addEventListener('beforeunload', () => {
        game.destroy();
    });
}

main().catch(console.error);