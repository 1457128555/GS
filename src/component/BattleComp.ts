import { Component } from '../core/Component';
import { RoleActor, RoleAction, RoleFaction } from '../actor/RoleActor';
import { BattleManager } from '../manager/BattleManager';

/**
 * 战斗状态
 */
enum BattleState {
    IDLE,           // 待机
    SEEK_TARGET,    // 寻找目标
    MOVE_TO_TARGET, // 移动到目标
    ATTACK,         // 攻击中
    COOLDOWN,       // 攻击冷却
}

/**
 * 战斗组件 - 处理角色的自动战斗 AI
 */
export class BattleComp extends Component 
{
    protected mState: BattleState = BattleState.IDLE;
    protected mTarget: RoleActor | null = null;
    protected mCooldownTimer: number = 0;
    protected mAttackTimer: number = 0;
    protected mAttackDuration: number = 0.5;  // 攻击动画持续时间

    private get roleParent(): RoleActor {
        return this.parent as RoleActor;
    }

    protected override onAttach(): void 
    {
        // 注册到战斗管理器
        BattleManager.Instance().registerRole(this.roleParent);
        
        // 开始战斗
        this.mState = BattleState.SEEK_TARGET;
    }

    protected override onDetach(): void 
    {
        BattleManager.Instance().unregisterRole(this.roleParent);
    }

    protected override onUpdate(dt: number): void 
    {
        const role = this.roleParent;
        if (role.isDead) return;

        switch (this.mState) 
        {
            case BattleState.IDLE:
                this.handleIdle(dt);
                break;
                
            case BattleState.SEEK_TARGET:
                this.handleSeekTarget(dt);
                break;
                
            case BattleState.MOVE_TO_TARGET:
                this.handleMoveToTarget(dt);
                break;
                
            case BattleState.ATTACK:
                this.handleAttack(dt);
                break;
                
            case BattleState.COOLDOWN:
                this.handleCooldown(dt);
                break;
        }
    }

    /**
     * 待机状态
     */
    protected handleIdle(dt: number): void 
    {
        this.roleParent.setAction(RoleAction.IDLE);
        // 短暂等待后开始寻找目标
        this.mState = BattleState.SEEK_TARGET;
    }

    /**
     * 寻找目标
     */
    protected handleSeekTarget(dt: number): void 
    {
        const role = this.roleParent;
        
        // 寻找最近的敌人
        this.mTarget = BattleManager.Instance().getNearestEnemy(role);
        
        if (this.mTarget && !this.mTarget.isDead) {
            // 找到目标，开始移动
            this.mState = BattleState.MOVE_TO_TARGET;
        } else {
            // 没有目标，待机
            role.setAction(RoleAction.IDLE);
            this.mTarget = null;
        }
    }

    /**
     * 移动到目标
     */
    protected handleMoveToTarget(dt: number): void 
    {
        const role = this.roleParent;
        
        // 检查目标是否有效
        if (!this.mTarget || this.mTarget.isDead) {
            this.mState = BattleState.SEEK_TARGET;
            return;
        }

        const distance = role.distanceTo(this.mTarget);
        
        if (distance <= role.attackRange) {
            // 到达攻击范围，开始攻击
            this.mState = BattleState.ATTACK;
            this.mAttackTimer = 0;
        } else {
            // 继续移动
            role.moveToward(this.mTarget, dt);
            role.setAction(RoleAction.WALK);
        }
    }

    /**
     * 攻击状态
     */
    protected handleAttack(dt: number): void 
    {
        const role = this.roleParent;
        
        // 检查目标是否有效
        if (!this.mTarget || this.mTarget.isDead) {
            this.mState = BattleState.SEEK_TARGET;
            return;
        }

        // 面向目标
        role.faceTarget(this.mTarget);
        
        // 播放攻击动画
        if (this.mAttackTimer === 0) {
            role.setAction(RoleAction.SLASH);
        }
        
        this.mAttackTimer += dt;
        
        // 攻击动画中间造成伤害
        if (this.mAttackTimer >= this.mAttackDuration * 0.5 && this.mAttackTimer - dt < this.mAttackDuration * 0.5) {
            // 造成伤害
            BattleManager.Instance().processAttack(role, this.mTarget);
        }
        
        // 攻击动画结束
        if (this.mAttackTimer >= this.mAttackDuration) {
            this.mState = BattleState.COOLDOWN;
            this.mCooldownTimer = 0;
        }
    }

    /**
     * 冷却状态
     */
    protected handleCooldown(dt: number): void 
    {
        const role = this.roleParent;
        
        role.setAction(RoleAction.IDLE);
        this.mCooldownTimer += dt;
        
        if (this.mCooldownTimer >= role.attackCooldown) {
            // 冷却结束，重新寻找目标
            this.mState = BattleState.SEEK_TARGET;
        }
    }
}
