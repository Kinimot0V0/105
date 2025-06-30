import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { dirname, join, extname } from 'path'
import { fileURLToPath } from 'url'

/* ************ 需要用户修改的部分 ************ */
const __dirname = dirname(fileURLToPath(import.meta.url))
const targetDir = join(__dirname, 'src/components/addModel') // 修改为目标目录路径
const replacements = {
  inverter: 'device', // 格式：原内容: 新内容
  Inverter: 'Device'
}
/* ************ 修改结束 ************ */

// 递归处理目录函数
function processDirectory(dirPath) {
  const files = readdirSync(dirPath)

  files.forEach((file) => {
    const filePath = join(dirPath, file)
    const stats = statSync(filePath)

    if (stats.isDirectory()) {
      processDirectory(filePath) // 递归处理子目录
    } else if (stats.isFile() && extname(filePath) === '.vue') {
      processFile(filePath) // 只处理.vue文件
    }
  })
}

// 处理单个文件函数
function processFile(filePath) {
  try {
    let content = readFileSync(filePath, 'utf8')
    let modified = false

    // 执行替换
    Object.entries(replacements).forEach(([oldStr, newStr]) => {
      const regex = new RegExp(escapeRegExp(oldStr), 'g')
      const newContent = content.replace(regex, newStr)

      if (newContent !== content) {
        modified = true
        content = newContent
      }
    })

    // 只有内容变化时才写入
    if (modified) {
      writeFileSync(filePath, content, 'utf8')
      console.log(`已更新：${filePath}`)
    }
  } catch (error) {
    console.error(`处理文件失败：${filePath}`, error)
  }
}

// 辅助函数
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// 启动处理
console.log('开始批量替换...')
processDirectory(targetDir)
console.log('所有文件处理完成！')
