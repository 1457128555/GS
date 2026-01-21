import { RoleActor, RoleDirection, RoleAction } from './RoleActor';

export class PlayerActor extends RoleActor {

    private mAttackTimer: number = 0;
    private mDirIndex: number = 0;
    private mDirs = [
        RoleDirection.DOWN, 
        RoleDirection.LEFT, 
        RoleDirection.UP, 
        RoleDirection.RIGHT
    ];

    protected override onUpdate(dt: number): void {
        this.mAttackTimer += dt;
        
        // 每1秒攻击一次，换一个方向
        if (this.mAttackTimer >= 1.0) {
            this.mAttackTimer = 0;
            this.setDirection(this.mDirs[this.mDirIndex]);
            this.setAction(RoleAction.SLASH);
            this.mDirIndex = (this.mDirIndex + 1) % 4;
        }
        
        //super.onUpdate(dt);
    }
}