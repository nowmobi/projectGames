const https = require('https');
const fs = require('fs');
const path = require('path');

// 创建 fonts 目录
const fontsDir = path.join(__dirname, 'fonts');
if (!fs.existsSync(fontsDir)) {
    fs.mkdirSync(fontsDir, { recursive: true });
    console.log('✓ 已创建 fonts 目录');
}

// Rubik-Bold.ttf 的下载链接（使用 GitHub raw 链接）
const fontUrl = 'https://github.com/google/fonts/raw/main/ofl/rubik/Rubik-Bold.ttf';
const fontPath = path.join(fontsDir, 'Rubik-Bold.ttf');

console.log('开始下载 Rubik-Bold.ttf 字体...');
console.log(`下载地址: ${fontUrl}`);
console.log(`保存路径: ${fontPath}`);

// 下载字体文件
const file = fs.createWriteStream(fontPath);
https.get(fontUrl, (response) => {
    if (response.statusCode === 302 || response.statusCode === 301) {
        // 处理重定向
        https.get(response.headers.location, (redirectResponse) => {
            redirectResponse.pipe(file);
            file.on('finish', () => {
                file.close();
                const stats = fs.statSync(fontPath);
                console.log(`✓ 字体下载完成！`);
                console.log(`  文件大小: ${(stats.size / 1024).toFixed(2)} KB`);
                console.log(`  文件路径: ${fontPath}`);
            });
        });
    } else {
        response.pipe(file);
        file.on('finish', () => {
            file.close();
            const stats = fs.statSync(fontPath);
            console.log(`✓ 字体下载完成！`);
            console.log(`  文件大小: ${(stats.size / 1024).toFixed(2)} KB`);
            console.log(`  文件路径: ${fontPath}`);
        });
    }
}).on('error', (err) => {
    fs.unlink(fontPath, () => {}); // 删除不完整的文件
    console.error('✗ 下载失败:', err.message);
    console.log('\n提示: 如果下载失败，您可以手动下载:');
    console.log('1. 访问: https://fonts.google.com/specimen/Rubik');
    console.log('2. 点击 "Download family" 下载字体包');
    console.log('3. 解压后找到 Rubik-Bold.ttf 文件');
    console.log(`4. 将文件复制到: ${fontsDir}`);
    process.exit(1);
});

