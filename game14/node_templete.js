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



// 将十六进制颜色转换为 RGB
function hexToRgb(hex) {
    // 移除 # 号
    hex = hex.replace('#', '');
    
    // 处理 3 位十六进制颜色
    if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('');
    }
    
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return { r, g, b };
}

// 根据背景色计算合适的文本颜色（确保对比度）- 使用 WCAG 2.0 标准
function calculateTextColor(hexColor) {
    const rgb = hexToRgb(hexColor);
    
    // 计算 sRGB 相对亮度（WCAG 2.0 标准）
    function getRelativeLuminance(r, g, b) {
        // 将 RGB 值从 0-255 转换为 0-1
        const rsRGB = r / 255;
        const gsRGB = g / 255;
        const bsRGB = b / 255;
        
        // 应用 gamma 校正
        const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
        const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
        const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
        
        // 计算相对亮度
        return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
    }
    
    // 计算对比度比率
    function getContrastRatio(l1, l2) {
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        return (lighter + 0.05) / (darker + 0.05);
    }
    
    const bgLuminance = getRelativeLuminance(rgb.r, rgb.g, rgb.b);
    
    // 定义候选文本颜色（白色和不同深浅的深色）
    const candidateColors = [
        { name: 'white', r: 255, g: 255, b: 255 },
        { name: 'dark-gray', r: 44, g: 44, b: 44 },
        { name: 'black', r: 0, g: 0, b: 0 },
        { name: 'very-dark-gray', r: 30, g: 30, b: 30 },
        { name: 'dark-charcoal', r: 50, g: 50, b: 50 }
    ];
    
    let bestColor = candidateColors[0];
    let bestContrast = 0;
    
    // 找出对比度最高的颜色
    for (const color of candidateColors) {
        const textLuminance = getRelativeLuminance(color.r, color.g, color.b);
        const contrast = getContrastRatio(bgLuminance, textLuminance);
        
        if (contrast > bestContrast) {
            bestContrast = contrast;
            bestColor = color;
        }
    }
    
    // 转换为十六进制
    const hex = (r, g, b) => '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
    
    console.log(`  背景亮度: ${bgLuminance.toFixed(4)}, 最佳对比度: ${bestContrast.toFixed(2)}:1, 选择颜色: ${bestColor.name}`);
    
    return hex(bestColor.r, bestColor.g, bestColor.b);
}

