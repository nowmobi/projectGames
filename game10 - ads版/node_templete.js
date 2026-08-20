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

// 更新CSS中的primary-color颜色
function updateCSSColor(color) {
    try {
        const cssPath = path.join(__dirname, 'public', 'style', 'inpublic.css');
        let cssContent = fs.readFileSync(cssPath, 'utf8');
        
        // 使用正则表达式替换 --primary-color 的值
        const regex = /(--primary-color:\s*)([^;]+)/;
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
                    `$1\n    --primary-color: ${color};`
                );
            } else {
                cssContent = `:root {\n    --primary-color: ${color};\n}\n\n${cssContent}`;
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
        
        // 获取当前年份
        const currentYear = new Date().getFullYear();
        
        // 新的版权文本格式（使用当前年份）
        const newCopyrightText = `© ${currentYear} ${domain}. All Rights Reserved.`;
        
        // 域名匹配的正则表达式（匹配footer中的域名，支持多种格式）
        // 匹配格式1: "© 2025 Gameeden. All Rights Reserved."
        // 匹配格式2: "Copyright © 2021-2025 play.xqyxgame.fun All rights Reserved."
        // 匹配格式3: "© 2021-2025 domain.com All Rights Reserved."
        // 域名部分可以包含字母、数字、点号和连字符
        const domainRegex1 = /©\s+\d{4}(-\d{4})?\s+[^\s]+\.?\s+All\s+Rights?\s+Reserved\./gi;
        const domainRegex2 = /Copyright\s+©\s+\d{4}(-\d{4})?\s+[^\s]+\.?\s+All\s+rights?\s+Reserved\./gi;
        
        let updatedCount = 0;
        
        htmlFiles.forEach(filePath => {
            if (fs.existsSync(filePath)) {
                let htmlContent = fs.readFileSync(filePath, 'utf8');
                const originalContent = htmlContent;
                let modified = false;
                
                // 1. 更新header中的logo域名
                const logoDomainRegex = /(<a\s+[^>]*class=["']logo["'][^>]*>\s*<p>)([^<]+)(<\/p>\s*<\/a>)/gi;
                htmlContent = htmlContent.replace(logoDomainRegex, (match, openTag, oldDomain, closeTag) => {
                    modified = true;
                    return `${openTag}${domain}${closeTag}`;
                });
                
                // 2. 更新footer中的版权域名
                if (htmlContent.includes('footer-copyright') || htmlContent.includes('footer')) {
                    // 先尝试匹配格式1（© 开头的格式）
                    htmlContent = htmlContent.replace(domainRegex1, (match) => {
                        modified = true;
                        return newCopyrightText;
                    });
                    
                    // 再尝试匹配格式2（Copyright 开头的格式）
                    htmlContent = htmlContent.replace(domainRegex2, (match) => {
                        modified = true;
                        return newCopyrightText;
                    });
                    
                    // 如果都没有匹配到，尝试在footer-copyright-text中查找并替换
                    if (!modified) {
                        const footerTextRegex = /(<div\s+class=["']footer-copyright-text["']>)(.*?)(<\/div>)/gi;
                        htmlContent = htmlContent.replace(footerTextRegex, (match, openTag, content, closeTag) => {
                            // 如果内容中包含域名相关的文本，替换它
                            if (content.match(/©|Copyright|All\s+Rights?\s+Reserved/i)) {
                                modified = true;
                                return `${openTag}${newCopyrightText}${closeTag}`;
                            }
                            return match;
                        });
                    }
                }
                
                if (modified && htmlContent !== originalContent) {
                    fs.writeFileSync(filePath, htmlContent, 'utf8');
                    updatedCount++;
                    console.log(`✓ 已更新: ${path.relative(__dirname, filePath)}`);
                } else {
                    console.log(`○ 未找到域名（无需更新）: ${path.relative(__dirname, filePath)}`);
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

// 更新 BaseURL.js 第1行中的 json 数字和 infoType
function updateBaseURL(info, json) {
    try {
        const baseURLPath = path.join(__dirname, 'public', 'js', 'BaseURL.js');
        let jsContent = fs.readFileSync(baseURLPath, 'utf8');
        const originalContent = jsContent;
        let hasChanges = false;

        // 只修改第1行的 BASE_URL 中的 db 数字
        // 匹配格式: export const BASE_URL = "...db1.json"
        const baseURLRegex = /(export\s+const\s+BASE_URL\s*=\s*["'][^"']*\/db)\d+(\.json["'])/;
        if (baseURLRegex.test(jsContent)) {
            jsContent = jsContent.replace(baseURLRegex, `$1${json}$2`);
            hasChanges = true;
            console.log(`  ✓ BASE_URL 第1行的 json 数字已更新为: db${json}.json`);
        }

        // 根据 info 值修改 infoType
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