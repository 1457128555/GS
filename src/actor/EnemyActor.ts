import { RoleActor, RoleAction, RoleDirection, RoleFaction } from './RoleActor';

/**
 * 敌人 Actor - 地图上方的敌人小兵
 */
export class EnemyActor extends RoleActor 
{
    protected mEnemyId: string = '';

    get enemyId(): string { return this.mEnemyId; }

    constructor() 
    {
        super();
        // 敌人阵营
        this.mFaction = RoleFaction.ENEMY;
    }

    override initFromData(properties: Record<string, any>): void 
    {
        super.initFromData(properties);

        if ('enemyId' in properties)
            this.mEnemyId = properties.enemyId;
    }

    protected override onAttach(): void 
    {
        // 初始化为 IDLE 状态，面朝下（朝向玩家）
        this.setAction(RoleAction.IDLE);
        this.setDirection(RoleDirection.DOWN);
    }
}