// 混合颜色（将主题色与白色混合）
function mixColor(hexColor, whitePercent) {
    const rgb = hexToRgb(hexColor);
    const white = { r: 255, g: 255, b: 255 };
    
    const r = Math.round(rgb.r * (1 - whitePercent / 100) + white.r * (whitePercent / 100));
    const g = Math.round(rgb.g * (1 - whitePercent / 100) + white.g * (whitePercent / 100));
    const b = Math.round(rgb.b * (1 - whitePercent / 100) + white.b * (whitePercent / 100));
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
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

// 更新CSS中的primary-color颜色
function updateCSSColor(color) {
    try {
        const cssPath = path.join(__dirname, 'public', 'style', 'inpublic.css');
        let cssContent = fs.readFileSync(cssPath, 'utf8');
        
        // 更新主颜色 - 使用多行匹配，正确处理:root块
        const rootRegex = /(:root\s*\{[\s\S]*?)(--primary-color\s*:\s*)([^;]+)(;)/;
        if (!rootRegex.test(cssContent)) {
            cssContent = cssContent.includes(':root') 
                ? cssContent.replace(/(:root\s*\{)/, `$1\n    --primary-color: ${color};`)
                : `:root {\n    --primary-color: ${color};\n}\n\n${cssContent}`;
        } else {
            cssContent = cssContent.replace(rootRegex, `$1$2${color}$4`);
        }
        
        // 如果是十六进制颜色，更新辅助变量
        if (color.startsWith('#')) {
            try {
                const rgb = hexToRgb(color);
                const rgbValue = `${rgb.r}, ${rgb.g}, ${rgb.b}`;
                
                // 更新RGB和RGBA变量
                cssContent = updateCSSVar(cssContent, '--primary-color-rgb', rgbValue, '--primary-color');
                
                // 只更新 rgba-10 变量
                cssContent = updateCSSVar(cssContent, '--primary-color-rgba-10', `rgba(${rgbValue}, 0.1)`, '--primary-color-rgb');
                
                // 更新 box-shadow 中的 rgba 为白色（保持光影效果为白色）
                cssContent = cssContent.replace(
                    /(\.category-btn\.active\s*\{[^}]*?box-shadow:\s*[^;]*rgba\()(\d+),\s*(\d+),\s*(\d+)(,\s*[\d.]+\))/,
                    `$1255, 255, 255$5`
                );
                
                // 根据primary-color计算text-primary颜色
                const textColor = calculateTextColor(color);
                cssContent = updateCSSVar(cssContent, '--text-primary', textColor, '--primary-color-rgba-10');
                
                console.log(`✓ CSS颜色已更新: ${cssPath}`);
                console.log(`  新颜色值: ${color}`);
                console.log(`  文本颜色: ${textColor}`);
            } catch (e) {
                console.warn(`无法计算浅色版本: ${e.message}`);
            }
        }
        
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
        
        // 匹配footer-brand中的域名
        const footerBrandRegex = /(<div[^>]*class\s*=\s*["']?footer-brand["']?[^>]*>)([^<]+?)(<\/div>)/gi;
        
        // 匹配footer-copyright-text中的版权信息（兼容旧格式）
        const footerTextRegex = /(<div[^>]*class\s*=\s*["']?footer-copyright-text["']?[^>]*>)([^<]+?)(<\/div>)/gi;
        
        // 匹配header-center中的域名文本
        const headerCenterRegex = /(<div[^>]*class\s*=\s*["']?header-center["']?[^>]*>\s*<p>)([^<]+?)(<\/p>\s*<\/div>)/gi;
        
        // 匹配logo中的域名文本
        const logoRegex = /(<a[^>]*class\s*=\s*["']?logo["']?[^>]*>\s*<p>)([^<]+?)(<\/p>\s*<\/a>)/gi;
        
        htmlFiles.forEach(filePath => {
            if (!fs.existsSync(filePath)) {
                console.log(`○ 文件不存在: ${path.relative(__dirname, filePath)}`);
                return;
            }
            
            let htmlContent = fs.readFileSync(filePath, 'utf8');
            const originalContent = htmlContent;
            let hasChanges = false;
            
            // 更新footer-brand中的域名
            htmlContent = htmlContent.replace(footerBrandRegex, (match, openTag, content, closeTag) => {
                const trimmed = content.trim();
                // 如果内容已经是域名格式，直接替换
                if (/^[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$/.test(trimmed) || trimmed.includes('.')) {
                    hasChanges = true;
                    return `${openTag}${displayDomain}${closeTag}`;
                }
                return match;
            });
            
            // 更新header-center中的域名文本
            htmlContent = htmlContent.replace(headerCenterRegex, (match, openTag, content, closeTag) => {
                const trimmed = content.trim();
                // 如果内容已经是域名格式，直接替换
                if (/^[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$/.test(trimmed) || trimmed.includes('.')) {
                    hasChanges = true;
                    return `${openTag}${displayDomain}${closeTag}`;
                }
                return match;
            });
            
            // 更新logo中的域名文本
            htmlContent = htmlContent.replace(logoRegex, (match, openTag, content, closeTag) => {
                const trimmed = content.trim();
                // 如果内容已经是域名格式，直接替换
                if (/^[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$/.test(trimmed) || trimmed.includes('.')) {
                    hasChanges = true;
                    return `${openTag}${displayDomain}${closeTag}`;
                }
                return match;
            });
            
            // 更新footer-copyright-text中的版权信息（兼容旧格式）
            htmlContent = htmlContent.replace(footerTextRegex, (match, openTag, content, closeTag) => {
                const trimmed = content.trim();
                const yearMatch = trimmed.match(/(\d{4})(?:-(\d{4}))?/);
                const startYear = yearMatch ? yearMatch[1] : '2021';
                const year = currentYear.toString();
                let newContent = '';
                
                if (/©\s*\d{4}\s+[^\s]+(?:\s*\.)?\s+All\s+Rights\s+Reserved\.?/i.test(trimmed)) {
                    newContent = trimmed.replace(/©\s*\d{4}\s+[^\s.]+(?:\.[^\s.]+)*/i, `© ${year} ${displayDomain}`);
                } else if (/Copyright\s+©\s+\d{4}(?:-\d{4})?\s+[^\s]+\s+All\s+rights?\s+Reserved\.?/i.test(trimmed)) {
                    newContent = trimmed.replace(/Copyright\s+©\s+(\d{4})(?:-\d{4})?\s+[^\s]+/i, `Copyright © ${startYear}-${year} ${displayDomain}`);
                } else if (/\d{4}\s+[^\s.]+(?:\.[^\s.]+)*/i.test(trimmed)) {
                    newContent = trimmed.replace(/\d{4}\s+[^\s.]+(?:\.[^\s.]+)*/i, `${year} ${displayDomain}`);
                    if (!/All\s+Rights?\s+Reserved/i.test(newContent)) {
                        newContent = `© ${newContent.trim()}. All Rights Reserved.`;
                    }
                } else {
                    newContent = `© ${year} ${displayDomain}. All Rights Reserved.`;
                }
                
                hasChanges = true;
                return `${openTag}${newContent}${closeTag}`;
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

// 更新 BaseURL.js 中的 infoType 和第一行 BASE_URL
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

        // 只修改第一行的 BASE_URL（根据 json 值）
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
        const config = readConfig();
        console.log('读取配置:');
        console.log(`  颜色: ${config.color}`);
        console.log(`  域名: ${config.domain}`);
        console.log(`  info: ${config.info}`);
        console.log(`  json: ${config.json}\n`);
        
        updateCSSColor(config.color);
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

