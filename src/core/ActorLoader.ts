import { Actor } from './Actor';
import { Component } from './Component';
import { TypeRegistry } from './TypeRegistry';
import { AssetManager } from './AssetManager';

// Actor 数据结构（JSON 文件的格式）
export interface ActorData {
    type: string;                           // Actor 类型名称，如 "Scene", "PlayerActor"
    properties?: Record<string, any>;       // Actor 的属性
    components?: ComponentData[];           // 组件列表
    children?: ActorTemplateData[];         // 子 Actor
}

export interface ActorTemplateData {
    path: string;                           // 子 Actor 文件路径
    override?: Record<string, any>;         // 覆盖父 Actor 的属性
}

// 组件数据结构
export interface ComponentData {
    type: string;                           // 组件类型名称
    properties?: Record<string, any>;       // 组件的属性
}

/**
 * Actor 加载器 - 把 JSON 数据转换成 Actor 对象
 */
export class ActorLoader 
{
    static loadFromTemplate(data: ActorTemplateData): Actor 
    {
        const actorData = AssetManager.Instance().getFile(data.path) as ActorData;
        const actor =  this.loadFromActorData(actorData);
        if(data.override)
            actor.initFromData(data.override);
        return actor;
    }

    static loadFromActorData(data: ActorData): Actor 
    {
        return this.parseActorData(data);
    }

    /**
     * 解析 Actor 数据，递归创建 Actor 树
     */
    private static parseActorData(data: ActorData): Actor 
    {
        // ========== 1. 创建 Actor 实例 ==========
        const actor = TypeRegistry.createActor(data.type);

        // ========== 2. 初始化 Actor 属性 ==========
        if (data.properties)
            actor.initFromData(data.properties);

        // ========== 3. 添加组件 ==========
        if (data.components) {
            for (const compData of data.components) {
                // 解析组件数据，创建组件实例
                const component = this.parseComponentData(compData);
                // 把组件添加到 Actor
                actor.addComponent(component);
            }
        }

        // ========== 4. 递归添加子 Actor ==========
        if (data.children) {
            for (const childData of data.children) {
                // 递归调用，创建子 Actor
                const child = this.loadFromTemplate(childData);
                // 把子 Actor 添加到父 Actor
                actor.addChild(child);
            }
        }

        return actor;
    }

    /**
     * 解析组件数据，创建组件实例
     */
    private static parseComponentData(data: ComponentData): Component 
    {
        // TypeRegistry 根据类型名称创建对应的组件
        const component = TypeRegistry.createComponent(data.type);

        // 初始化组件属性
        if (data.properties) 
            component.initFromData(data.properties);

        return component;
    }
}