const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '../public');
const OUTPUT_FILE = path.join(PUBLIC_DIR, 'ResourceCollect.json');
const EXCLUDE = ['ResourceCollect.json'];

const TEX_TYPE = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
const FILE_TYPE = ['.json'];

console.log('Start to collect resources...');

const collectResult = {
    textures: [],
    files: [],
};

function collectFunc(dir)
{
    const fullPath = path.join(PUBLIC_DIR, dir);
    for(const item of fs.readdirSync(fullPath))
    {
        if(item.startsWith('.'))    continue;
        if(EXCLUDE.includes(item))  continue;

        const itemRelPath = path.join(dir, item);
        const itemFullPath = path.join(PUBLIC_DIR, itemRelPath);
        const stat = fs.statSync(itemFullPath);

        if(stat.isDirectory())
            collectFunc(itemRelPath);
        else
        {
            const ext = path.extname(item).toLowerCase();

            if(TEX_TYPE.includes(ext))
                collectResult.textures.push('/' + itemRelPath.replace(/\\/g, '/'));
            else if(FILE_TYPE.includes(ext))
                collectResult.files.push('/' + itemRelPath.replace(/\\/g, '/'));       
        }
    }
}

collectFunc("");

// 写入文件
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(collectResult, null, 2), 'utf-8');

console.log('✅ ResourceCollect.json generated:');
console.log(collectResult);