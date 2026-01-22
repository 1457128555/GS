import { RoleActor, RoleFaction, RoleAction } from '../actor/RoleActor';

/**
 * 战斗管理器 - 管理战斗逻辑和阵营
 */
export class BattleManager 
{
    private static sInstance: BattleManager;
    
    // 所有参与战斗的角色
    private mHeroes: Set<RoleActor> = new Set();
    private mEnemies: Set<RoleActor> = new Set();

    // 碰撞参数
    private mCollisionRadius: number = 25;      // 角色碰撞半径
    private mSeparationStrength: number = 150;  // 分离力强度

    static Instance(): BattleManager 
    {
        if (!this.sInstance)
            this.sInstance = new BattleManager();
        return this.sInstance;
    }

    /**
     * 注册角色到战斗系统
     */
    registerRole(role: RoleActor): void 
    {
        if (role.faction === RoleFaction.HERO) {
            this.mHeroes.add(role);
        } else {
            this.mEnemies.add(role);
        }

        // 监听死亡事件
        role.addDeathListener(this.onRoleDeath);
    }

    /**
     * 取消注册角色
     */
    unregisterRole(role: RoleActor): void 
    {
        role.removeDeathListener(this.onRoleDeath);
        this.mHeroes.delete(role);
        this.mEnemies.delete(role);
    }

    /**
     * 每帧更新 - 处理碰撞分离
     */
    update(dt: number): void 
    {
        this.processSeparation(dt);
    }

    /**
     * 处理角色之间的分离（防止重叠）
     * 所有角色之间都会进行碰撞分离
     */
    private processSeparation(dt: number): void 
    {
        const separationRadius = this.mCollisionRadius * 2;  // 分离检测半径

        // 获取所有存活角色
        const allRoles = this.getAllAliveRoles();
        
        // 处理所有角色之间的碰撞分离
        this.processAllRolesSeparation(allRoles, separationRadius, dt);
    }

    /**
     * 处理所有角色之间的分离
     */
    private processAllRolesSeparation(roles: RoleActor[], separationRadius: number, dt: number): void 
    {
        for (const role of roles) {
            if (role.isDead) continue;
            
            // 攻击/受伤状态不参与分离，让角色站定对砍
            const action = role.state.action;
            if (action === RoleAction.SLASH || 
                action === RoleAction.BACK_SLASH ||
                action === RoleAction.HURT) {
                continue;
            }

            let separationX = 0;
            let separationY = 0;
            let neighborCount = 0;

            // 检查与所有其他角色的碰撞
            for (const other of roles) {
                if (other === role || other.isDead) continue;

                const dx = role.position.x - other.position.x;
                const dy = role.position.y - other.position.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // 如果太近，计算分离力
                if (dist < separationRadius && dist > 0) {
                    // 分离力与距离成反比（越近越强）
                    const strength = (separationRadius - dist) / separationRadius;
                    separationX += (dx / dist) * strength;
                    separationY += (dy / dist) * strength;
                    neighborCount++;
                }
            }

            // 应用分离力
            if (neighborCount > 0) {
                // 平均化
                separationX /= neighborCount;
                separationY /= neighborCount;

                // 归一化并应用强度
                const len = Math.sqrt(separationX * separationX + separationY * separationY);
                if (len > 0) {
                    separationX = (separationX / len) * this.mSeparationStrength * dt;
                    separationY = (separationY / len) * this.mSeparationStrength * dt;

                    // 移动角色
                    role.applyForce(separationX, separationY);
                }
            }
        }
    }

    /**
     * 获取所有存活的角色
     */
    getAllAliveRoles(): RoleActor[] 
    {
        const heroes = Array.from(this.mHeroes).filter(h => !h.isDead);
        const enemies = Array.from(this.mEnemies).filter(e => !e.isDead);
        return [...heroes, ...enemies];
    }

    /**
     * 获取敌对阵营的角色列表
     */
    getEnemiesOf(role: RoleActor): RoleActor[] 
    {
        if (role.faction === RoleFaction.HERO) {
            return Array.from(this.mEnemies).filter(e => !e.isDead);
        } else {
            return Array.from(this.mHeroes).filter(e => !e.isDead);
        }
    }

    /**
     * 获取最近的敌人
     */
    getNearestEnemy(role: RoleActor): RoleActor | null 
    {
        const enemies = this.getEnemiesOf(role);
        if (enemies.length === 0) return null;

        let nearest: RoleActor | null = null;
        let minDist = Infinity;

        for (const enemy of enemies) {
            const dist = role.distanceTo(enemy);
            if (dist < minDist) {
                minDist = dist;
                nearest = enemy;
            }
        }

        return nearest;
    }

    /**
     * 处理攻击
     */
    processAttack(attacker: RoleActor, target: RoleActor): void 
    {
        if (target.isDead) return;

        const damage = attacker.atk;
        target.takeDamage(damage, attacker);

        console.log(`[Battle] ${attacker.faction} attacks! Damage: ${damage}, Target HP: ${target.hp}/${target.maxHP}`);
    }

    /**
     * 角色死亡回调
     */
    private onRoleDeath = (role: RoleActor): void => 
    {
        console.log(`[Battle] ${role.faction} died!`);
        
        // 延迟移除，让死亡动画播放完
        setTimeout(() => {
            // 从战斗系统注销
            this.unregisterRole(role);
            
            // 从场景中移除（Actor 树中移除）
            role._detach();
            
            console.log(`[Battle] ${role.faction} removed from scene`);
        }, 1000);
    }

    /**
     * 获取英雄数量
     */
    getHeroCount(): number 
    {
        return Array.from(this.mHeroes).filter(h => !h.isDead).length;
    }

    /**
     * 获取敌人数量
     */
    getEnemyCount(): number 
    {
        return Array.from(this.mEnemies).filter(e => !e.isDead).length;
    }

    /**
     * 检查战斗是否结束
     */
    isBattleOver(): boolean 
    {
        return this.getHeroCount() === 0 || this.getEnemyCount() === 0;
    }

    /**
     * 清理
     */
    clear(): void 
    {
        for (const role of this.mHeroes) {
            role.removeDeathListener(this.onRoleDeath);
        }
        for (const role of this.mEnemies) {
            role.removeDeathListener(this.onRoleDeath);
        }
        this.mHeroes.clear();
        this.mEnemies.clear();
    }
}
