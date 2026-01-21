import { ActorLoader } from '../core/ActorLoader';
import { HeroActor } from '../actor/HeroActor';
import { Scene } from '../actor/Scene';

/**
 * 英雄管理器 - 管理所有观众英雄的创建和销毁
 */
export class HeroManager 
{
    private static sInstance: HeroManager;
    
    private mScene: Scene | null = null;
    private mHeroes: Map<string, HeroActor> = new Map();
    
    // 地图下方中间（精确位置，不随机）
    private mSpawnAreaCenter = { x: 360, y: 950 };
    private mSpawnAreaSize = { width: 0, height: 0 };  // 设为0表示不随机

    static Instance(): HeroManager 
    {
        if (!this.sInstance)
            this.sInstance = new HeroManager();
        return this.sInstance;
    }

    /**
     * 初始化，绑定场景
     */
    init(scene: Scene): void 
    {
        this.mScene = scene;
    }

    /**
     * 生成英雄
     * @param userId 用户ID（用于标识和管理）
     * @param userName 用户昵称（用于显示）
     */
    spawnHero(userId: string, userName: string = ''): HeroActor | null 
    {
        if (!this.mScene) 
        {
            console.error('[HeroManager] Scene not initialized!');
            return null;
        }

        // 检查是否已存在
        if (this.mHeroes.has(userId)) 
        {
            console.warn(`[HeroManager] Hero for user ${userId} already exists!`);
            return this.mHeroes.get(userId)!;
        }

        // 计算随机位置（在中心区域内）
        const spawnPos = this.getRandomSpawnPosition();

        // 从模板创建英雄
        const hero = ActorLoader.loadFromTemplate({
            path: '/actors/hero.json',
            override: {
                name: `Hero_${userId}`,
                userId: userId,
                userName: userName,
                position: spawnPos
            }
        }) as HeroActor;

        // 添加到场景
        this.mScene.addChild(hero);
        this.mHeroes.set(userId, hero);

        console.log(`[HeroManager] Hero spawned for ${userName || userId} at (${spawnPos.x.toFixed(0)}, ${spawnPos.y.toFixed(0)})`);
        
        return hero;
    }

    /**
     * 移除英雄
     */
    removeHero(userId: string): void 
    {
        const hero = this.mHeroes.get(userId);
        if (hero && this.mScene) 
        {
            this.mScene.removeChild(hero);
            this.mHeroes.delete(userId);
            console.log(`[HeroManager] Hero removed for ${userId}`);
        }
    }

    /**
     * 获取英雄
     */
    getHero(userId: string): HeroActor | undefined 
    {
        return this.mHeroes.get(userId);
    }

    /**
     * 检查英雄是否存在
     */
    hasHero(userId: string): boolean 
    {
        return this.mHeroes.has(userId);
    }

    /**
     * 获取所有英雄
     */
    getAllHeroes(): HeroActor[] 
    {
        return Array.from(this.mHeroes.values());
    }

    /**
     * 获取英雄数量
     */
    getHeroCount(): number 
    {
        return this.mHeroes.size;
    }

    /**
     * 计算随机生成位置
     */
    private getRandomSpawnPosition(): { x: number, y: number } 
    {
        const halfWidth = this.mSpawnAreaSize.width / 2;
        const halfHeight = this.mSpawnAreaSize.height / 2;
        
        return {
            x: this.mSpawnAreaCenter.x + (Math.random() - 0.5) * 2 * halfWidth,
            y: this.mSpawnAreaCenter.y + (Math.random() - 0.5) * 2 * halfHeight
        };
    }

    /**
     * 清理所有英雄
     */
    clear(): void 
    {
        for (const userId of Array.from(this.mHeroes.keys())) 
        {
            this.removeHero(userId);
        }
    }
}
