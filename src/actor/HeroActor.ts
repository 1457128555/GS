import { RoleActor, RoleAction, RoleDirection, RoleFaction } from './RoleActor';

/**
 * 英雄 Actor - 观众进入直播间生成的角色
 */
export class HeroActor extends RoleActor 
{
    // 英雄所属的用户ID（日后弹幕系统用）
    protected mUserId: string = '';
    protected mUserName: string = '';

    get userId(): string { return this.mUserId; }
    get userName(): string { return this.mUserName; }

    constructor() 
    {
        super();
        // 英雄阵营
        this.mFaction = RoleFaction.HERO;
    }

    override initFromData(properties: Record<string, any>): void 
    {
        super.initFromData(properties);

        if ('userId' in properties)
            this.mUserId = properties.userId;
        if ('userName' in properties)
            this.mUserName = properties.userName;
    }

    protected override onAttach(): void 
    {
        // 初始化为 IDLE 状态，面朝上（朝向敌人）
        this.setAction(RoleAction.IDLE);
        this.setDirection(RoleDirection.UP);
    }
}
