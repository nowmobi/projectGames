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

// 计算颜色的亮度
function getBrightness(hex) {
    const rgb = hexToRgb(hex);
    return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
}

// 根据primary-color生成更明显的text-primary颜色
function generateTextPrimary(primaryColor) {
    const brightness = getBrightness(primaryColor);
    
    // 如果primary-color亮度较高（浅色），text-primary使用深色
    // 如果primary-color亮度较低（深色），text-primary使用浅色
    if (brightness > 128) {
        // 浅色背景，使用深色文字
        return '#2c2c2c';
    } else {
        // 深色背景，使用浅色文字
        return '#ffffff';
    }
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
        
        // 根据primary-color生成text-primary颜色
        const textPrimaryColor = generateTextPrimary(color);
        
        // 更新text-primary颜色
        const textPrimaryRegex = /(:root\s*\{[\s\S]*?)(--text-primary\s*:\s*)([^;]+)(;)/;
        if (textPrimaryRegex.test(cssContent)) {
            cssContent = cssContent.replace(textPrimaryRegex, `$1$2${textPrimaryColor}$4`);
        } else {
            // 如果不存在text-primary，添加它
            cssContent = cssContent.replace(/(:root\s*\{[\s\S]*?--primary-color\s*:\s*[^;]+;)/, `$1\n    --text-primary: ${textPrimaryColor};`);
        }
        
        console.log(`✓ CSS颜色已更新: ${cssPath}`);
        console.log(`  primary-color: ${color}`);
        console.log(`  text-primary: ${textPrimaryColor}`);
        
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
        
        // 匹配header中logo的域名（兼容内联样式）
        const headerLogoRegex = /(<a[^>]*class\s*=\s*["']?logo["']?[^>]*>\s*<p[^>]*>)([^<]+?)(<\/p>\s*<\/a>)/gi;
        
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
            
            // 更新header中logo的域名
            htmlContent = htmlContent.replace(headerLogoRegex, (match, openTag, content, closeTag) => {
                const trimmed = content.trim();
                // 如果内容已经是域名格式，直接替换
                if (/^[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$/.test(trimmed) || trimmed.includes('.')) {
                    hasChanges = true;
                    return `${openTag}${displayDomain}${closeTag}`;
                }
                return match;
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


// 更新 BaseURL.js 中的第 1 行 BASE_URL 和 infoType
function updateBaseURL(info, json) {
    try {
        const baseURLPath = path.join(__dirname, 'public', 'js', 'BaseURL.js');
        let jsContent = fs.readFileSync(baseURLPath, 'utf8');
        const originalContent = jsContent;
        let hasChanges = false;

        // 将内容按行分割
        const lines = jsContent.split('\n');
        
        // 只修改第 1 行（索引为 0）的 BASE_URL
        if (lines.length > 0) {
            const firstLine = lines[0];
            
            // 从现有的 BASE_URL 中提取基础 URL
            const baseURLMatch = firstLine.match(/export\s+const\s+BASE_URL\s*=\s*["']([^"']+\/)[^"']*\.json["']/);
            let baseUrlPrefix = '';
            
            if (baseURLMatch) {
                baseUrlPrefix = baseURLMatch[1];
                console.log(`  检测到基础 URL: ${baseUrlPrefix}`);
            }

            // 根据 json 值修改第 1 行的 BASE_URL（使用提取的基础 URL）
            const baseURLRegex = /export\s+const\s+BASE_URL\s*=\s*["']https?:\/\/[^"']+\.json["']/;
            if (baseURLRegex.test(firstLine)) {
                lines[0] = firstLine.replace(baseURLRegex, `export const BASE_URL = "${baseUrlPrefix}db${json}.json"`);
                hasChanges = true;
                console.log(`  ✓ 第 1 行 BASE_URL 已更新为: ${baseUrlPrefix}db${json}.json`);
            }
        }

        // 重新组合内容（如果修改了第 1 行）
        if (hasChanges) {
            jsContent = lines.join('\n');
        }

        // 根据 info 值修改 infoType（保留此功能）
        const infoTypeRegex = /const\s+infoType\s*=\s*['"]info\d+['"]/;
        if (infoTypeRegex.test(jsContent)) {
            jsContent = jsContent.replace(infoTypeRegex, `const infoType = 'info${info}'`);
            hasChanges = true;
            console.log(`  ✓ infoType 已更新为: info${info}`);
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

