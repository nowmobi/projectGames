const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

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
        
        // 设置文字样式
        ctx.fillStyle = '#FFFFFF';
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
        
        ctx.font = `bold ${fontSize}px Arial`;
        
        // 如果域名很长，可能需要换行显示
        if (displayDomain.length > 25) {
            const parts = displayDomain.split('.');
            if (parts.length >= 2) {
                const mainPart = parts.slice(0, -1).join('.');
                const tld = '.' + parts[parts.length - 1];
                ctx.fillText(mainPart, 200, 40);
                ctx.font = 'bold 32px Arial';
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
        console.log(`  颜色: ${color}`);
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
        
       
        console.log(`✓ CSS颜色已更新: ${cssPath}`);
        console.log(`  新颜色值: ${color}`);
        
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
        
        // 匹配logo中的p标签内容
        const logoPRegex = /(<a[^>]*class\s*=\s*["']?logo["']?[^>]*>\s*)<p[^>]*>(.*?)<\/p>(\s*<\/a>)/gi;
        
        // 匹配header-center中的p标签内容
        const headerCenterPRegex = /(<div[^>]*class\s*=\s*["']?header-center["']?[^>]*>\s*)<p[^>]*class\s*=\s*["']?center-logo-text["']?[^>]*>(.*?)<\/p>(\s*<\/div>)/gi;
        
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
            
            // 更新logo P标签中的内容（index.html）
            htmlContent = htmlContent.replace(logoPRegex, (match, openTag, content, closeTag) => {
                hasChanges = true;
                return `${openTag}<p>${displayDomain}</p>${closeTag}`;
            });
            
            // 更新header-center中的P标签内容（detail.html和category.html）
            htmlContent = htmlContent.replace(headerCenterPRegex, (match, openTag, content, closeTag) => {
                hasChanges = true;
                return `${openTag}<p class="center-logo-text">${displayDomain}</p>${closeTag}`;
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
                        newContent = `© ${year} ${displayDomain}. All Rights Reserved.`;
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

// 主函数
async function main() {
    console.log('开始执行主题配置更新...\n');
    try {
        const config = readConfig();
        console.log('读取配置:');
        console.log(`  颜色: ${config.color}`);
        console.log(`  域名: ${config.domain}\n`);
        
        await generateLogo(config.color, config.domain);
        console.log('');
        updateCSSColor(config.color);
        console.log('');
        updateDomainInHTML(config.domain);
        console.log('');
        console.log('✓ 所有更新完成！');
    } catch (error) {
        console.error('\n✗ 执行失败:', error.message);
        process.exit(1);
    }
}

// 运行主函数
main();

