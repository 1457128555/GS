import type { Actor } from './Actor';
import type { Component } from './Component';

type ActorConstructor = new () => Actor;
type ComponentConstructor = new () => Component;

/**
 * 类型注册表 - 管理所有可序列化的Actor和Component类型
 */

export class TypeRegistry 
{
    private static sActorTypes = new Map<string, ActorConstructor>();
    private static sComponentTypes = new Map<string, ComponentConstructor>();

    /**
     * 注册Actor类型
     */
    static registerActor(type: string, ctor: ActorConstructor): void 
    {
        if (this.sActorTypes.has(type)) 
            console.warn(`Actor type "${type}" is already registered, overwriting...`);
        
        this.sActorTypes.set(type, ctor);
    }

    /**
     * 注册Component类型
     */
    static registerComponent(type: string, ctor: ComponentConstructor): void 
    {
        if (this.sComponentTypes.has(type)) 
            console.warn(`Component type "${type}" is already registered, overwriting...`);
        
        this.sComponentTypes.set(type, ctor);
    }
    
    /**
     * 创建Actor实例
     */
    static createActor(type: string): Actor 
    {
        const ctor = this.sActorTypes.get(type);
        if (!ctor) 
            throw new Error(`Unknown actor type: "${type}". Did you forget to register it?`);
        
        return new ctor();
    }

    /**
     * 创建Component实例
     */
    static createComponent(type: string): Component 
    {
        const ctor = this.sComponentTypes.get(type);
        if (!ctor) 
            throw new Error(`Unknown component type: "${type}". Did you forget to register it?`);
        
        return new ctor();
    }

    /**
     * 检查Actor类型是否已注册
     */
    static hasActor(type: string): boolean 
    {
        return this.sActorTypes.has(type);
    }
    
    /**
     * 检查Component类型是否已注册
     */
    static hasComponent(type: string): boolean 
    {
        return this.sComponentTypes.has(type);
    }
}