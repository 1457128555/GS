import type { Actor } from './Actor';

export abstract class Component 
{
    protected mParent : Actor | null = null;

    get parent(): Actor | null 
    {
        return this.mParent;
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
    }

    protected onAttach(): void {}
    protected onUpdate(dt: number): void {}
    protected onDetach(): void {}
}