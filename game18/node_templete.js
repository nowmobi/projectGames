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

// 生成新的logo图
async function generateLogo(color, domain) {
    try {
        // 确保public目录存在
        const publicDir = path.join(__dirname, 'public');
        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true });
        }
        
        const canvas = createCanvas(400, 100);
        const ctx = canvas.getContext('2d');
        
        // 清除画布
        ctx.clearRect(0, 0, 400, 100);
        
        // 绘制背景（使用主题色，无圆角）
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 400, 100);
        
        // 根据背景色计算最佳文字颜色
        const textColor = getBestTextColor(color);
        
        // 设置文字样式
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // 绘制域名文字（只显示主域名部分，去掉协议和路径）
        const displayDomain = domain.replace(/^https?:\/\//, '').split('/')[0];
        
        // 根据域名长度调整字体大小 - 增大字体让域名更醒目
        let fontSize;
        if (displayDomain.length <= 8) {
            // 短域名使用更大字体
            fontSize = 64;
        } else if (displayDomain.length <= 12) {
            fontSize = 56;
        } else if (displayDomain.length <= 16) {
            fontSize = 48;
        } else if (displayDomain.length <= 20) {
            fontSize = 42;
        } else if (displayDomain.length <= 25) {
            fontSize = 36;
        } else {
            fontSize = 32;
        }
        
        // 尝试注册 Rubik 字体（如果字体文件存在）
        const rubikFontPath = path.join(__dirname, 'fonts', 'Rubik-Bold.ttf');
        if (fs.existsSync(rubikFontPath)) {
            try {
                registerFont(rubikFontPath, { family: 'Rubik', weight: 'bold' });
            } catch (error) {
                console.log('  提示: Rubik字体文件存在但注册失败，将使用系统字体');
            }
        }
        
        ctx.font = `bold ${fontSize}px Rubik, sans-serif`;
        
        // 如果域名很长，可能需要换行显示
        if (displayDomain.length > 25) {
            const parts = displayDomain.split('.');
            if (parts.length >= 2) {
                const mainPart = parts.slice(0, -1).join('.');
                const tld = '.' + parts[parts.length - 1];
                ctx.fillText(mainPart, 200, 40);
                ctx.font = 'bold 32px Rubik, sans-serif';
                ctx.fillText(tld, 200, 65);
            } else {
                ctx.fillText(displayDomain.substring(0, 25), 200, 50);
            }
        } else {
            ctx.fillText(displayDomain, 200, 50);
        }
        
        // 保存logo
        const logoPath = path.join(publicDir, 'logo.png');
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(logoPath, buffer);
        
        console.log(`✓ Logo已生成: ${logoPath}`);
        console.log(`  背景颜色: ${color}`);
        console.log(`  文字颜色: ${textColor}`);
        console.log(`  域名: ${domain}`);
        
    } catch (error) {
        console.error('生成logo失败:', error.message);
        // 如果canvas有问题，提供替代方案提示
        if (error.message.includes('canvas') || error.message.includes('native')) {
            console.error('提示: 如果遇到canvas依赖问题，请尝试运行: npm rebuild canvas');
        }
        throw error;
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

// 更新CSS中的颜色
function updateCSSColor(color) {
    try {
        const cssPath = path.join(__dirname, 'public', 'style', 'inpublic.css');
        let cssContent = fs.readFileSync(cssPath, 'utf8');
        
        // 更新 --color1 为主颜色
        const color1Regex = /(:root\s*\{[\s\S]*?)(--color1\s*:\s*)([^;]+)(;)/;
        if (!color1Regex.test(cssContent)) {
            cssContent = cssContent.includes(':root') 
                ? cssContent.replace(/(:root\s*\{)/, `$1\n    --color1: ${color};`)
                : `:root {\n    --color1: ${color};\n}\n\n${cssContent}`;
        } else {
            cssContent = cssContent.replace(color1Regex, `$1$2${color}$4`);
        }
        
        // 计算 --color2 为互补色（基于 --color1 的色相偏移）
        const rgb = hexToRgb(color);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        const complementaryHsl = {
            h: (hsl.h + 180) % 360,
            s: Math.min(hsl.s + 10, 100),
            l: Math.max(hsl.l - 10, 20)
        };
        const color2 = hslToHex(complementaryHsl.h, complementaryHsl.s, complementaryHsl.l);
        
        // 更新 --color2 为互补色
        const color2Regex = /(:root\s*\{[\s\S]*?)(--color2\s*:\s*)([^;]+)(;)/;
        if (!color2Regex.test(cssContent)) {
            cssContent = cssContent.includes(':root') 
                ? cssContent.replace(/(:root\s*\{)/, `$1\n    --color2: ${color2};`)
                : `:root {\n    --color2: ${color2};\n}\n\n${cssContent}`;
        } else {
            cssContent = cssContent.replace(color2Regex, `$1$2${color2}$4`);
        }
        
        // 更新 --text-primary 为最佳对比色
        const textColor = getBestTextColor(color);
        const textPrimaryRegex = /(:root\s*\{[\s\S]*?)(--text-primary\s*:\s*)([^;]+)(;)/;
        if (!textPrimaryRegex.test(cssContent)) {
            cssContent = cssContent.includes(':root') 
                ? cssContent.replace(/(:root\s*\{)/, `$1\n    --text-primary: ${textColor};`)
                : `:root {\n    --text-primary: ${textColor};\n}\n\n${cssContent}`;
        } else {
            cssContent = cssContent.replace(textPrimaryRegex, `$1$2${textColor}$4`);
        }
        
        console.log(`✓ CSS颜色已更新: ${cssPath}`);
        console.log(`  --color1: ${color}`);
        console.log(`  --color2: ${color2}`);
        console.log(`  --text-primary: ${textColor}`);
        
        fs.writeFileSync(cssPath, cssContent, 'utf8');
    } catch (error) {
        console.error('更新CSS颜色失败:', error.message);
        throw error;
    }
}

// RGB转HSL
function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    
    return { h: h * 360, s: s * 100, l: l * 100 };
}

// HSL转Hex
function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;
    
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    
    let r, g, b;
    
    if (0 <= h && h < 60) { r = c; g = x; b = 0; }
    else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
    else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
    else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
    else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// 计算颜色的感知亮度
function getBrightness(hex) {
    const rgb = hexToRgb(hex);
    return (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b);
}

// 计算相对亮度（用于 WCAG 对比度计算）
function getRelativeLuminance(hex) {
    const rgb = hexToRgb(hex);
    
    const a = [rgb.r, rgb.g, rgb.b].map(function (v) {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

// 计算对比度
function getContrastRatio(hex1, hex2) {
    const l1 = getRelativeLuminance(hex1);
    const l2 = getRelativeLuminance(hex2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
}

// 根据背景色亮度选择最佳文字颜色
function getBestTextColor(hex) {
    const whiteContrast = getContrastRatio(hex, '#ffffff');
    const blackContrast = getContrastRatio(hex, '#2c2c2c');
    
    return whiteContrast >= blackContrast ? '#ffffff' : '#2c2c2c';
}

// 更新所有HTML文件中的域名
function updateDomainInHTML(domain) {
    try {
        const displayDomain = domain.replace(/^https?:\/\//, '').split('/')[0].split('?')[0].trim();
        const currentYear = new Date().getFullYear();
        const htmlFiles = ['index.html', 
                            'detail.html', 
                            'pages/about.html', 
                            'pages/privacy.html',
                            'pages/terms.html', 
                            'pages/category.html',
                            'pages/credits.html']
            .map(f => path.join(__dirname, f));
        
        let updatedCount = 0;
        
        // 匹配header中logo文本（顶部域名）
        const headerLogoRegex = /(<a[^>]*class\s*=\s*["']?logo["']?[^>]*>\s*<p>)([^<]+?)(<\/p>\s*<\/a>)/gi;
        
        // 匹配footer-brand中的域名
        const footerBrandRegex = /(<div[^>]*class\s*=\s*["']?footer-brand["']?[^>]*>)([^<]+?)(<\/div>)/gi;
        
        // 匹配footer-copyright-text中的版权信息（兼容旧格式）
        const footerTextRegex = /(<div[^>]*class\s*=\s*["']?footer-copyright-text["']?[^>]*>)([^<]+?)(<\/div>)/gi;
        
        htmlFiles.forEach(filePath => {
            if (!fs.existsSync(filePath)) {
                console.log(`○ 文件不存在: ${path.relative(__dirname, filePath)}`);
                return;
            }
            
            let htmlContent = fs.readFileSync(filePath, 'utf8');
            const originalContent = htmlContent;
            let hasChanges = false;
            
            // 更新header中logo文本（顶部域名）
            htmlContent = htmlContent.replace(headerLogoRegex, (match, openTag, content, closeTag) => {
                hasChanges = true;
                return `${openTag}${displayDomain}${closeTag}`;
            });
            
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


// 更新 BaseURL.js 中的 infoType 和第 1 行 BASE_URL
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

        // 只修改第 1 行的 BASE_URL
        const lines = jsContent.split('\n');
        if (lines.length > 0) {
            const firstLine = lines[0];
            const baseURLRegex = /export\s+const\s+BASE_URL\s*=\s*["']https?:\/\/[^"']+\.json["']/;
            if (baseURLRegex.test(firstLine)) {
                lines[0] = `export const BASE_URL = "${baseUrlPrefix}db${json}.json";`;
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

