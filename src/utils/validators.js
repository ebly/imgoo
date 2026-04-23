export const IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/svg+xml'
]

export const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB
export const MAX_TOTAL_SIZE = 100 * 1024 * 1024 // 100MB
export const MAX_FILES = 20

export function validateFile(file) {
  const errors = []
  
  // 检查文件类型
  if (!IMAGE_TYPES.includes(file.type)) {
    errors.push({
      type: 'invalidType',
      file: file.name,
      message: 'Invalid file type. Please select an image file.'
    })
  }
  
  // 检查文件大小
  if (file.size > MAX_FILE_SIZE) {
    errors.push({
      type: 'fileTooLarge',
      file: file.name,
      message: `File "${file.name}" exceeds 20MB limit.`
    })
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

export function validateFiles(files, existingFiles = []) {
  const errors = []
  const validFiles = []
  
  // 检查文件总数
  if (existingFiles.length + files.length > MAX_FILES) {
    errors.push({
      type: 'maxFilesExceeded',
      message: `Maximum ${MAX_FILES} images allowed.`
    })
    return { validFiles, errors }
  }
  
  // 检查每个文件
  for (const file of files) {
    const validation = validateFile(file)
    if (validation.valid) {
      validFiles.push(file)
    } else {
      errors.push(...validation.errors)
    }
  }
  
  // 检查总大小
  const existingSize = existingFiles.reduce((sum, f) => sum + f.size, 0)
  const newSize = validFiles.reduce((sum, f) => sum + f.size, 0)
  
  if (existingSize + newSize > MAX_TOTAL_SIZE) {
    errors.push({
      type: 'totalSizeExceeded',
      message: `Total file size exceeds 100MB limit.`
    })
    return { validFiles: [], errors }
  }
  
  return { validFiles, errors }
}

export function getFileExtension(filename) {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
}

export function getMimeType(extension) {
  const mimeTypes = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp',
    'gif': 'image/gif',
    'bmp': 'image/bmp'
  }
  return mimeTypes[extension.toLowerCase()] || 'image/jpeg'
}
