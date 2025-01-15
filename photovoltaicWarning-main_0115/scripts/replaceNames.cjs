const fs = require('fs');
const path = require('path');

// 设置目标目录为 'src'
const directoryPath = path.join(__dirname, '../src'); // 相对路径，指向项目中的 'src' 目录
const oldName = '风机'; // 需要替换的中文名
const newName = '光伏机器'; // 替换成的新中文名

function replaceInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const updatedContent = content.replace(new RegExp(oldName, 'g'), newName);

  if (updatedContent !== content) {
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function traverseDirectory(directory) {
  const files = fs.readdirSync(directory);
  files.forEach((file) => {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverseDirectory(fullPath); // 递归遍历子目录
    } else if (fullPath.endsWith('.vue') || fullPath.endsWith('.js')) {
      replaceInFile(fullPath); // 替换文件中的中文名
    }
  });
}

traverseDirectory(directoryPath);
