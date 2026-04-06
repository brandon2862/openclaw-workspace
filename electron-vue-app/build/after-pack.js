/**
 * 打包后处理脚本
 * 
 * 这个脚本会在 Electron Builder 打包完成后执行
 * 可以用于清理临时文件、生成报告等操作
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

module.exports = async (context) => {
  console.log('=== 打包后处理开始 ===')
  
  const { appOutDir, outDir, platform, arch } = context
  
  try {
    // 1. 生成构建报告
    console.log('生成构建报告...')
    const report = {
      timestamp: new Date().toISOString(),
      platform: platform.name,
      architecture: arch,
      outputDirectory: appOutDir,
      buildDirectory: outDir,
      files: []
    }
    
    // 遍历输出目录，收集文件信息
    function collectFiles(dir, baseDir = '') {
      const items = fs.readdirSync(dir)
      
      items.forEach(item => {
        const fullPath = path.join(dir, item)
        const relativePath = path.join(baseDir, item)
        const stat = fs.statSync(fullPath)
        
        if (stat.isDirectory()) {
          collectFiles(fullPath, relativePath)
        } else {
          report.files.push({
            path: relativePath,
            size: stat.size,
            modified: stat.mtime
          })
        }
      })
    }
    
    collectFiles(appOutDir)
    
    // 计算总大小
    const totalSize = report.files.reduce((sum, file) => sum + file.size, 0)
    report.totalSize = totalSize
    report.totalFiles = report.files.length
    
    // 保存报告
    const reportPath = path.join(outDir, `build-report-${platform.name}-${arch}.json`)
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    console.log(`构建报告已保存到: ${reportPath}`)
    
    // 2. 清理临时文件
    console.log('清理临时文件...')
    const tempFiles = [
      path.join(outDir, 'builder-effective-config.yaml'),
      path.join(outDir, 'builder-debug.yml')
    ]
    
    tempFiles.forEach(tempFile => {
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile)
        console.log(`已删除: ${tempFile}`)
      }
    })
    
    // 3. 生成版本信息文件
    console.log('生成版本信息文件...')
    const packageJson = require('../package.json')
    const versionInfo = {
      name: packageJson.name,
      version: packageJson.version,
      description: packageJson.description,
      buildTime: new Date().toISOString(),
      platform: platform.name,
      architecture: arch,
      electronVersion: packageJson.devDependencies.electron,
      nodeVersion: process.version
    }
    
    const versionInfoPath = path.join(appOutDir, 'version.json')
    fs.writeFileSync(versionInfoPath, JSON.stringify(versionInfo, null, 2))
    
    // 4. 验证构建结果
    console.log('验证构建结果...')
    const requiredFiles = [
      'resources/',
      'out/',
      'dist/'
    ]
    
    let allFilesExist = true
    requiredFiles.forEach(requiredFile => {
      const checkPath = path.join(appOutDir, requiredFile)
      if (!fs.existsSync(checkPath)) {
        console.error(`缺少必要文件: ${requiredFile}`)
        allFilesExist = false
      }
    })
    
    if (!allFilesExist) {
      throw new Error('构建结果验证失败，缺少必要文件')
    }
    
    // 5. 生成校验和（可选）
    if (process.platform === 'linux' || process.platform === 'darwin') {
      console.log('生成文件校验和...')
      try {
        const checksumFile = path.join(outDir, `checksums-${platform.name}-${arch}.txt`)
        const checksumCommand = `find "${appOutDir}" -type f -exec sha256sum {} \\; > "${checksumFile}"`
        execSync(checksumCommand, { stdio: 'pipe' })
        console.log(`校验和文件已生成: ${checksumFile}`)
      } catch (error) {
        console.warn('生成校验和失败:', error.message)
      }
    }
    
    // 6. 记录构建统计信息
    console.log('记录构建统计信息...')
    const stats = {
      platform: platform.name,
      arch: arch,
      buildTime: new Date().toISOString(),
      totalSize: formatBytes(totalSize),
      fileCount: report.files.length,
      largestFile: report.files.reduce((max, file) => file.size > max.size ? file : max, { size: 0 }),
      averageFileSize: formatBytes(totalSize / report.files.length)
    }
    
    console.log('构建统计:')
    console.log(`  平台: ${stats.platform}`)
    console.log(`  架构: ${stats.arch}`)
    console.log(`  总大小: ${stats.totalSize}`)
    console.log(`  文件数量: ${stats.fileCount}`)
    console.log(`  最大文件: ${stats.largestFile.path} (${formatBytes(stats.largestFile.size)})`)
    console.log(`  平均文件大小: ${stats.averageFileSize}`)
    
    // 保存统计信息
    const statsPath = path.join(outDir, `build-stats-${platform.name}-${arch}.json`)
    fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2))
    
    console.log('=== 打包后处理完成 ===')
    
  } catch (error) {
    console.error('打包后处理失败:', error)
    throw error
  }
}

// 辅助函数：格式化字节大小
function formatBytes(bytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let size = bytes
  let unitIndex = 0
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`
}