const fs = require('fs');
const path = require('path');

// 读取配置文件
function readConfig() {
    try {
        const configPath = path.join(__dirname, 'config.json');
        const configContent = fs.readFileSync(configPath, 'utf8');
        const config = JSON.parse(configContent);
        
        if (!config.color || !config.domain || !config.info || !config.json) {
            throw new Error('配置文件中缺少 color、domain、info 或 json 字段');
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
        
        // 域名匹配的正则表达式（匹配footer中的域名）
        // 匹配类似 "© 2025 kugame.top All Rights Reserved."
        // 支持单一年份或年份范围，保持原有年份格式
        const footerDomainRegex = /(©\s+\d{4}(-\d{4})?\s+)[^\s]+(\s+All Rights Reserved\.)/g;
        
        // 顶部域名匹配的正则表达式（匹配logo标签中的域名）
        const headerDomainRegex = /(<a[^>]*class="logo"[^>]*>\s*<p>)[^<]+(<\/p>\s*<\/a>)/gs;
        
        let updatedCount = 0;
        
        htmlFiles.forEach(filePath => {
            if (fs.existsSync(filePath)) {
                let htmlContent = fs.readFileSync(filePath, 'utf8');
                let modified = false;
                
                // 更新footer中的域名
                if (htmlContent.includes('footer-copyright') || htmlContent.includes('footer')) {
                    htmlContent = htmlContent.replace(footerDomainRegex, (match, prefix, yearRange, suffix) => {
                        modified = true;
                        return `${prefix}${domain}${suffix}`;
                    });
                }
                
                // 更新header中的域名
                if (htmlContent.includes('class="logo"')) {
                    htmlContent = htmlContent.replace(headerDomainRegex, (match, prefix, suffix) => {
                        modified = true;
                        return `${prefix}${domain}${suffix}`;
                    });
                }
                
                if (modified) {
                    fs.writeFileSync(filePath, htmlContent, 'utf8');
                    updatedCount++;
                    console.log(`✓ 已更新: ${path.relative(__dirname, filePath)}`);
                } else {
                    console.log(`○ 未找到匹配的域名格式: ${path.relative(__dirname, filePath)}`);
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

// 更新 BaseURL.js 第1行中的 JSON 数字和 infoType
function updateBaseURL(info, json) {
    try {
        const baseURLPath = path.join(__dirname, 'public', 'js', 'BaseURL.js');
        let jsContent = fs.readFileSync(baseURLPath, 'utf8');
        let hasChanges = false;
        
        // 只修改第1行的 BASE_URL，替换 db{数字}.json 中的数字
        // 匹配: export const BASE_URL = "...db{数字}.json";
        const baseURLRegex = /(export\s+const\s+BASE_URL\s*=\s*["'][^"']*\/db)\d+(\.json["'])/;
        
        if (baseURLRegex.test(jsContent)) {
            jsContent = jsContent.replace(baseURLRegex, `$1${json}$2`);
            hasChanges = true;
            console.log(`  ✓ BaseURL.js 第1行已更新: db${json}.json`);
        } else {
            console.log(`  ○ BaseURL.js 第1行未找到匹配的格式`);
        }

        // 根据 info 值修改 infoType（在 getCategoryOrder 函数内）
        const infoTypeRegex = /export\s+async\s+function\s+getCategoryOrder\(\)\s*\{[^\}]*?const\s+infoType\s*=\s*['"](info\d+)['"][^\}]*\}/s;
        if (infoTypeRegex.test(jsContent)) {
            jsContent = jsContent.replace(infoTypeRegex, (match) => {
                return match.replace(/const\s+infoType\s*=\s*['"](info\d+)['"]/, `const infoType = 'info${info}'`);
            });
            hasChanges = true;
            console.log(`  ✓ infoType 已更新为: info${info}`);
        }

        if (hasChanges) {
            fs.writeFileSync(baseURLPath, jsContent, 'utf8');
            console.log(`✓ BaseURL.js 已更新: ${baseURLPath}`);
        } else {
            console.log(`○ BaseURL.js 无需更新`);
        }
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
        
        // 4. 更新BaseURL.js第1行的JSON数字和infoType
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