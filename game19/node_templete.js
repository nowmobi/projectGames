const fs = require('fs');
const path = require('path');

// 计算颜色亮度并返回最佳对比度的文字颜色
function getRelativeLuminance(r, g, b) {
    const a = [r, g, b].map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getContrastRatio(l1, l2) {
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
}

function getContrastColor(hexColor) {
    let r, g, b;
    
    if (hexColor.startsWith('#')) {
        hexColor = hexColor.slice(1);
    }
    
    if (hexColor.length === 3) {
        r = parseInt(hexColor[0] + hexColor[0], 16);
        g = parseInt(hexColor[1] + hexColor[1], 16);
        b = parseInt(hexColor[2] + hexColor[2], 16);
    } else if (hexColor.length === 6) {
        r = parseInt(hexColor.substring(0, 2), 16);
        g = parseInt(hexColor.substring(2, 4), 16);
        b = parseInt(hexColor.substring(4, 6), 16);
    } else {
        return '#000000';
    }
    
    const bgLuminance = getRelativeLuminance(r, g, b);
    const whiteLuminance = 1.0;
    const blackLuminance = 0.0;
    
    const contrastWithWhite = getContrastRatio(bgLuminance, whiteLuminance);
    const contrastWithBlack = getContrastRatio(bgLuminance, blackLuminance);
    
    return contrastWithWhite > contrastWithBlack ? '#FFFFFF' : '#000000';
}

// 读取配置文件
function readConfig() {
    try {
        const configPath = path.join(__dirname, 'config.json');
        const configContent = fs.readFileSync(configPath, 'utf8');
        const config = JSON.parse(configContent);
        
        if (!config.color1 || !config.color2 || !config.domain) {
            throw new Error('配置文件中缺少 color1, color2 或 domain 字段');
        }
        
        return config;
    } catch (error) {
        console.error('读取配置文件失败:', error.message);
        process.exit(1);
    }
}

// 更新或添加CSS变量
function updateCSSVar(cssContent, varName, value, insertAfter = null) {
    const regex = new RegExp(`(${varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:\\s*)([^;]+)(;)`);
    if (regex.test(cssContent)) {
        return cssContent.replace(regex, `$1${value}$3`);
    } else if (insertAfter) {
        const insertRegex = new RegExp(`(${insertAfter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:\\s*[^;]+;)`);
        return cssContent.replace(insertRegex, `$1\n    ${varName}: ${value};`);
    }
    return cssContent;
}

// 更新CSS中的color1和color2颜色
function updateCSSColor(color1, color2) {
    try {
        const cssPath = path.join(__dirname, 'public', 'style', 'inpublic.css');
        let cssContent = fs.readFileSync(cssPath, 'utf8');
        
        // 计算对比度颜色
        const textColor1 = getContrastColor(color1);
        const textColor2 = getContrastColor(color2);
        
        // 更新color1
        const color1Regex = /(:root\s*\{[\s\S]*?)(--color1\s*:\s*)([^;]+)(;)/;
        if (!color1Regex.test(cssContent)) {
            cssContent = cssContent.includes(':root') 
                ? cssContent.replace(/(:root\s*\{)/, `$1\n    --color1: ${color1};`)
                : `:root {\n    --color1: ${color1};\n}\n\n${cssContent}`;
        } else {
            cssContent = cssContent.replace(color1Regex, `$1$2${color1}$4`);
        }
        
        // 更新color2
        const color2Regex = /(:root\s*\{[\s\S]*?)(--color2\s*:\s*)([^;]+)(;)/;
        if (!color2Regex.test(cssContent)) {
            cssContent = cssContent.includes(':root') 
                ? cssContent.replace(/(:root\s*\{)/, `$1\n    --color2: ${color2};`)
                : `:root {\n    --color2: ${color2};\n}\n\n${cssContent}`;
        } else {
            cssContent = cssContent.replace(color2Regex, `$1$2${color2}$4`);
        }
        
        // 更新text-color1
        const textColor1Regex = /(:root\s*\{[\s\S]*?)(--text-color1\s*:\s*)([^;]+)(;)/;
        if (!textColor1Regex.test(cssContent)) {
            cssContent = cssContent.includes(':root') 
                ? cssContent.replace(/(:root\s*\{)/, `$1\n    --text-color1: ${textColor1};`)
                : `:root {\n    --text-color1: ${textColor1};\n}\n\n${cssContent}`;
        } else {
            cssContent = cssContent.replace(textColor1Regex, `$1$2${textColor1}$4`);
        }
        
        // 更新text-color2
        const textColor2Regex = /(:root\s*\{[\s\S]*?)(--text-color2\s*:\s*)([^;]+)(;)/;
        if (!textColor2Regex.test(cssContent)) {
            cssContent = cssContent.includes(':root') 
                ? cssContent.replace(/(:root\s*\{)/, `$1\n    --text-color2: ${textColor2};`)
                : `:root {\n    --text-color2: ${textColor2};\n}\n\n${cssContent}`;
        } else {
            cssContent = cssContent.replace(textColor2Regex, `$1$2${textColor2}$4`);
        }
        
        console.log(`✓ CSS颜色已更新: ${cssPath}`);
        console.log(`  color1: ${color1} -> text-color1: ${textColor1}`);
        console.log(`  color2: ${color2} -> text-color2: ${textColor2}`);
        
        fs.writeFileSync(cssPath, cssContent, 'utf8');
    } catch (error) {
        console.error('更新CSS颜色失败:', error.message);
        throw error;
    }
}

// 更新所有HTML文件中的域名
function updateDomainInHTML(domain) {
    try {
        const displayDomain = domain.replace(/^https?:\/\//, '').split('/')[0].split('?')[0].trim();
        const currentYear = new Date().getFullYear();
        const htmlFiles = ['index.html', 'detail.html', 'pages/about.html', 'pages/privacy.html', 'pages/terms.html', 'pages/category.html']
            .map(f => path.join(__dirname, f));
        
        let updatedCount = 0;
        
        // 匹配顶部logo中的域名
        const logoRegex = /(<a[^>]*class\s*=\s*["']?logo["']?[^>]*>\s*<p>)([^<]+?)(<\/p>\s*<\/a>)/gi;
        
        htmlFiles.forEach(filePath => {
            if (!fs.existsSync(filePath)) {
                console.log(`○ 文件不存在: ${path.relative(__dirname, filePath)}`);
                return;
            }
            
            let htmlContent = fs.readFileSync(filePath, 'utf8');
            const originalContent = htmlContent;
            let hasChanges = false;
            
            // 更新顶部logo中的域名
            htmlContent = htmlContent.replace(logoRegex, (match, openTag, content, closeTag) => {
                const trimmed = content.trim();
                if (trimmed.includes('.')) {
                    hasChanges = true;
                    return `${openTag}${displayDomain}${closeTag}`;
                }
                return match;
            });
            
            if (htmlContent !== originalContent || hasChanges) {
                fs.writeFileSync(filePath, htmlContent, 'utf8');
                updatedCount++;
                console.log(`✓ 已更新: ${path.relative(__dirname, filePath)}`);
            }
        });
        
        console.log(`✓ 共更新 ${updatedCount} 个HTML文件中的域名`);
    } catch (error) {
        console.error('更新HTML域名失败:', error.message);
        throw error;
    }
}

// 更新 BaseURL.js 中的 infoType 和第1行 BASE_URL
function updateBaseURL(info, json) {
    try {
        const baseURLPath = path.join(__dirname, 'public', 'js', 'BaseURL.js');
        let jsContent = fs.readFileSync(baseURLPath, 'utf8');
        const originalContent = jsContent;
        let hasChanges = false;

        // 从现有的 BASE_URL 中提取基础 URL
        const baseURLMatch = jsContent.match(/export\s+const\s+BASE_URL\s*=\s*["']([^"']+\/)[^"']*\.json["']/);
        let baseUrlPrefix = '';
        
        if (baseURLMatch) {
            baseUrlPrefix = baseURLMatch[1];
            console.log(`  检测到基础 URL: ${baseUrlPrefix}`);
        }

        // 根据 info 值修改 infoType
        const infoTypeRegex = /const\s+infoType\s*=\s*['"]info\d+['"]/;
        if (infoTypeRegex.test(jsContent)) {
            jsContent = jsContent.replace(infoTypeRegex, `const infoType = 'info${info}'`);
            hasChanges = true;
            console.log(`  ✓ infoType 已更新为: info${info}`);
        }

        // 只修改第1行的 BASE_URL
        const baseURLRegex = /export\s+const\s+BASE_URL\s*=\s*["']https?:\/\/[^"']+\.json["']/;
        if (baseURLRegex.test(jsContent)) {
            jsContent = jsContent.replace(baseURLRegex, `export const BASE_URL = "${baseUrlPrefix}db${json}.json"`);
            hasChanges = true;
            console.log(`  ✓ BASE_URL (第1行) 已更新为: ${baseUrlPrefix}db${json}.json`);
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
        const config = readConfig();
        console.log('读取配置:');
        console.log(`  color1: ${config.color1}`);
        console.log(`  color2: ${config.color2}`);
        console.log(`  域名: ${config.domain}`);
        console.log(`  info: ${config.info}`);
        console.log(`  json: ${config.json}\n`);
        
        updateCSSColor(config.color1, config.color2);
        console.log('');
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

