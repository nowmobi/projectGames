const fs = require('fs');
const path = require('path');

// 读取配置文件
function readConfig() {
    try {
        const configPath = path.join(__dirname, 'config.json');
        const configContent = fs.readFileSync(configPath, 'utf8');
        const config = JSON.parse(configContent);
        
        if (!config.color || !config.domain) {
            throw new Error('配置文件中缺少 color 或 domain 字段');
        }
        
        return config;
    } catch (error) {
        console.error('读取配置文件失败:', error.message);
        process.exit(1);
    }
}

// 更新CSS中的primary颜色
function updateCSSColor(color) {
    try {
        const cssPath = path.join(__dirname, 'public', 'style', 'inpublic.css');
        let cssContent = fs.readFileSync(cssPath, 'utf8');
        
        // 使用正则表达式替换 --primary 的值
        const regex = /(--primary:\s*)([^;]+)/;
        const newValue = `$1${color}`;
        
        if (regex.test(cssContent)) {
            cssContent = cssContent.replace(regex, newValue);
            fs.writeFileSync(cssPath, cssContent, 'utf8');
            console.log(`✓ CSS颜色已更新: ${cssPath}`);
        } else {
            // 如果没有找到，在:root中添加
            if (cssContent.includes(':root')) {
                cssContent = cssContent.replace(
                    /(:root\s*\{[^}]*)/,
                    `$1\n    --primary: ${color};`
                );
            } else {
                cssContent = `:root {\n    --primary: ${color};\n}\n\n${cssContent}`;
            }
            fs.writeFileSync(cssPath, cssContent, 'utf8');
            console.log(`✓ CSS颜色已添加: ${cssPath}`);
        }
    } catch (error) {
        console.error('更新CSS颜色失败:', error.message);
        throw error;
    }
}

// 更新所有HTML文件中的域名
function updateDomainInHTML(domain) {
    try {
        // 处理域名：去掉协议和路径，只保留主域名
        //const displayDomain = domain.replace(/^https?:\/\//, '').split('/')[0];
        const displayDomain = domain.replace(/^https?:\/\//, '').split('/')[0].replace(/\s+/g, '');
        
        // 查找所有HTML文件
        const htmlFiles = [
            path.join(__dirname, 'index.html'),
            path.join(__dirname, 'productDetails.html'),
            path.join(__dirname, 'pages', 'privacy.html'),
            path.join(__dirname, 'pages', 'terms.html'),
            path.join(__dirname, 'pages', 'category.html')
        ];
        
        let updatedCount = 0;
        
        htmlFiles.forEach(filePath => {
            if (fs.existsSync(filePath)) {
                let htmlContent = fs.readFileSync(filePath, 'utf8');
            let modified = false;
            
            // 1. 更新header中的logo域名
            const logoRegex = /(<a\s+[^>]*class="logo"[^>]*>\s*<p>)([^<]+)(<\/p>\s*<\/a>)/g;
            htmlContent = htmlContent.replace(logoRegex, (match, openTag, oldDomain, closeTag) => {
                modified = true;
                return `${openTag}${displayDomain}${closeTag}`;
            });
            
            // 2. 更新footer-brand域名
            const brandRegex = /(<div class="footer-brand">)([^<]+)(<\/div>)/g;
            htmlContent = htmlContent.replace(brandRegex, (match, openTag, oldDomain, closeTag) => {
                modified = true;
                return `${openTag}${displayDomain}${closeTag}`;
            });
            
            // 3. 更新版权信息中的域名
            const copyrightRegex = /(©\s*\d{4}\s+)([\w\.]+?)(\s+All\s+Rights\s+Reserved\.)/gi;
            htmlContent = htmlContent.replace(copyrightRegex, (match, prefix, oldDomain, suffix) => {
                modified = true;
                const cleanPrefix = prefix.replace(/\s+/g, ' ').trim() + ' ';
                return `${cleanPrefix}${displayDomain}${suffix}`;
            });
            
            if (modified) {
                fs.writeFileSync(filePath, htmlContent, 'utf8');
                updatedCount++;
                console.log(`✓ 已更新: ${path.relative(__dirname, filePath)}`);
            } else {
                console.log(`○ 未找到域名（已是最新）: ${path.relative(__dirname, filePath)}`);
            }
            } else {
                console.log(`○ 文件不存在: ${path.relative(__dirname, filePath)}`);
            }
        });
        
        console.log(`✓ 共更新 ${updatedCount} 个HTML文件中的域名`);
        
    } catch (error) {
        console.error('更新HTML域名失败:', error.message);
        throw error;
    }
}

// 更新 BaseURL.js 中的 infoType 和 BASE_URL
function updateBaseURL(info, json) {
    try {
        const baseURLPath = path.join(__dirname, 'public', 'js', 'BaseURL.js');
        let jsContent = fs.readFileSync(baseURLPath, 'utf8');
        const lines = jsContent.split('\n');
        let hasChanges = false;

        // 根据 info 值修改 infoType
        const infoTypeRegex = /const\s+infoType\s*=\s*['"]info\d+['"]/;
        if (infoTypeRegex.test(jsContent)) {
            jsContent = jsContent.replace(infoTypeRegex, `const infoType = 'info${info}'`);
            hasChanges = true;
            console.log(`  ✓ infoType 已更新为: info${info}`);
        }

        // 只修改第1行（索引0）的 BASE_URL 中的 json 数字
        if (lines.length > 0) {
            const firstLine = lines[0];
            // 匹配 db数字.json 并替换为 db{json}.json
            const dbNumberRegex = /db\d+\.json/;
            if (dbNumberRegex.test(firstLine)) {
                lines[0] = firstLine.replace(dbNumberRegex, `db${json}.json`);
                hasChanges = true;
                console.log(`  ✓ 第1行 BASE_URL 已更新为: db${json}.json`);
            }
        }

        if (hasChanges) {
            // 如果修改了第1行，重新组合内容
            if (lines[0] !== jsContent.split('\n')[0]) {
                jsContent = lines.join('\n');
            }
            fs.writeFileSync(baseURLPath, jsContent, 'utf8');
            console.log(`✓ BaseURL.js 已更新: ${baseURLPath}`);
        } else {
            console.log(`○ BaseURL.js 无需更新`);
        }

        return hasChanges;
    } catch (error) {
        console.error('更新 BaseURL.js 失败:', error.message);
        throw error;
    }
}
// 主函数
async function main() {
    console.log('开始执行主题配置更新...\n');
    
    try {
        // 1. 读取配置
        const config = readConfig();
        console.log('读取配置:');
        console.log(`  颜色: ${config.color}`);
         console.log(`  域名: ${config.domain}`);
        console.log(`  info: ${config.info}`);
        console.log(`  json: ${config.json}\n`);
        
        // 3. 更新CSS颜色
        updateCSSColor(config.color);
        console.log('');
        
        // 4. 更新HTML域名
        updateDomainInHTML(config.domain);
         console.log('');
        updateBaseURL(config.info, config.json);
        console.log('');
        
        console.log('✓ 所有更新完成！');
        
    } catch (error) {
        console.error('\n✗ 执行失败:', error.message);
        process.exit(1);
    }
}

// 运行主函数
main();


