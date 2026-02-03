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

// 计算颜色的亮度
function getBrightness(rgb) {
    return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
}

// 生成与 primary-color 形成明显对比的 logo-color
function generateLogoColor(hexColor) {
    const rgb = hexToRgb(hexColor);
    const brightness = getBrightness(rgb);
    
    // 如果 primary-color 较亮（亮度 > 128），生成深色 logo-color
    // 如果 primary-color 较暗（亮度 <= 128），生成浅色 logo-color
    let logoRgb;
    
    if (brightness > 128) {
        // 生成深色：将颜色加深 60%
        const darkFactor = 0.4;
        logoRgb = {
            r: Math.round(rgb.r * darkFactor),
            g: Math.round(rgb.g * darkFactor),
            b: Math.round(rgb.b * darkFactor)
        };
    } else {
        // 生成浅色：将颜色与白色混合 70%
        const lightFactor = 0.7;
        logoRgb = {
            r: Math.round(rgb.r * (1 - lightFactor) + 255 * lightFactor),
            g: Math.round(rgb.g * (1 - lightFactor) + 255 * lightFactor),
            b: Math.round(rgb.b * (1 - lightFactor) + 255 * lightFactor)
        };
    }
    
    return `#${logoRgb.r.toString(16).padStart(2, '0')}${logoRgb.g.toString(16).padStart(2, '0')}${logoRgb.b.toString(16).padStart(2, '0')}`;
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
        
        // 更新主颜色
        const rootRegex = /(:root\s*\{[^}]*?)(--primary-color\s*:\s*)([^;]+)(;)/;
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
                const primaryColorLight = mixColor(color, 80);
                const primaryColorLighter = mixColor(color, 60);
                const rgb = hexToRgb(color);
                const rgbValue = `${rgb.r}, ${rgb.g}, ${rgb.b}`;
                
                // 更新浅色变量
                cssContent = updateCSSVar(cssContent, '--primary-color-light', primaryColorLight, '--primary-color');
                cssContent = updateCSSVar(cssContent, '--primary-color-lighter', primaryColorLighter, '--primary-color-light');
                
                // 更新RGB和RGBA变量
                cssContent = updateCSSVar(cssContent, '--primary-color-rgb', rgbValue, '--primary-color-lighter');
                [
                    { name: '--primary-color-rgba-15', alpha: 0.15 },
                    { name: '--primary-color-rgba-25', alpha: 0.25 },
                    { name: '--primary-color-rgba-30', alpha: 0.3 },
                    { name: '--primary-color-rgba-10', alpha: 0.1 }
                ].forEach(({ name, alpha }) => {
                    cssContent = updateCSSVar(cssContent, name, `rgba(${rgbValue}, ${alpha})`, '--primary-color-rgb');
                });
                
                // 更新 box-shadow 中的 rgba
                cssContent = cssContent.replace(
                    /(\.category-btn\.active\s*\{[^}]*?box-shadow:\s*[^;]*rgba\()(\d+),\s*(\d+),\s*(\d+)(,\s*[\d.]+\))/,
                    `$1${rgb.r}, ${rgb.g}, ${rgb.b}$5`
                );
                
                // 计算并更新 logo-color
                const logoColor = generateLogoColor(color);
                cssContent = updateCSSVar(cssContent, '--logo-color', logoColor, '--text-muted');
                
                console.log(`✓ CSS颜色已更新: ${cssPath}`);
                console.log(`  新颜色值: ${color}`);
                console.log(`  浅色版本: ${primaryColorLight}, ${primaryColorLighter}`);
                console.log(`  对比色: ${logoColor}`);
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
        const footerTextRegex = /(<div[^>]*class\s*=\s*["']?footer-copyright-text["']?[^>]*>)([^<]+?)(<\/div>)/gi;
        const logoTextRegex = /(<a[^>]*class\s*=\s*["']?logo["']?[^>]*>\s*<p>)([^<]+?)(<\/p>\s*<\/a>)/gi;
        
        htmlFiles.forEach(filePath => {
            if (!fs.existsSync(filePath)) {
                console.log(`○ 文件不存在: ${path.relative(__dirname, filePath)}`);
                return;
            }
            
            let htmlContent = fs.readFileSync(filePath, 'utf8');
            const originalContent = htmlContent;
            
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
                
                return `${openTag}${newContent}${closeTag}`;
            });

            htmlContent = htmlContent.replace(logoTextRegex, (match, openTag, content, closeTag) => {
                return `${openTag}${displayDomain}${closeTag}`;
            });
            
            if (htmlContent !== originalContent) {
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

        // 根据 json 值只修改第1行的 BASE_URL
        const baseURLRegex = /export\s+const\s+BASE_URL\s*=\s*["']https?:\/\/[^"']+db\d+\.json["']/;
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

