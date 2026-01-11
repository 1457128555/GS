import { Assets, Texture } from 'pixi.js';

export class AssetManager 
{
    private static sInstance = new AssetManager;

    private mTexResMap: Map<string, Texture> = new Map();

    static Instance()
    {
        return this.sInstance;
    }

    async load(src: Set<string>, onProgress?: (progress: number) => void): Promise<void> 
    {
        const paths = [...src];
        const total = paths.length;
        let loaded = 0;

        for (const path of paths) 
        {
            try 
            {
                const texture = await Assets.load(path);
                this.mTexResMap.set(path, texture); 
                loaded++;
                onProgress?.(loaded / total);
            }
            catch (error) 
            {
                console.error(`[AssetManager] ❌ Failed to load: ${path}`);
                console.error(error);
                throw new Error(`Failed to load asset: ${path}`);
            }
        }
    }
    
    unload(): void
    {
        for (const [path, texture] of this.mTexResMap.entries())
        {
            texture.destroy();
            Assets.unload(path); 
        }
        this.mTexResMap.clear();
    }

    getTexture(path: string): Texture 
    {
        const texture = this.mTexResMap.get(path);
        if (!texture) 
            throw new Error(`Texture "${path}" not loaded!`);
        return texture;
    }
}