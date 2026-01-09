import './style.css';

import { Point } from 'pixi.js';

import { Game } from './core/Game';
import { Scene } from './actor/Scene';
import { TextureComp } from './component/TextureComp';
import { SpringWaterComp } from './component/SpringWaterComp';


async function main() 
{
    // 创建游戏实例
    const game = new Game();

    // 获取容器并初始化
    const container = document.getElementById('game');
    if (!container) 
        throw new Error('找不到 #game 容器');

    await game.init(container);

    const scene = new Scene(game.mWidth, game.mHeight);
    const bgTextureComp = new TextureComp('/map.png', new Point(game.mWidth, game.mHeight), new Point(0, 0));
    const springWaterComp = new SpringWaterComp(new Point(150, 150), new Point(50, 1100));
    scene.addComponent(bgTextureComp);
    scene.addComponent(springWaterComp);

    // 加载游戏场景
    game.loadScene(scene);

    // 页面关闭时清理
    window.addEventListener('beforeunload', () => {
        game.destroy();
    });
}

main().catch(console.error);