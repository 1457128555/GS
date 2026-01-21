import { Application } from 'pixi.js';
import { AssetManager } from './AssetManager';
import { Scene } from '../actor/Scene';
import { BattleManager } from '../manager/BattleManager';

export class Game 
{
    private mApp: Application;
    private mCurrentScene: Scene | null = null;
    private mContainer: HTMLElement | null = null;

    readonly mWidth: number = 720;
    readonly mHeight: number = 1280;

    constructor() 
    {
        this.mApp = new Application();
    }

    async init(container: HTMLElement): Promise<void> 
    {
        this.mContainer = container;

        await this.mApp.init({
            width: this.mWidth,
            height: this.mHeight,
            backgroundColor: 0x000000,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
        });

        this.mContainer.appendChild(this.mApp.canvas);
        this.resize();
        window.addEventListener('resize', this.resize);

        await AssetManager.Instance().load();
    }

    private resize = (): void => 
    {
        const ratio = this.mWidth / this.mHeight; // 9:16
        const windowRatio = window.innerWidth / window.innerHeight;

        if (windowRatio > ratio) 
        {
            this.mApp.canvas.style.height = '100vh';
            this.mApp.canvas.style.width = `${window.innerHeight * ratio}px`;
        } 
        else 
        {
            this.mApp.canvas.style.width = '100vw';
            this.mApp.canvas.style.height = `${window.innerWidth / ratio}px`;
        }
    }

    loadScene(scene: Scene)
    {
        // 卸载当前场景
        if (this.mCurrentScene) 
            this.mApp.stage.removeChild(this.mCurrentScene.container);

        // 加载新场景
        this.mCurrentScene = scene;
        this.mApp.stage.addChild(scene.container);

        // 启动场景更新循环
        this.mApp.ticker.add(this.update);
    }

    private update = (): void => 
    {
        if (this.mCurrentScene) 
        {
            const deltaTime = this.mApp.ticker.deltaMS / 1000;
            
            // 更新战斗管理器（处理碰撞分离等）
            BattleManager.Instance().update(deltaTime);
            
            this.mCurrentScene._update(deltaTime);
        }
    }

    destroy(): void
    {
        window.removeEventListener('resize', this.resize);
        this.mApp.ticker.remove(this.update);
        this.mApp.destroy(true, { children: true });
        AssetManager.Instance().unload();
    }
}