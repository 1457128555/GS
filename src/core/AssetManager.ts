import { Assets, Texture } from 'pixi.js';

export interface ResourceManifest {
    textures?: string[];    // 纹理路径数组，可选
    files?: string[];       // JSON文件路径数组，可选
}

// 资源管理器类
export class AssetManager 
{
    private static sInstance = new AssetManager;

    private mFileResMap: Map<string, any> = new Map();
    private mTexResMap: Map<string, Texture> = new Map();

    // 存储资源清单数据
    private mManifest: ResourceManifest | null = null;

    static Instance() { return this.sInstance; };

    /**
     * 加载所有资源（读取 ResourceCollect.json 并加载里面所有内容）
     */
    async load(onProgress?: (progress: number, message: string) => void): Promise<void>
    {
        // ========== 第一步：加载资源清单文件 ==========
        onProgress?.(0, 'Loading ResourceCollect.json...');

        // 加上时间戳防止浏览器缓存
        const manifestUrl = `/ResourceCollect.json?t=${Date.now()}`;

        // fetch 是浏览器原生的网络请求函数
        // await 表示等待请求完成
        const response = await fetch(manifestUrl);
        if (!response.ok) 
            throw new Error('Failed to load ResourceCollect.json');

        // 把响应体解析为 JSON 对象，存到 mManifest
        this.mManifest = await response.json();

        const textures = this.mManifest?.textures || [];
        const files = this.mManifest?.files || [];

        console.log('[AssetManager] 📋 Manifest loaded:');
        console.log(`  Textures: ${textures.length}`);
        console.log(`  Files: ${files.length}`);
        
        const total = textures.length + files.length;
        let loaded = 0;

        // ========== 第二步：加载所有纹理 ==========
        for (const path of textures) {
            try {
                const texture = await Assets.load(path);
                this.mTexResMap.set(path, texture);
                loaded++;
                onProgress?.(loaded / total, `Texture: ${path}`);
            }catch (error) {
                console.error(`[AssetManager] ❌ Failed to load texture: ${path}`, error);
                throw new Error(`Failed to load texture: ${path}`);
            }
        }

        // ========== 第三步：加载所有 JSON 文件 ==========
        for (const path of files) {
            try {
                const fileUrl = `${path}?t=${Date.now()}`;
                const resp = await fetch(fileUrl);
                if (!resp.ok) 
                    throw new Error(`HTTP ${resp.status}`);

                const data = await resp.json();
                this.mFileResMap.set(path, data);

                loaded++;
                onProgress?.(loaded / total, `File: ${path}`);
            } catch (error) {
                // 加载失败，打印错误
                console.error(`[AssetManager] ❌ Failed to load file: ${path}`, error);
                throw new Error(`Failed to load file: ${path}`);
            }
        }

        // 打印完成日志
        console.log('[AssetManager] ✅ All assets loaded!');
        console.log(`  Textures: ${this.mTexResMap.size}`);
        console.log(`  Files: ${this.mFileResMap.size}`);
    }

    unload(): void
    {
        for (const [path, texture] of this.mTexResMap.entries())
        {
            texture.destroy();      // 销毁纹理对象
            Assets.unload(path);    // 从 PixiJS 缓存中移除
        }

        this.mTexResMap.clear();    // 清空纹理 Map
        this.mFileResMap.clear();   // 清空文件 Map
        this.mManifest = null;      // 清空清单
    }

    // 根据路径获取纹理
    getTexture(path: string): Texture 
    {
        const texture = this.mTexResMap.get(path);
        if (!texture) 
            throw new Error(`Texture "${path}" not loaded!`);
        return texture;
    }

    getFile(path: string): any
    {
        const data = this.mFileResMap.get(path);
        if (!data)
            throw new Error(`File "${path}" not loaded!`);
        return JSON.parse(JSON.stringify(data));
    }

    hasTexture(path: string): boolean {
        return this.mTexResMap.has(path);  
    }

    hasFile(path: string): boolean {
        return this.mFileResMap.has(path);
    }
}