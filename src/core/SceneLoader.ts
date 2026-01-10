import { Actor } from './Actor';
import { Component } from './Component';
import { TypeRegistry } from './TypeRegistry';
import { AssetManager } from './AssetManager';

/**
 * 场景节点数据结构
 */
export interface SceneNodeData 
{
    name?: string;
    type: string;
    properties?: Record<string, any>;
    components?: ComponentData[];
    children?: SceneNodeData[];
}

/**
 * 组件数据结构
 */
export interface ComponentData 
{
    type: string;
    properties?: Record<string, any>;
}

/**
 * 场景加载器 - 从JSON加载场景树
 */

export class SceneLoader 
{
    /**
     * 从JSON文件路径加载场景
     */
    static async loadFromFile(jsonPath: string): Promise<Actor> 
    {
        // 开发时添加时间戳，防止缓存
        const url = `${jsonPath}?t=${Date.now()}`;
        const response = await fetch(url);

        //const response = await fetch(jsonPath);
        if (!response.ok) 
            throw new Error(`Failed to load scene file: ${jsonPath}`);
        
        const data: SceneNodeData = await response.json();
        
        // 1. 先收集所有资源依赖
        const assets = this.collectAssets(data);
        
        // 2. 预加载资源
        if (assets.size > 0) 
        {
            console.log('Preloading assets:', [...assets]);
            await AssetManager.Instance().load(assets);
        }
        
        // 3. 构建场景树
        return this.parseNode(data);
    }
    
    /**
     * 从JSON对象直接加载场景
     */
    static loadFromData(data: SceneNodeData): Actor 
    {
        return this.parseNode(data);
    }

    /**
     * 收集场景中所有资源路径
     */
    static collectAssets(data: SceneNodeData): Set<string> 
    {
        const assets = new Set<string>();
        
        const traverse = (node: SceneNodeData) => 
        {
            // 从组件属性中收集资源路径
            node.components?.forEach(comp => 
            {
                // 收集常见的资源属性名
                const resourceKeys = ['path', 'texture', 'image', 'src', 'sprite'];
                for (const key of resourceKeys) 
                {
                    if (comp.properties?.[key] && typeof comp.properties[key] === 'string') 
                        assets.add(comp.properties[key]);
                }
            });
            
            // 递归处理子节点
            node.children?.forEach(traverse);
        };
        
        traverse(data);
        return assets;
    }

    /**
     * 解析节点（递归）
     */
    private static parseNode(data: SceneNodeData): Actor 
    {
        // 创建Actor实例
        const actor = TypeRegistry.createActor(data.type);
        
        // 应用属性
        if (data.properties) 
            actor.initFromData(data.properties);
        
        // 添加组件
        if (data.components) 
        {
            for (const compData of data.components) 
            {
                const component = this.parseComponent(compData);
                actor.addComponent(component);
            }
        }
        
        // 递归添加子节点
        if (data.children) 
        {
            for (const childData of data.children) 
            {
                const child = this.parseNode(childData);
                actor.addChild(child);
            }
        }
        
        return actor;
    }

    /**
     * 解析组件
     */
    private static parseComponent(data: ComponentData): Component 
    {
        const component = TypeRegistry.createComponent(data.type);
        
        if (data.properties) 
            component.initFromData(data.properties);
        
        return component;
    }
}

