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
        // 查找所有HTML文件
        const htmlFiles = [
            path.join(__dirname, 'index.html'),
            path.join(__dirname, 'detail.html'),
            path.join(__dirname, 'pages', 'about.html'),
            path.join(__dirname, 'pages', 'privacy.html'),
            path.join(__dirname, 'pages', 'terms.html'),
            path.join(__dirname, 'pages', 'category.html')
        ];
        
        // 处理域名：去掉协议和路径，只保留主域名
        const displayDomain = domain.replace(/^https?:\/\//, '').split('/')[0];
        
        // 匹配 footer-brand 中的域名：<div class="footer-brand">域名</div>
        const brandRegex = /(<div\s+class=["']footer-brand["']>)([^<]+)(<\/div>)/g;
        
        // 匹配 footer-copyright 中的域名：©年份 域名 All Rights Reserved.
        // 支持格式：©2024、©2025、©2021-2025 等
        const copyrightRegex = /(©\d{4}(?:-\d{4})?)\s+([^\s]+)\s+(All Rights Reserved\.)/g;
        
        // 匹配顶部logo中的域名：<div class="logo"><p>域名</p></div>
        const logoRegex = /(<div\s+class=["']logo["']>\s*<p>)([^<]+)(<\/p>\s*<\/div>)/g;
        
        let updatedCount = 0;
        
        htmlFiles.forEach(filePath => {
            if (fs.existsSync(filePath)) {
                let htmlContent = fs.readFileSync(filePath, 'utf8');
                let modified = false;
                
                // 只更新包含footer或logo的文件
                if (htmlContent.includes('footer-copyright') || htmlContent.includes('footer-brand') || htmlContent.includes('footer') || htmlContent.includes('logo')) {
                    // 替换顶部logo中的域名
                    htmlContent = htmlContent.replace(logoRegex, (match, openTag, oldDomain, closeTag) => {
                        modified = true;
                        return `${openTag}${displayDomain}${closeTag}`;
                    });
                    
                    // 替换 footer-brand 中的域名
                    htmlContent = htmlContent.replace(brandRegex, (match, openTag, oldDomain, closeTag) => {
                        modified = true;
                        return `${openTag}${displayDomain}${closeTag}`;
                    });
                    
                    // 替换 footer-copyright 中的域名（保留年份）
                    htmlContent = htmlContent.replace(copyrightRegex, (match, yearPart, oldDomain, rightsPart) => {
                        modified = true;
                        return `${yearPart} ${displayDomain} ${rightsPart}`;
                    });
                    
                    if (modified) {
                        fs.writeFileSync(filePath, htmlContent, 'utf8');
                        updatedCount++;
                        console.log(`✓ 已更新: ${path.relative(__dirname, filePath)}`);
                    } else {
                        console.log(`○ 未找到域名（已是最新）: ${path.relative(__dirname, filePath)}`);
                    }
                } else {
                    console.log(`○ 跳过（无footer和logo）: ${path.relative(__dirname, filePath)}`);
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


// 更新 BaseURL.js 中第1行的 BASE_URL
function updateBaseURL(json) {
    try {
        const baseURLPath = path.join(__dirname, 'public', 'js', 'BaseURL.js');
        let jsContent = fs.readFileSync(baseURLPath, 'utf8');
        
        // 只修改第1行的 BASE_URL，替换其中的 db 编号
        // 匹配: export const BASE_URL = "路径/db数字.json"
        const baseURLRegex = /(export\s+const\s+BASE_URL\s*=\s*["'][^"']*\/db)\d+(\.json["'])/;
        
        if (baseURLRegex.test(jsContent)) {
            jsContent = jsContent.replace(baseURLRegex, `$1${json}$2`);
            fs.writeFileSync(baseURLPath, jsContent, 'utf8');
            console.log(`✓ BaseURL.js 第1行已更新: db${json}.json`);
        } else {
            console.log(`○ BaseURL.js 第1行未找到 BASE_URL 或格式不匹配`);
        }
    } catch (error) {
        console.error('更新 BaseURL.js 失败:', error.message);
        throw error;
    }
}


// 更新 BaseURL.js 中第68行的 infoType
function updateInfoType(info) {
    try {
        const baseURLPath = path.join(__dirname, 'public', 'js', 'BaseURL.js');
        let jsContent = fs.readFileSync(baseURLPath, 'utf8');
        
        // 只修改 getCategoryOrder 函数中的 infoType
        // 匹配: const infoType = 'info数字';
        const infoTypeRegex = /(const\s+infoType\s*=\s*['"])info\d+(['"])/;
        
        if (infoTypeRegex.test(jsContent)) {
            jsContent = jsContent.replace(infoTypeRegex, `$1info${info}$2`);
            fs.writeFileSync(baseURLPath, jsContent, 'utf8');
            console.log(`✓ BaseURL.js 第68行已更新: infoType = 'info${info}'`);
        } else {
            console.log(`○ BaseURL.js 第68行未找到 infoType 或格式不匹配`);
        }
    } catch (error) {
        console.error('更新 BaseURL.js 中 infoType 失败:', error.message);
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
        
        // 4. 更新BaseURL.js 第1行
        if (config.json) {
            updateBaseURL(config.json);
            console.log('');
        }
        
         // 5. 更新BaseURL.js 第68行的 infoType
        if (config.info) {
            updateInfoType(config.info);
            console.log('');
        }
        
        console.log('✓ 所有更新完成！');
        
    } catch (error) {
        console.error('\n✗ 执行失败:', error.message);
        process.exit(1);
    }
}

// 运行主函数
main();

