import { Graphics, Container } from 'pixi.js';
import { Component } from '../core/Component';
import { RoleActor } from '../actor/RoleActor';

/**
 * 血条组件 - 显示角色血量
 */
export class HealthBarComp extends Component 
{
    protected mContainer: Container = new Container();
    protected mBackground: Graphics = new Graphics();
    protected mForeground: Graphics = new Graphics();
    
    protected mWidth: number = 40;
    protected mHeight: number = 6;
    protected mOffsetY: number = -50;  // 血条在角色上方的偏移
    
    protected mBackgroundColor: number = 0x333333;
    protected mForegroundColor: number = 0x00ff00;  // 默认绿色
    protected mLowHealthColor: number = 0xff6600;   // 橙色（低血量警告）

    private get roleParent(): RoleActor {
        return this.parent as RoleActor;
    }

    // HP 变化回调
    protected mHPHandler = (hp: number, maxHP: number) => this.updateHealthBar(hp, maxHP);

    override initFromData(properties: Record<string, any>): void 
    {
        super.initFromData(properties);

        if ('width' in properties)
            this.mWidth = properties.width;
        if ('height' in properties)
            this.mHeight = properties.height;
        if ('offsetY' in properties)
            this.mOffsetY = properties.offsetY;
        if ('color' in properties)
            this.mForegroundColor = properties.color;
    }

    protected override onAttach(): void 
    {
        // 创建血条容器
        this.mContainer.zIndex = 1000;  // 确保血条在最上层
        this.mContainer.y = this.mOffsetY;
        
        // 绘制背景
        this.mBackground.rect(-this.mWidth / 2, 0, this.mWidth, this.mHeight);
        this.mBackground.fill(this.mBackgroundColor);
        
        // 绘制前景（血量）
        this.updateHealthBar(this.roleParent.hp, this.roleParent.maxHP);
        
        this.mContainer.addChild(this.mBackground);
        this.mContainer.addChild(this.mForeground);
        this.parent?.container.addChild(this.mContainer);
        
        // 监听 HP 变化
        this.roleParent.addHPListener(this.mHPHandler);
    }

    protected override onDetach(): void 
    {
        this.roleParent.removeHPListener(this.mHPHandler);
        this.mContainer.removeFromParent();
        this.mContainer.destroy({ children: true });
    }

    /**
     * 更新血条显示
     */
    protected updateHealthBar(hp: number, maxHP: number): void 
    {
        const ratio = Math.max(0, hp / maxHP);
        const barWidth = this.mWidth * ratio;
        
        // 根据血量选择颜色
        const color = ratio > 0.3 ? this.mForegroundColor : this.mLowHealthColor;
        
        // 重绘前景
        this.mForeground.clear();
        if (barWidth > 0) {
            this.mForeground.rect(-this.mWidth / 2, 0, barWidth, this.mHeight);
            this.mForeground.fill(color);
        }
        
        // 死亡时隐藏血条
        if (hp <= 0) {
            this.mContainer.visible = false;
        }
    }
}
