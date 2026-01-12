import { RoleActor } from './RoleActor';

export class PlayerActor extends RoleActor {

    private mAngle: number = 0;
    private mAngularSpeed: number = 1; // 每秒转动的弧度，可调整速度

    protected override onUpdate(dt: number): void {
        this.mAngle += this.mAngularSpeed * dt;
        this.mDirection.x = Math.cos(this.mAngle);
        this.mDirection.y = Math.sin(this.mAngle);
        
        super.onUpdate(dt);
    }
}