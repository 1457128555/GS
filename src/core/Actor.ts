import { Container } from 'pixi.js';
import { Component } from './Component';

export abstract class Actor 
{
    protected mParent : Actor | null = null;
    protected mChildren : Set<Actor> = new Set();
    protected mComponents : Set<Component> = new Set();

    protected mContainer: Container = new Container();

    get container(): Container 
    {
        return this.mContainer;
    }

    _attach(parent: Actor): void 
    {
        if(this.mParent)
            this._detach();
        this.mParent = parent;
        this.onAttach();
    }

    _detach(): void 
    {
        if(this.mParent)
        {
            this.onDetach();
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