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





// 根据背景色计算最佳文字颜色（白色或黑色）
function calculateTextColor(backgroundColor) {
    try {
        // 移除 # 号
        const hex = backgroundColor.replace('#', '');
        
        // 解析 RGB
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        // 计算亮度（使用人眼对颜色的敏感度加权）
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
        
        // 如果亮度 > 128，背景较亮，使用黑色文字
        // 否则使用白色文字
        return luminance > 128 ? '#000000' : '#ffffff';
    } catch (error) {
        console.error('计算文字颜色失败:', error.message);
        return '#ffffff';
    }
}

// 更新CSS中的--primary颜色变量
function updateCSSColor(color) {
    try {
        const cssPath = path.join(__dirname, 'public', 'style', 'inpublic.css');
        let cssContent = fs.readFileSync(cssPath, 'utf8');
        
        // 计算最佳文字颜色
        const textColor = calculateTextColor(color);
        
        // 使用正则表达式替换 --primary 变量的值
        const primaryRegex = /(--primary:\s*)([^;]+)/;
        const newPrimaryValue = `$1${color}`;
        
        // 使用正则表达式替换 --text-color 变量的值
        const textColorRegex = /(--text-color:\s*)([^;]+)/;
        const newTextColorValue = `$1${textColor}`;
        
        let hasChanges = false;
        
        if (primaryRegex.test(cssContent)) {
            cssContent = cssContent.replace(primaryRegex, newPrimaryValue);
            hasChanges = true;
        }
        
        if (textColorRegex.test(cssContent)) {
            cssContent = cssContent.replace(textColorRegex, newTextColorValue);
            hasChanges = true;
        }
        
        if (hasChanges) {
            fs.writeFileSync(cssPath, cssContent, 'utf8');
            console.log(`  ✓ --primary 已更新为: ${color}`);
            console.log(`  ✓ --text-color 已更新为: ${textColor}`);
        } else {
            // 如果没有找到变量，在:root中添加
            if (cssContent.includes(':root')) {
                cssContent = cssContent.replace(
                    /(:root\s*\{[^}]*)/,
                    `$1\n    --primary: ${color};\n    --text-color: ${textColor};`
                );
            } else {
                cssContent = `:root {\n    --primary: ${color};\n    --text-color: ${textColor};\n}\n\n${cssContent}`;
            }
            fs.writeFileSync(cssPath, cssContent, 'utf8');
            console.log(`  ✓ --primary 已添加: ${color}`);
            console.log(`  ✓ --text-color 已添加: ${textColor}`);
        }
    } catch (error) {
        console.error('更新CSS --primary颜色变量失败:', error.message);
        throw error;
    }
}

// 更新所有HTML文件中的域名（包括顶部和底部）
function updateDomainInHTML(domain) {
    try {
        // 查找所有HTML文件
        const htmlFiles = [
            path.join(__dirname, 'index.html'),
            path.join(__dirname, 'detail.html'),
            path.join(__dirname, 'pages', 'privacy.html'),
            path.join(__dirname, 'pages', 'terms.html'),
            path.join(__dirname, 'pages', 'category.html')
        ];
        
        let updatedCount = 0;
        
        htmlFiles.forEach(filePath => {
            if (fs.existsSync(filePath)) {
                let htmlContent = fs.readFileSync(filePath, 'utf8');
                let modified = false;
                
                // 更新顶部header中的域名
                // 匹配 <p>域名</p> 格式
                const headerDomainRegex = /<p>[^<]+<\/p>/gi;
                htmlContent = htmlContent.replace(headerDomainRegex, (match) => {
                    // 只替换header-content中的域名
                    if (match.includes('.') && match.length < 100) {
                        modified = true;
                        return `<p>${domain}</p>`;
                    }
                    return match;
                });
                
                // 更新footer中的footer-brand
                const footerBrandRegex = /(<div class="footer-brand">)[\s\S]*?(<\/div>)/is;
                htmlContent = htmlContent.replace(footerBrandRegex, (match, prefix, suffix) => {
                    modified = true;
                    return `${prefix}${domain}${suffix}`;
                });
                
                // 更新footer中的footer-copyright-text
                // 匹配多种格式的footer-copyright-text
                const footerCopyrightRegex = /(<div class="footer-copyright-text">.*?© \d{4}\s+)([^\s]+)(.*?<\/div>)/is;
                htmlContent = htmlContent.replace(footerCopyrightRegex, (match, prefix, oldDomain, suffix) => {
                    modified = true;
                    return `${prefix}${domain}${suffix}`;
                });
                
                if (modified) {
                    fs.writeFileSync(filePath, htmlContent, 'utf8');
                    updatedCount++;
                    console.log(`  ✓ 已更新: ${path.basename(filePath)}`);
                }
            }
        });
        
        console.log(`\n✓ 共更新了 ${updatedCount} 个HTML文件中的域名`);
        
    } catch (error) {
        console.error('更新HTML域名失败:', error.message);
        throw error;
    }
}

// 更新 BaseURL.js 中的第一行 BASE_URL
function updateBaseURL(json) {
    try {
        const baseURLPath = path.join(__dirname, 'public', 'js', 'BaseURL.js');
        let jsContent = fs.readFileSync(baseURLPath, 'utf8');
        
        // 将内容按行分割
        const lines = jsContent.split('\n');
        
        // 只修改第一行（索引为0）
        if (lines.length > 0) {
            // 从现有的 BASE_URL 中提取基础 URL 路径
            const baseURLMatch = lines[0].match(/export\s+const\s+BASE_URL\s*=\s*["']([^"']+\/)[^"']*\.json["']/);
            let baseUrlPrefix = '';
            
            if (baseURLMatch) {
                baseUrlPrefix = baseURLMatch[1];
            } else {
                // 如果没有匹配到，使用默认格式
                baseUrlPrefix = 'https://datajson.pages.dev/games5/';
            }
            
            // 更新第一行为新的 BASE_URL
            lines[0] = `export const BASE_URL = "${baseUrlPrefix}db${json}.json";`;
            
            // 重新组合内容
            jsContent = lines.join('\n');
            
            // 写入文件
            fs.writeFileSync(baseURLPath, jsContent, 'utf8');
            console.log(`  ✓ BaseURL.js 第一行已更新为: ${lines[0]}`);
        } else {
            throw new Error('BaseURL.js 文件为空');
        }
    } catch (error) {
        console.error('更新 BaseURL.js 失败:', error.message);
        throw error;
    }
}

// 主函数
async function main() {
    try {
        // 1. 读取配置
        const config = readConfig();
        
        // 2. 更新CSS颜色
        updateCSSColor(config.color);
        
        // 3. 更新HTML域名
        updateDomainInHTML(config.domain);
        
        // 4. 更新 BaseURL.js 第一行
        if (config.json) {
            console.log('');
            updateBaseURL(config.json);
        }
        
        console.log('✓ 所有更新完成！');
        
    } catch (error) {
        console.error('执行失败:', error.message);
        process.exit(1);
    }
}

// 运行主函数
main();

