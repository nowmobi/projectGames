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

// 混合颜色（将主题色与白色混合）
function mixColor(hexColor, whitePercent) {
    const rgb = hexToRgb(hexColor);
    const white = { r: 255, g: 255, b: 255 };
    
    const r = Math.round(rgb.r * (1 - whitePercent / 100) + white.r * (whitePercent / 100));
    const g = Math.round(rgb.g * (1 - whitePercent / 100) + white.g * (whitePercent / 100));
    const b = Math.round(rgb.b * (1 - whitePercent / 100) + white.b * (whitePercent / 100));
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// 生成互补色（使用HSV颜色空间）
function getComplementaryColor(hexColor) {
    const rgb = hexToRgb(hexColor);
    
    // 将RGB转换为HSV
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    
    // 色相旋转180度得到互补色
    const complementaryHsv = {
        h: (hsv.h + 180) % 360,
        s: hsv.s,
        v: hsv.v
    };
    
    // 将HSV转换回RGB
    const complementaryRgb = hsvToRgb(complementaryHsv.h, complementaryHsv.s, complementaryHsv.v);
    
    return `#${complementaryRgb.r.toString(16).padStart(2, '0')}${complementaryRgb.g.toString(16).padStart(2, '0')}${complementaryRgb.b.toString(16).padStart(2, '0')}`;
}

// RGB转HSV
function rgbToHsv(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    
    let h = 0;
    const s = max === 0 ? 0 : d / max;
    const v = max;
    
    if (d !== 0) {
        switch (max) {
            case r:
                h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                break;
            case g:
                h = ((b - r) / d + 2) / 6;
                break;
            case b:
                h = ((r - g) / d + 4) / 6;
                break;
        }
    }
    
    return { h: h * 360, s: s * 100, v: v * 100 };
}

// HSV转RGB
function hsvToRgb(h, s, v) {
    h /= 360;
    s /= 100;
    v /= 100;
    
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    
    let r, g, b;
    
    switch (i % 6) {
        case 0: r = v; g = t; b = p; break;
        case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t; break;
        case 3: r = p; g = q; b = v; break;
        case 4: r = t; g = p; b = v; break;
        case 5: r = v; g = p; b = q; break;
    }
    
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

// 计算颜色的亮度（使用标准亮度公式）
function getBrightness(hexColor) {
    const rgb = hexToRgb(hexColor);
    // 标准亮度公式: Y = 0.299*R + 0.587*G + 0.114*B
    return 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
}

// 根据背景颜色计算适合的文字颜色
function getContrastTextColor(hexColor) {
    const brightness = getBrightness(hexColor);
    // 如果背景亮度 > 128，使用深色文字；否则使用浅色文字
    if (brightness > 128) {
        return '#2c2c2c';
    } else {
        return '#ffffff';
    }
}

// 根据两个颜色计算适合的文字颜色（用于渐变背景）
function getContrastTextColorForGradient(hexColor1, hexColor2) {
    const brightness1 = getBrightness(hexColor1);
    const brightness2 = getBrightness(hexColor2);
    const avgBrightness = (brightness1 + brightness2) / 2;
    
    // 如果平均亮度 > 128，使用深色文字；否则使用浅色文字
    if (avgBrightness > 128) {
        return '#2c2c2c';
    } else {
        return '#ffffff';
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
function updateCSSColor(color) {
    try {
        const cssPath = path.join(__dirname, 'public', 'style', 'inpublic.css');
        let cssContent = fs.readFileSync(cssPath, 'utf8');
        
        // color1使用配置的颜色
        const color1 = color;
        // color2使用互补色
        const color2 = getComplementaryColor(color);
        // 根据color1和color2计算适合的文字颜色
        const textPrimary = getContrastTextColorForGradient(color1, color2);
        // 根据color1计算logo文字颜色
        const logoColor = getContrastTextColor(color1);
        
        // 更新color1
        const color1Regex = /(--color1\s*:\s*)([^;]+)(;)/;
        if (color1Regex.test(cssContent)) {
            cssContent = cssContent.replace(color1Regex, `$1${color1}$3`);
        }
        
        // 更新color2
        const color2Regex = /(--color2\s*:\s*)([^;]+)(;)/;
        if (color2Regex.test(cssContent)) {
            cssContent = cssContent.replace(color2Regex, `$1${color2}$3`);
        }
        
        // 更新text-primary
        const textPrimaryRegex = /(--text-primary\s*:\s*)([^;]+)(;)/;
        if (textPrimaryRegex.test(cssContent)) {
            cssContent = cssContent.replace(textPrimaryRegex, `$1${textPrimary}$3`);
        }
        
        // 更新logo-color
        const logoColorRegex = /(--logo-color\s*:\s*)([^;]+)(;)/;
        if (logoColorRegex.test(cssContent)) {
            cssContent = cssContent.replace(logoColorRegex, `$1${logoColor}$3`);
        }
        
        console.log(`✓ CSS颜色已更新: ${cssPath}`);
        console.log(`  color1: ${color1}`);
        console.log(`  color2: ${color2} (互补色)`);
        console.log(`  text-primary: ${textPrimary} (自动计算)`);
        console.log(`  logo-color: ${logoColor} (自动计算)`);
        
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
        
        // 匹配logo文本（包括index.html中的logo和pages中的center-logo）
        const logoTextRegex = /(<(?:span|a)[^>]*class\s*=\s*["']?(?:logo|center-logo)["']?[^>]*>)([^<]+?)(<\/(?:span|a)>)/gi;
        
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
            
            // 更新logo文本
            htmlContent = htmlContent.replace(logoTextRegex, (match, openTag, content, closeTag) => {
                const trimmed = content.trim();
                // 如果内容已经是域名格式，直接替换
                if (/^[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$/.test(trimmed) || trimmed.includes('.')) {
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

// 更新 BaseURL.js 中的 infoType 和 BASE_URL
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

        // 根据 json 值修改 BASE_URL（使用提取的基础 URL）
        const baseURLRegex = /export\s+const\s+BASE_URL\s*=\s*["']https?:\/\/[^"']+\.json["']/;
        if (baseURLRegex.test(jsContent)) {
            jsContent = jsContent.replace(baseURLRegex, `export const BASE_URL = "${baseUrlPrefix}db${json}.json"`);
            hasChanges = true;
            console.log(`  ✓ BASE_URL 已更新为: ${baseUrlPrefix}db${json}.json`);
        }

        // 根据 json 值修改 getDataBaseUrl 中的 replace 路径
        const replaceRegex = /return\s+BASE_URL\.replace\(['"]\/db\d+\.json['"]\s*,\s*['"]['"]\)/;
        if (replaceRegex.test(jsContent)) {
            jsContent = jsContent.replace(replaceRegex, `return BASE_URL.replace('/db${json}.json', '')`);
            hasChanges = true;
            console.log(`  ✓ replace 路径已更新为: /db${json}.json`);
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

        // 计算颜色
        const color1 = config.color;
        const color2 = getComplementaryColor(color1);
        const textPrimary = getContrastTextColorForGradient(color1, color2);

        console.log('');
        updateCSSColor(color1);
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

