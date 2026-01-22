import { Point } from 'pixi.js';
import { Component } from '../core/Component';
import { RoleActor, RoleAction, RoleDirection } from '../actor/RoleActor';
import { BattleManager } from '../manager/BattleManager';

/**
 * 战斗状态
 */
enum BattleState {
    IDLE,           // 待机
    SEEK_TARGET,    // 寻找目标
    MOVE_TO_TARGET, // 移动到战斗站位
    ATTACK,         // 攻击中
    COOLDOWN,       // 攻击冷却
}

/**
 * 战斗组件 - 处理角色的自动战斗 AI（战斗锁定系统）
 * 
 * 工作流程：
 * 1. 寻找最近的敌人
 * 2. 计算战斗站位点（在目标攻击范围内的固定位置）
 * 3. 移动到站位点
 * 4. 站定后开始攻击，不再移动
 * 5. 攻击冷却后继续攻击或重新寻找目标
 */
export class BattleComp extends Component 
{
    protected mState: BattleState = BattleState.IDLE;
    protected mTarget: RoleActor | null = null;
    protected mStandPosition: Point | null = null;  // 战斗站位点
    protected mLastTargetPos: Point | null = null;  // 上次目标位置（用于检测目标移动）
    
    protected mCooldownTimer: number = 0;
    protected mAttackTimer: number = 0;
    protected mAttackDuration: number = 0.5;  // 攻击动画持续时间
    
    // 站位相关参数
    protected mStandDistanceRatio: number = 0.7;  // 站位距离 = 攻击范围 * 此比例
    protected mStandThreshold: number = 5;        // 到达站位点的判定距离
    protected mTargetMoveThreshold: number = 30;  // 目标移动多少距离后重新计算站位

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
    protected handleIdle(_dt: number): void 
    {
        this.roleParent.setAction(RoleAction.IDLE);
        this.mState = BattleState.SEEK_TARGET;
    }

    /**
     * 寻找目标
     */
    protected handleSeekTarget(_dt: number): void 
    {
        const role = this.roleParent;
        
        // 寻找最近的敌人
        this.mTarget = BattleManager.Instance().getNearestEnemy(role);
        
        if (this.mTarget && !this.mTarget.isDead) {
            // 找到目标，计算战斗站位点
            this.mStandPosition = this.calculateStandPosition();
            this.mLastTargetPos = new Point(this.mTarget.position.x, this.mTarget.position.y);
            this.mState = BattleState.MOVE_TO_TARGET;
        } else {
            // 没有目标，待机
            role.setAction(RoleAction.IDLE);
            this.mTarget = null;
            this.mStandPosition = null;
            this.mLastTargetPos = null;
        }
    }

    /**
     * 移动到战斗站位
     */
    protected handleMoveToTarget(dt: number): void 
    {
        const role = this.roleParent;
        
        // 检查目标是否有效
        if (!this.mTarget || this.mTarget.isDead) {
            this.mState = BattleState.SEEK_TARGET;
            return;
        }

        // 检查站位点是否有效
        if (!this.mStandPosition) {
            this.mStandPosition = this.calculateStandPosition();
        }

        // 计算到站位点的距离
        const dx = this.mStandPosition.x - role.position.x;
        const dy = this.mStandPosition.y - role.position.y;
        const distToStand = Math.sqrt(dx * dx + dy * dy);
        
        // 同时检查与目标的实际距离（防止目标移动导致站位点失效）
        const distToTarget = role.distanceTo(this.mTarget);
        
        if (distToStand < this.mStandThreshold || distToTarget <= role.attackRange) {
            // 到达站位点或已在攻击范围内，开始攻击
            this.mState = BattleState.ATTACK;
            this.mAttackTimer = 0;
        } else {
            // 向站位点移动
            this.moveTowardPoint(this.mStandPosition, dt);
            role.setAction(RoleAction.WALK);
            
            // 如果目标移动了较大距离，重新计算站位点
            if (this.checkTargetMoved()) {
                this.mStandPosition = this.calculateStandPosition();
            }
        }
    }

