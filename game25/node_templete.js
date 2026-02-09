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

// 计算对比度颜色（在theme-color上更明显的颜色）
function calculateContrastColor(hexColor) {
    let r, g, b;
    
    if (hexColor.startsWith('#')) {
        hexColor = hexColor.slice(1);
    }
    
    if (hexColor.length === 3) {
        r = parseInt(hexColor[0] + hexColor[0], 16);
        g = parseInt(hexColor[1] + hexColor[1], 16);
        b = parseInt(hexColor[2] + hexColor[2], 16);
    } else if (hexColor.length === 6) {
        r = parseInt(hexColor.slice(0, 2), 16);
        g = parseInt(hexColor.slice(2, 4), 16);
        b = parseInt(hexColor.slice(4, 6), 16);
    } else {
        return '#000000';
    }
    
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    if (brightness > 128) {
        const contrastR = Math.max(0, r - 80);
        const contrastG = Math.max(0, g - 80);
        const contrastB = Math.max(0, b - 80);
        return `#${contrastR.toString(16).padStart(2, '0')}${contrastG.toString(16).padStart(2, '0')}${contrastB.toString(16).padStart(2, '0')}`;
    } else {
        const contrastR = Math.min(255, r + 80);
        const contrastG = Math.min(255, g + 80);
        const contrastB = Math.min(255, b + 80);
        return `#${contrastR.toString(16).padStart(2, '0')}${contrastG.toString(16).padStart(2, '0')}${contrastB.toString(16).padStart(2, '0')}`;
    }
}

// 更新CSS中的theme-color颜色
function updateCSSColor(color) {
    try {
        const cssPath = path.join(__dirname, 'public', 'style', 'inpublic.css');
        let cssContent = fs.readFileSync(cssPath, 'utf8');
        
        const textColor = calculateContrastColor(color);
        
        const themeRegex = /(--theme-color:\s*)([^;]+)/;
        const textRegex = /(--text-color:\s*)([^;]+)/;
        
        if (themeRegex.test(cssContent)) {
            cssContent = cssContent.replace(themeRegex, `$1${color}`);
            console.log(`  ✓ theme-color 已更新为: ${color}`);
        } else {
            if (cssContent.includes(':root')) {
                cssContent = cssContent.replace(
                    /(:root\s*\{[^}]*)/,
                    `$1\n    --theme-color: ${color};`
                );
            } else {
                cssContent = `:root {\n    --theme-color: ${color};\n}\n\n${cssContent}`;
            }
            console.log(`  ✓ theme-color 已添加: ${color}`);
        }
        
        if (textRegex.test(cssContent)) {
            cssContent = cssContent.replace(textRegex, `$1${textColor}`);
            console.log(`  ✓ text-color 已更新为: ${textColor}`);
        } else {
            if (cssContent.includes(':root')) {
                cssContent = cssContent.replace(
                    /(:root\s*\{[^}]*)/,
                    `$1\n    --text-color: ${textColor};`
                );
            } else {
                cssContent = `:root {\n    --text-color: ${textColor};\n}\n\n${cssContent}`;
            }
            console.log(`  ✓ text-color 已添加: ${textColor}`);
        }
        
        fs.writeFileSync(cssPath, cssContent, 'utf8');
        console.log(`✓ CSS颜色已更新: ${cssPath}`);
    } catch (error) {
        console.error('更新CSS颜色失败:', error.message);
        throw error;
    }
}

