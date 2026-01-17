import { Container, Point } from 'pixi.js';
import { Component } from './Component';

export class Actor 
{
    protected mName: string = "Actor"; 
    protected mPosition: Point = new Point(0, 0);
    
    protected mParent : Actor | null = null;
    protected mChildren : Set<Actor> = new Set();
    protected mComponents : Set<Component> = new Set();

    protected mContainer: Container = new Container();

    get container(): Container 
    {
        return this.mContainer;
    }

    get position(): Point 
    {
        return this.mPosition;
    }

    setPosition(x: number, y: number): void 
    {
        this.mPosition.set(x, y);
        this.mContainer.position.set(x, y);
    }

    _attach(parent: Actor): void 
    {
        if(this.mParent)
            this._detach();
        this.mParent = parent;
        parent.container.addChild(this.mContainer);
        this.onAttach();
    }

    _detach(): void 
    {
        if(this.mParent)
        {
            this.onDetach();
            this.mContainer.removeFromParent();
            this.mParent = null;
        }
    }

    _update(dt: number): void 
    {
        this.onUpdate(dt);
        for(const component of this.mComponents)
            component._update(dt);

        for(const child of this.mChildren)
            child._update(dt);
    }

    initFromData(properties: Record<string, any>): void 
    {
        if('name' in properties)
            this.mName = properties.name;
        if('position' in properties)
            this.setPosition(properties.position.x, properties.position.y);
    }

    protected onAttach(): void {}
    protected onDetach(): void {}
    protected onUpdate(dt: number): void {}

    addChild(child: Actor): void 
    {
        this.mChildren.add(child);
        child._attach(this);
    }

    removeChild(child: Actor): void 
    {
        this.mChildren.delete(child);
        child._detach();
    }

    addComponent(component: Component): void 
    {
        this.mComponents.add(component);
        component._attach(this);
    }

    removeComponent(component: Component): void 
    {
        this.mComponents.delete(component);
        component._detach();
    }
}