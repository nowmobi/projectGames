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

// 计算对比色（用于文本颜色）
function calculateContrastColor(hexColor) {
    // 移除可能的 # 前缀
    const hex = hexColor.replace('#', '');
    
    // 解析RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // 计算感知亮度（使用标准公式）
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
    
    // 如果背景色较亮（亮度 > 128），使用深色文字；否则使用浅色文字
    if (luminance > 128) {
        return '#333333';
    } else {
        return '#ffffff';
    }
}

// 更新CSS中的theme-color颜色
function updateCSSColor(color) {
    try {
        const cssPath = path.join(__dirname, 'public', 'style', 'inpublic.css');
        let cssContent = fs.readFileSync(cssPath, 'utf8');
        
        // 使用正则表达式替换 --theme-color 的值
        const themeColorRegex = /(--theme-color:\s*)([^;]+)/;
        const newValue = `$1${color}`;
        
        // 计算logo颜色（根据主题色自动计算对比色）
        const logoColor = calculateContrastColor(color);
        const logoColorRegex = /(--logo-color:\s*)([^;]+)/;
        const newLogoValue = `$1${logoColor}`;
        
        let hasChanges = false;
        
        if (themeColorRegex.test(cssContent)) {
            cssContent = cssContent.replace(themeColorRegex, newValue);
            hasChanges = true;
        }
        
        if (logoColorRegex.test(cssContent)) {
            cssContent = cssContent.replace(logoColorRegex, newLogoValue);
            hasChanges = true;
        }
        
        if (hasChanges) {
            fs.writeFileSync(cssPath, cssContent, 'utf8');
            console.log(`✓ CSS颜色已更新: ${cssPath}`);
            console.log(`  theme-color: ${color}`);
            console.log(`  logo-color: ${logoColor}`);
        } else {
            // 如果没有找到，在:root中添加
            if (cssContent.includes(':root')) {
                cssContent = cssContent.replace(
                    /(:root\s*\{[^}]*)/,
                    `$1\n    --theme-color: ${color};\n    --logo-color: ${logoColor};`
                );
            } else {
                cssContent = `:root {\n    --theme-color: ${color};\n    --logo-color: ${logoColor};\n}\n\n${cssContent}`;
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
        
        // 处理域名，移除协议前缀（如果有）
        const cleanDomain = domain.replace(/^https?:\/\//, '').split('/')[0];
        
        // 更灵活的正则表达式，匹配所有包含版权信息的地方
        // 匹配格式：Copyright © 2021-2025 [域名] All rights Reserved.
        // 支持匹配在任意标签中的版权信息
        const domainRegex = /Copyright © \d{4}-\d{4}\s+[^\s<>]+ All rights Reserved\./g;
        
        let updatedCount = 0;
        let totalReplaced = 0;
        
        htmlFiles.forEach(filePath => {
            if (fs.existsSync(filePath)) {
                let htmlContent = fs.readFileSync(filePath, 'utf8');
                let fileModified = false;
                let replacedInFile = 0;
                
                   // 更新顶部header中的域名（只匹配header-content中的p标签）
                const headerContentRegex = /(<div class="header-content">[\s\S]*?<p>)([^<>]+)(<\/p>[\s\S]*?<\/div>)/;
                if (headerContentRegex.test(htmlContent)) {
                    htmlContent = htmlContent.replace(headerContentRegex, (match, before, content, after) => {
                        if (content && content.includes('.')) {
                            fileModified = true;
                            replacedInFile++;
                            return `${before}${cleanDomain}${after}`;
                        }
                        return match;
                    });
                }
                
                // 检查是否包含版权信息
                if (htmlContent.includes('Copyright ©')) {
                    // 替换所有匹配的版权信息中的域名
                    htmlContent = htmlContent.replace(domainRegex, (match) => {
                        // 提取年份部分
                        const yearMatch = match.match(/Copyright © (\d{4}-\d{4})/);
                        const years = yearMatch ? yearMatch[1] : '2021-2025';
                        
                        // 构建新的版权文本
                        const newCopyrightText = `Copyright © ${years} ${cleanDomain} All rights Reserved.`;
                        
                        fileModified = true;
                        replacedInFile++;
                        return newCopyrightText;
                    });
                }
                
                if (fileModified) {
                    fs.writeFileSync(filePath, htmlContent, 'utf8');
                    updatedCount++;
                    totalReplaced += replacedInFile;
                    console.log(`✓ 已更新: ${path.relative(__dirname, filePath)} (替换 ${replacedInFile} 处)`);
                } else {
                    console.log(`○ 无需更新: ${path.relative(__dirname, filePath)}`);
                }
            } else {
                console.log(`○ 文件不存在: ${path.relative(__dirname, filePath)}`);
            }
        });
        
        console.log(`✓ 共更新 ${updatedCount} 个HTML文件，替换 ${totalReplaced} 处域名`);
        
    } catch (error) {
        console.error('更新HTML域名失败:', error.message);
        throw error;
    }
}

// 更新 BaseURL.js 中的 infoType 和 BASE_URL（第一行）
function updateBaseURL(info, json) {
    try {
        const baseURLPath = path.join(__dirname, 'public', 'js', 'BaseURL.js');
        let jsContent = fs.readFileSync(baseURLPath, 'utf8');
        let hasChanges = false;

        // 从现有的 BASE_URL 中提取基础 URL（第一行）
        const baseURLMatch = jsContent.match(/export\s+const\s+BASE_URL\s*=\s*["']([^"']+\/)[^"']*\.json["']/);
        let baseUrlPrefix = '';
        
        if (baseURLMatch) {
            baseUrlPrefix = baseURLMatch[1];
            console.log(`  检测到基础 URL: ${baseUrlPrefix}`);
        } else {
            console.warn('  警告: 未能提取基础 URL，将使用完整替换');
        }

        // 根据 info 值修改 infoType
        const infoTypeRegex = /const\s+infoType\s*=\s*['"]info\d+['"]/;
        if (infoTypeRegex.test(jsContent)) {
            jsContent = jsContent.replace(infoTypeRegex, `const infoType = 'info${info}'`);
            hasChanges = true;
            console.log(`  ✓ infoType 已更新为: info${info}`);
        }

        // 根据 json 值修改 BASE_URL 第一行
        if (baseUrlPrefix) {
            // 使用提取的基础 URL 前缀进行替换
            const baseURLRegex = /export\s+const\s+BASE_URL\s*=\s*["']https?:\/\/[^"']+\.json["']/;
            if (baseURLRegex.test(jsContent)) {
                jsContent = jsContent.replace(baseURLRegex, `export const BASE_URL = "${baseUrlPrefix}db${json}.json"`);
                hasChanges = true;
                console.log(`  ✓ BASE_URL (第1行) 已更新为: ${baseUrlPrefix}db${json}.json`);
            }
        } else {
            // 如果无法提取基础 URL，使用简单的数字替换
            const dbNumberRegex = /(export\s+const\s+BASE_URL\s*=\s*["']https?:\/\/[^"']+\/db)(\d+)(\.json["'])/;
            if (dbNumberRegex.test(jsContent)) {
                jsContent = jsContent.replace(dbNumberRegex, `$1${json}$3`);
                hasChanges = true;
                console.log(`  ✓ BASE_URL (第1行) 已更新为 db${json}.json`);
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