// 更新所有HTML文件中的域名
function updateDomainInHTML(domain) {
    try {
        // 提取主域名（去掉协议和路径）
        const displayDomain = domain.replace(/^https?:\/\//, '').split('/')[0];
        
        // 查找所有HTML文件
        const htmlFiles = [
            path.join(__dirname, 'index.html'),
            path.join(__dirname, 'detail.html'),
            path.join(__dirname, 'pages', 'about.html'),
            path.join(__dirname, 'pages', 'privacy.html'),
            path.join(__dirname, 'pages', 'terms.html'),
            path.join(__dirname, 'pages', 'category.html')
        ];
        
        let updatedCount = 0;
        
        htmlFiles.forEach(filePath => {
            if (fs.existsSync(filePath)) {
                let htmlContent = fs.readFileSync(filePath, 'utf8');
                let modified = false;
                
                // 1. 更新页面顶部logo中的域名
                // 匹配格式：<a ... class="logo">...<p>domain</p>...</a>
                const logoRegex = /(<a[^>]*class=["']logo["'][^>]*>)[\s\S]*?(<p>)[^<]+(<\/p>)[\s\S]*?(<\/a>)/gi;
                htmlContent = htmlContent.replace(logoRegex, (match, prefix1, prefix2, suffix1, suffix2) => {
                    modified = true;
                    return `${prefix1}${prefix2}${displayDomain}${suffix1}${suffix2}`;
                });
                
                // 2. 更新页面顶部header-center中的域名
                // 匹配格式：<div class="header-center">...<p>domain</p>...</div>
                const headerCenterRegex = /(<div[^>]*class=["']header-center["'][^>]*>)[\s\S]*?(<p>)[^<]+(<\/p>)[\s\S]*?(<\/div>)/gi;
                htmlContent = htmlContent.replace(headerCenterRegex, (match, prefix1, prefix2, suffix1, suffix2) => {
                    modified = true;
                    return `${prefix1}${prefix2}${displayDomain}${suffix1}${suffix2}`;
                });
                
                // 2. 更新 footer-copyright-text 中的域名（如果存在）
                if (htmlContent.includes('footer-copyright') || htmlContent.includes('footer')) {
                    // 匹配格式：© 2025 domain. All Rights Reserved.
                    // 匹配域名部分（包括可能的点，直到遇到空格和"All"）
                    const copyrightRegex = /(©\s*\d{4}\s+)[^\s]+(?=\s+All Rights Reserved\.)/g;
                    htmlContent = htmlContent.replace(copyrightRegex, (match, prefix) => {
                        modified = true;
                        return `${prefix}${displayDomain}.`;
                    });
                    
                    // 3. 更新 footer-brand 中的域名（如果存在）
                    // 匹配格式：<div class="footer-brand">domain</div>
                    const brandRegex = /(<div\s+class=["']footer-brand["']>)[^<]+(<\/div>)/g;
                    htmlContent = htmlContent.replace(brandRegex, (match, prefix, suffix) => {
                        modified = true;
                        return `${prefix}${displayDomain}${suffix}`;
                    });
                }
                
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

// 更新 BaseURL.js 中的第一行 BASE_URL 和 infoType
function updateBaseURL(info, json) {
    try {
        const baseURLPath = path.join(__dirname, 'public', 'js', 'BaseURL.js');
        let jsContent = fs.readFileSync(baseURLPath, 'utf8');
        let hasChanges = false;

        // 从现有的 BASE_URL 中提取基础 URL
        const baseURLMatch = jsContent.match(/export\s+const\s+BASE_URL\s*=\s*["']([^"']+)\.json["']/);
        let baseUrlPrefix = '';
        
        if (baseURLMatch) {
            // 提取完整的 URL，然后移除最后的文件名部分
            const fullUrl = baseURLMatch[1];
            baseUrlPrefix = fullUrl.substring(0, fullUrl.lastIndexOf('/') + 1);
            console.log(`  检测到基础 URL: ${baseUrlPrefix}`);
        }

        // 根据 info 值修改 infoType
        const infoTypeRegex = /(return\s*['"])info(\d+)(['"]\s*;)/g;
        if (infoTypeRegex.test(jsContent)) {
            jsContent = jsContent.replace(infoTypeRegex, `$1info${info}$3`);
            hasChanges = true;
            console.log(`  ✓ infoType 已更新为: info${info}`);
        }

        // 只修改第一行的 BASE_URL
        const lines = jsContent.split('\n');
        if (lines.length > 0) {
            const firstLine = lines[0];
            const baseURLRegex = /export\s+const\s+BASE_URL\s*=\s*["']https?:\/\/[^"']+\.json["']/;
            if (baseURLRegex.test(firstLine)) {
                lines[0] = firstLine.replace(baseURLRegex, `export const BASE_URL = "${baseUrlPrefix}db${json}.json"`);
                jsContent = lines.join('\n');
                hasChanges = true;
                console.log(`  ✓ BASE_URL 已更新为: ${baseUrlPrefix}db${json}.json`);
            }
        }

        if (hasChanges) {
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
        
        // 2. 更新CSS颜色
        updateCSSColor(config.color);
        console.log('');
        
        // 3. 更新HTML域名
        updateDomainInHTML(config.domain);
         console.log('');
        updateBaseURL(config.info, config.json);
        console.log('');
        
        console.log('✓ 所有更新完成！');
        
        // 检查是否在批量处理模式下执行
        const args = process.argv.slice(2);
        const isBatchMode = args.includes('--batch');
        
        // 只有在非批量处理模式下才递增config.json中的info和json值
        if (!isBatchMode) {
            incrementConfigValues();
        }
        
    } catch (error) {
        console.error('\n✗ 执行失败:', error.message);
        process.exit(1);
    }
}

// 递增config.json中的info和json值
function incrementConfigValues() {
    try {
        const configPath = path.join(__dirname, 'config.json');
        const configContent = fs.readFileSync(configPath, 'utf8');
        const config = JSON.parse(configContent);
        
        if (config.info) config.info = (parseInt(config.info) + 1).toString();
        if (config.json) config.json = (parseInt(config.json) + 1).toString();
        
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
        console.log(`✓ 已递增config.json中的info和json值: info: ${config.info}, json: ${config.json}`);
    } catch (error) {
        console.error('更新config.json失败:', error.message);
        throw error;
    }
}

// 运行主函数
main();

