import { ActorLoader } from '../core/ActorLoader';
import { EnemyActor } from '../actor/EnemyActor';
import { Scene } from '../actor/Scene';

/**
 * 敌人管理器 - 管理敌人小兵的创建和销毁
 */
export class EnemyManager 
{
    private static sInstance: EnemyManager;
    
    private mScene: Scene | null = null;
    private mEnemies: Map<string, EnemyActor> = new Map();

    static Instance(): EnemyManager 
    {
        if (!this.sInstance)
            this.sInstance = new EnemyManager();
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
     * 使用泊松盘采样在指定区域生成敌人
     * @param count 敌人数量
     * @param area 生成区域 { x, y, width, height }
     * @param minDistance 最小间距
     */
    spawnEnemiesPoisson(
        count: number, 
        area: { x: number, y: number, width: number, height: number },
        minDistance: number = 60
    ): void 
    {
        if (!this.mScene) 
        {
            console.error('[EnemyManager] Scene not initialized!');
            return;
        }

        // 生成泊松盘采样点
        const points = this.poissonDiskSampling(
            area.width, 
            area.height, 
            minDistance, 
            count
        );

        // 在每个点生成敌人
        for (let i = 0; i < points.length; i++) 
        {
            const enemyId = `enemy_${i}`;
            const xPos = area.x + points[i].x;
            const yPos = area.y + points[i].y;
            
            this.spawnEnemy(enemyId, xPos, yPos);
        }

        console.log(`[EnemyManager] Spawned ${points.length} enemies using Poisson disk sampling`);
    }

    /**
     * 泊松盘采样算法
     * 生成均匀但随机分布的点
     */
    private poissonDiskSampling(
        width: number, 
        height: number, 
        minDist: number, 
        maxPoints: number,
        maxAttempts: number = 30
    ): { x: number, y: number }[] 
    {
        const cellSize = minDist / Math.sqrt(2);
        const gridWidth = Math.ceil(width / cellSize);
        const gridHeight = Math.ceil(height / cellSize);
        
        // 网格用于快速查找邻近点
        const grid: (number | null)[][] = [];
        for (let i = 0; i < gridWidth; i++) 
        {
            grid[i] = [];
            for (let j = 0; j < gridHeight; j++) 
            {
                grid[i][j] = null;
            }
        }

        const points: { x: number, y: number }[] = [];
        const activeList: number[] = [];

        // 添加第一个随机点
        const firstPoint = {
            x: Math.random() * width,
            y: Math.random() * height
        };
        points.push(firstPoint);
        activeList.push(0);
        
        const gridX = Math.floor(firstPoint.x / cellSize);
        const gridY = Math.floor(firstPoint.y / cellSize);
        if (gridX >= 0 && gridX < gridWidth && gridY >= 0 && gridY < gridHeight)
            grid[gridX][gridY] = 0;

        // 迭代生成更多点
        while (activeList.length > 0 && points.length < maxPoints) 
        {
            // 随机选择一个活跃点
            const activeIdx = Math.floor(Math.random() * activeList.length);
            const pointIdx = activeList[activeIdx];
            const point = points[pointIdx];

            let found = false;

            // 尝试在该点周围生成新点
            for (let attempt = 0; attempt < maxAttempts; attempt++) 
            {
                // 在 [minDist, 2*minDist] 范围内随机选择距离
                const angle = Math.random() * Math.PI * 2;
                const distance = minDist + Math.random() * minDist;
                
                const newX = point.x + Math.cos(angle) * distance;
                const newY = point.y + Math.sin(angle) * distance;

                // 检查是否在区域内
                if (newX < 0 || newX >= width || newY < 0 || newY >= height)
                    continue;

                // 检查与其他点的距离
                const newGridX = Math.floor(newX / cellSize);
                const newGridY = Math.floor(newY / cellSize);

                let tooClose = false;

                // 检查周围网格
                for (let dx = -2; dx <= 2 && !tooClose; dx++) 
                {
                    for (let dy = -2; dy <= 2 && !tooClose; dy++) 
                    {
                        const checkX = newGridX + dx;
                        const checkY = newGridY + dy;

                        if (checkX >= 0 && checkX < gridWidth && 
                            checkY >= 0 && checkY < gridHeight) 
                        {
                            const neighborIdx = grid[checkX][checkY];
                            if (neighborIdx !== null) 
                            {
                                const neighbor = points[neighborIdx];
                                const distSq = (newX - neighbor.x) ** 2 + (newY - neighbor.y) ** 2;
                                if (distSq < minDist * minDist) 
                                {
                                    tooClose = true;
                                }
                            }
                        }
                    }
                }

                if (!tooClose) 
                {
                    // 添加新点
                    const newIdx = points.length;
                    points.push({ x: newX, y: newY });
                    activeList.push(newIdx);
                    
                    if (newGridX >= 0 && newGridX < gridWidth && 
                        newGridY >= 0 && newGridY < gridHeight)
                        grid[newGridX][newGridY] = newIdx;
                    
                    found = true;
                    break;
                }
            }

            // 如果找不到新点，从活跃列表移除
            if (!found) 
            {
                activeList.splice(activeIdx, 1);
            }

            // 达到目标数量后停止
            if (points.length >= maxPoints)
                break;
        }

        return points.slice(0, maxPoints);
    }

    /**
     * 生成单个敌人
     */
    spawnEnemy(enemyId: string, x: number, y: number): EnemyActor | null 
    {
        if (!this.mScene) 
        {
            console.error('[EnemyManager] Scene not initialized!');
            return null;
        }

        // 检查是否已存在
        if (this.mEnemies.has(enemyId)) 
        {
            console.warn(`[EnemyManager] Enemy ${enemyId} already exists!`);
            return this.mEnemies.get(enemyId)!;
        }

        // 从模板创建敌人
        const enemy = ActorLoader.loadFromTemplate({
            path: '/actors/enemy.json',
            override: {
                name: `Enemy_${enemyId}`,
                enemyId: enemyId,
                position: { x, y }
            }
        }) as EnemyActor;

        // 添加到场景
        this.mScene.addChild(enemy);
        this.mEnemies.set(enemyId, enemy);

        return enemy;
    }

    /**
     * 移除敌人
     */
    removeEnemy(enemyId: string): void 
    {
        const enemy = this.mEnemies.get(enemyId);
        if (enemy && this.mScene) 
        {
            this.mScene.removeChild(enemy);
            this.mEnemies.delete(enemyId);
        }
    }

    /**
     * 获取敌人
     */
    getEnemy(enemyId: string): EnemyActor | undefined 
    {
        return this.mEnemies.get(enemyId);
    }

    /**
     * 获取所有敌人
     */
    getAllEnemies(): EnemyActor[] 
    {
        return Array.from(this.mEnemies.values());
    }

    /**
     * 获取敌人数量
     */
    getEnemyCount(): number 
    {
        return this.mEnemies.size;
    }

    /**
     * 清理所有敌人
     */
    clear(): void 
    {
        for (const enemyId of Array.from(this.mEnemies.keys())) 
        {
            this.removeEnemy(enemyId);
        }
    }
}
