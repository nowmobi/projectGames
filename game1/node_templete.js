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

// 计算与背景色对比度明显的文本颜色
function calculateTextColor(backgroundColor) {
    try {
        // 移除 # 号
        const hex = backgroundColor.replace('#', '');
        
        // 解析RGB
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        // 计算亮度（使用加权平均）
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
        
        // 如果背景较亮（luminance > 128），使用深色文字；否则使用浅色文字
        if (luminance > 128) {
            return '#333333';
        } else {
            return '#ffffff';
        }
    } catch (error) {
        console.error('计算文本颜色失败:', error.message);
        return '#333333';
    }
}

// 更新CSS中的primary-background颜色
function updateCSSColor(color) {
    try {
        const cssPath = path.join(__dirname, 'public', 'style', 'inpublic.css');
        let cssContent = fs.readFileSync(cssPath, 'utf8');
        
        // 计算对应的文本颜色
        const textColor = calculateTextColor(color);
        
        // 使用正则表达式替换 --primary-background 的值
        const bgRegex = /(--primary-background:\s*)([^;]+)/;
        const bgValue = `$1${color}`;
        
        // 使用正则表达式替换 --text-color 的值
        const textRegex = /(--text-color:\s*)([^;]+)/;
        const textValue = `$1${textColor}`;
        
        let modified = false;
        
        if (bgRegex.test(cssContent)) {
            cssContent = cssContent.replace(bgRegex, bgValue);
            modified = true;
        }
        
        if (textRegex.test(cssContent)) {
            cssContent = cssContent.replace(textRegex, textValue);
            modified = true;
        }
        
        if (modified) {
            fs.writeFileSync(cssPath, cssContent, 'utf8');
            console.log(`✓ CSS颜色已更新: ${cssPath}`);
            console.log(`  背景色: ${color}`);
            console.log(`  文字色: ${textColor}`);
        } else {
            // 如果没有找到，在:root中添加
            if (cssContent.includes(':root')) {
                cssContent = cssContent.replace(
                    /(:root\s*\{[^}]*)/,
                    `$1\n    --primary-background: ${color};\n    --text-color: ${textColor};`
                );
            } else {
                cssContent = `:root {\n    --primary-background: ${color};\n    --text-color: ${textColor};\n}\n\n${cssContent}`;
            }
            fs.writeFileSync(cssPath, cssContent, 'utf8');
            console.log(`✓ CSS颜色已添加: ${cssPath}`);
            console.log(`  背景色: ${color}`);
            console.log(`  文字色: ${textColor}`);
        }
    } catch (error) {
        console.error('更新CSS颜色失败:', error.message);
        throw error;
    }
}

// 更新所有HTML文件中的域名
function updateDomainInHTML(domain) {
    try {
        // 查找所有HTML文件
        const htmlFiles = [
            path.join(__dirname, 'index.html'),
            path.join(__dirname, 'detail.html'),
            path.join(__dirname, 'pages', 'about.html'),
            path.join(__dirname, 'pages', 'privacy.html'),
            path.join(__dirname, 'pages', 'terms.html'),
            path.join(__dirname, 'pages', 'category.html')
        ];
        
        // 提取域名部分（去掉协议和路径）
        const displayDomain = domain.replace(/^https?:\/\//, '').split('/')[0];
        
        // 域名匹配的正则表达式（匹配footer中的域名）
        const footerDomainRegex = /(Copyright © \d{4}(?:-\d{4})?\s+)([^\s]+)(\s+All rights Reserved\.)/g;
        
        // 域名匹配的正则表达式（匹配header中的域名，在header-content内的<p class="site-name">标签）
        const headerDomainRegex = /(<p class="site-name">)([^<]+)(<\/p>)/g;
        
        let updatedCount = 0;
        
        htmlFiles.forEach(filePath => {
            if (fs.existsSync(filePath)) {
                let htmlContent = fs.readFileSync(filePath, 'utf8');
                let modified = false;
                
                // 1. 更新footer中的域名
                if (htmlContent.includes('footer-copyright') || htmlContent.includes('footer')) {
                    htmlContent = htmlContent.replace(footerDomainRegex, (match, prefix, oldDomain, suffix) => {
                        modified = true;
                        return prefix + displayDomain + suffix;
                    });
                }
                
                // 2. 更新header中的域名（在header-content中的<p class="site-name">标签）
                htmlContent = htmlContent.replace(headerDomainRegex, (match, openTag, oldDomain, closeTag) => {
                    modified = true;
                    return openTag + displayDomain + closeTag;
                });
                
                if (modified) {
                    fs.writeFileSync(filePath, htmlContent, 'utf8');
                    updatedCount++;
                    console.log(`✓ 已更新: ${path.relative(__dirname, filePath)}`);
                } else {
                    console.log(`○ 跳过（无需更新）: ${path.relative(__dirname, filePath)}`);
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

// 更新 BaseURL.js 中的 BASE_URL（只修改这一行）
function updateBaseURL(info, json) {
    try {
        const baseURLPath = path.join(__dirname, 'public', 'js', 'BaseURL.js');
        let jsContent = fs.readFileSync(baseURLPath, 'utf8');
        let hasChanges = false;

        // 只修改 BASE_URL 这一行，保持原有格式，只替换 db 后面的数字
        // 精确匹配 export const BASE_URL 这一行，只替换 URL 中 /db 后面的数字
        const baseURLRegex = /(export\s+const\s+BASE_URL\s*=\s*["'])(https?:\/\/[^"']*\/db)(\d+)(\.json["'])/;
        if (baseURLRegex.test(jsContent)) {
            jsContent = jsContent.replace(baseURLRegex, (match, prefix, urlPrefix, oldJson, suffix) => {
                // 只替换 /db 后面的数字部分
                if (oldJson !== json) {
                    hasChanges = true;
                    const newUrl = urlPrefix + json + suffix;
                    console.log(`  ✓ BASE_URL 已更新: db${oldJson} -> db${json}`);
                    return prefix + newUrl;
                }
                return match;
            });
        } else {
            // 备用方案：如果上面的正则不匹配，使用更通用的匹配方式
            const fallbackRegex = /(export\s+const\s+BASE_URL\s*=\s*["'])(https?:\/\/[^"']+)(["'])/;
            if (fallbackRegex.test(jsContent)) {
                jsContent = jsContent.replace(fallbackRegex, (match, prefix, url, suffix) => {
                    // 只替换 /db 或 db 后面的数字（支持 /db3.json 或 db3.json 格式）
                    const newUrl = url.replace(/(\/?)db\d+/, `$1db${json}`);
                    if (newUrl !== url) {
                        hasChanges = true;
                        console.log(`  ✓ BASE_URL 已更新: ${url} -> ${newUrl}`);
                        return prefix + newUrl + suffix;
                    }
                    return match;
                });
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
        
    } catch (error) {
        console.error('\n✗ 执行失败:', error.message);
        process.exit(1);
    }
}

// 运行主函数
main();