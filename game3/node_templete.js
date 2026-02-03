const fs = require('fs');
const path = require('path');

// 计算颜色的亮度并返回对比色
function getContrastColor(hexColor) {
    // 移除 # 号
    const hex = hexColor.replace('#', '');
    
    // 解析 RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // 计算亮度 (使用标准亮度公式)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    // 如果亮度大于128，使用黑色文本；否则使用白色文本
    return brightness > 128 ? '#000' : '#fff';
}

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

// 更新CSS中的theme-color颜色
function updateCSSColor(color) {
    try {
        const cssPath = path.join(__dirname, 'public', 'style', 'inpublic.css');
        let cssContent = fs.readFileSync(cssPath, 'utf8');
        
        // 计算对比色
        const contrastColor = getContrastColor(color);
        
        // 使用正则表达式替换 --theme-color 的值
        const themeRegex = /(--theme-color:\s*)([^;]+)/;
        const newThemeValue = `$1${color}`;
        
        // 使用正则表达式替换 --text-color 的值
        const textRegex = /(--text-color:\s*)([^;]+)/;
        const newTextValue = `$1${contrastColor}`;
        
        let modified = false;
        
        if (themeRegex.test(cssContent)) {
            cssContent = cssContent.replace(themeRegex, newThemeValue);
            modified = true;
        }
        
        if (textRegex.test(cssContent)) {
            cssContent = cssContent.replace(textRegex, newTextValue);
            modified = true;
        }
        
        if (modified) {
            fs.writeFileSync(cssPath, cssContent, 'utf8');
            console.log(`✓ CSS颜色已更新: ${cssPath}`);
            console.log(`  主题色: ${color}`);
            console.log(`  文本色: ${contrastColor}`);
        } else {
            // 如果没有找到，在:root中添加
            if (cssContent.includes(':root')) {
                cssContent = cssContent.replace(
                    /(:root\s*\{[^}]*)/,
                    `$1\n    --theme-color: ${color};\n    --text-color: ${contrastColor};`
                );
            } else {
                cssContent = `:root {\n    --theme-color: ${color};\n    --text-color: ${contrastColor};\n}\n\n${cssContent}`;
            }
            fs.writeFileSync(cssPath, cssContent, 'utf8');
            console.log(`✓ CSS颜色已添加: ${cssPath}`);
            console.log(`  主题色: ${color}`);
            console.log(`  文本色: ${contrastColor}`);
        }
    } catch (error) {
        console.error('更新CSS颜色失败:', error.message);
        throw error;
    }
}

// 更新所有HTML文件中的域名
function updateDomainInHTML(domain) {
    try {
        // 提取域名（去掉协议和路径）
        const displayDomain = domain.replace(/^https?:\/\//, '').split('/')[0];
        
        // 获取当前年份
        const currentYear = new Date().getFullYear();
        
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
                
                // 1. 更新footer中的域名
                // 匹配格式: "© 2025 kvgame.top All rights reserved."
                // 支持年份变化，域名部分会被替换
                if (htmlContent.includes('footer-copyright') || htmlContent.includes('footer')) {
                    // 创建新的正则表达式（每次循环都重新创建，避免lastIndex问题）
                    const domainRegex = /(©\s+\d{4}\s+)[^\s]+(\s+All rights reserved\.)/g;
                    const newCopyrightText = `$1${displayDomain}$2`;
                    
                    // 替换域名（保留年份）
                    const originalContent = htmlContent;
                    htmlContent = htmlContent.replace(domainRegex, newCopyrightText);
                    
                    if (htmlContent !== originalContent) {
                        modified = true;
                    }
                }
                
                // 2. 更新header中的域名（logo部分）
                // 匹配格式: <span class="logo-text">sec.bjllz.top</span>
                if (htmlContent.includes('logo-text')) {
                    const logoRegex = /(<span\s+class=["']logo-text["']>)([^<]+)(<\/span>)/g;
                    const newLogoText = `$1${displayDomain}$3`;
                    
                    const originalContent = htmlContent;
                    htmlContent = htmlContent.replace(logoRegex, newLogoText);
                    
                    if (htmlContent !== originalContent) {
                        modified = true;
                    }
                }
                
                if (modified) {
                    fs.writeFileSync(filePath, htmlContent, 'utf8');
                    updatedCount++;
                    console.log(`✓ 已更新: ${path.relative(__dirname, filePath)}`);
                } else {
                    console.log(`○ 未找到匹配项: ${path.relative(__dirname, filePath)}`);
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


// 更新 inpublic.js 中的域名
function updateDomainInJS(domain) {
    try {
        // 提取域名（去掉协议和路径）
        const displayDomain = domain.replace(/^https?:\/\//, '').split('/')[0];
        
        const jsPath = path.join(__dirname, 'public', 'js', 'inpublic.js');
        let jsContent = fs.readFileSync(jsPath, 'utf8');
        
        // 查找并替换域名部分
        // 匹配: const domain = 'xxx'; 或 const domain = "xxx";
        const domainRegex = /const domain = ['"][^'"]+['"];/;
        
        if (domainRegex.test(jsContent)) {
            jsContent = jsContent.replace(domainRegex, `const domain = '${displayDomain}';`);
            fs.writeFileSync(jsPath, jsContent, 'utf8');
            console.log(`✓ inpublic.js 中的域名已更新为: ${displayDomain}`);
        } else {
            console.log(`○ inpublic.js 中未找到域名配置`);
        }
        
    } catch (error) {
        console.error('更新 inpublic.js 域名失败:', error.message);
        throw error;
    }
}

// 更新 BaseURL.js 中的第1行 BASE_URL（只修改json数字）
function updateBaseURL(info, json, domain) {
    try {
        const baseURLPath = path.join(__dirname, 'public', 'js', 'BaseURL.js');
        let jsContent = fs.readFileSync(baseURLPath, 'utf8');
        const lines = jsContent.split('\n');
        let hasChanges = false;

        // 只修改第1行（索引0）的 BASE_URL，只更新 db 后面的数字
        if (lines.length > 0) {
            const firstLine = lines[0];
            // 匹配第1行的 BASE_URL，只替换 db 后面的数字部分
            const baseURLRegex = /(export\s+const\s+BASE_URL\s*=\s*["']https?:\/\/[^"']+\/db)(\d+)(\.json["'])/;
            if (baseURLRegex.test(firstLine)) {
                lines[0] = firstLine.replace(baseURLRegex, `$1${json}$3`);
                hasChanges = true;
                console.log(`  ✓ BaseURL.js 第1行已更新: db${json}.json`);
            }
        }

        if (hasChanges) {
            jsContent = lines.join('\n');
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
        
        // 4. 更新JS中的域名
        updateDomainInJS(config.domain);
        console.log('');
        
        // 5. 更新BaseURL
        updateBaseURL(config.info, config.json, config.domain);
        console.log('');
        
        console.log('✓ 所有更新完成！');
        
    } catch (error) {
        console.error('\n✗ 执行失败:', error.message);
        process.exit(1);
    }
}

// 运行主函数
main();