    /**
     * 攻击状态 - 站定攻击，不移动
     */
    protected handleAttack(dt: number): void 
    {
        const role = this.roleParent;
        
        // 检查目标是否有效
        if (!this.mTarget || this.mTarget.isDead) {
            this.mState = BattleState.SEEK_TARGET;
            return;
        }

        // 检查是否还在攻击范围内（目标可能移动了）
        const distance = role.distanceTo(this.mTarget);
        if (distance > role.attackRange * 1.2) {
            // 目标跑远了，重新追击
            this.mStandPosition = this.calculateStandPosition();
            this.mState = BattleState.MOVE_TO_TARGET;
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
            BattleManager.Instance().processAttack(role, this.mTarget);
        }
        
        // 攻击动画结束
        if (this.mAttackTimer >= this.mAttackDuration) {
            this.mState = BattleState.COOLDOWN;
            this.mCooldownTimer = 0;
        }
    }

    /**
     * 冷却状态 - 站定等待，不移动
     */
    protected handleCooldown(dt: number): void 
    {
        const role = this.roleParent;
        
        role.setAction(RoleAction.IDLE);
        this.mCooldownTimer += dt;
        
        if (this.mCooldownTimer >= role.attackCooldown) {
            // 冷却结束，检查目标是否还在攻击范围
            if (this.mTarget && !this.mTarget.isDead) {
                const distance = role.distanceTo(this.mTarget);
                if (distance <= role.attackRange * 1.2) {
                    // 还在范围内，继续攻击
                    this.mState = BattleState.ATTACK;
                    this.mAttackTimer = 0;
                } else {
                    // 目标跑了，重新寻找
                    this.mState = BattleState.SEEK_TARGET;
                }
            } else {
                this.mState = BattleState.SEEK_TARGET;
            }
        }
    }

    /**
     * 计算战斗站位点
     * 站位点在目标周围，距离为攻击范围的一定比例
     */
    protected calculateStandPosition(): Point 
    {
        const role = this.roleParent;
        const target = this.mTarget!;
        
        // 方向：从目标指向自己
        const dx = role.position.x - target.position.x;
        const dy = role.position.y - target.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // 站位距离：攻击范围的 70%
        const standDist = role.attackRange * this.mStandDistanceRatio;
        
        if (dist > 1) {
            // 站位点在目标和自己的连线上
            return new Point(
                target.position.x + (dx / dist) * standDist,
                target.position.y + (dy / dist) * standDist
            );
        }
        
        // 如果几乎重叠，随机一个方向
        const angle = Math.random() * Math.PI * 2;
        return new Point(
            target.position.x + Math.cos(angle) * standDist,
            target.position.y + Math.sin(angle) * standDist
        );
    }

    /**
     * 向指定点移动
     */
    protected moveTowardPoint(point: Point, dt: number): void 
    {
        const role = this.roleParent;
        const dx = point.x - role.position.x;
        const dy = point.y - role.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            const moveX = (dx / dist) * role.speed * dt;
            const moveY = (dy / dist) * role.speed * dt;
            role.setPosition(role.position.x + moveX, role.position.y + moveY);
            
            // 更新朝向
            this.updateDirection(dx, dy);
        }
    }

    /**
     * 更新角色朝向
     */
    protected updateDirection(dx: number, dy: number): void 
    {
        const role = this.roleParent;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            role.setDirection(dx > 0 ? RoleDirection.RIGHT : RoleDirection.LEFT);
        } else {
            role.setDirection(dy > 0 ? RoleDirection.DOWN : RoleDirection.UP);
        }
    }

    /**
     * 检查目标是否移动了较大距离（需要重新计算站位）
     */
    protected checkTargetMoved(): boolean 
    {
        if (!this.mTarget || !this.mLastTargetPos) return false;
        
        const targetPos = this.mTarget.position;
        
        const dx = targetPos.x - this.mLastTargetPos.x;
        const dy = targetPos.y - this.mLastTargetPos.y;
        const moved = Math.sqrt(dx * dx + dy * dy);
        
        // 如果目标移动超过阈值，重新计算站位
        if (moved > this.mTargetMoveThreshold) {
            this.mLastTargetPos.set(targetPos.x, targetPos.y);
            return true;
        }
        
        return false;
    }
}
