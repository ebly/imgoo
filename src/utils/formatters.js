export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function formatDimensions(width, height) {
  return `${width} × ${height}`
}

export function formatCompressionRatio(originalSize, compressedSize) {
  if (originalSize === 0) return '0%'
  const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(1)
  return `${ratio}%`
}

export function formatFileName(name) {
  const maxLength = 20
  if (name.length <= maxLength) return name
  
  const dotIndex = name.lastIndexOf('.')
  if (dotIndex === -1) {
    return name.slice(0, maxLength) + '...'
  }
  
  const ext = name.slice(dotIndex)
  const baseName = name.slice(0, dotIndex)
  const maxBaseLength = maxLength - ext.length - 3
  
  if (baseName.length <= maxBaseLength) return name
  
  return baseName.slice(0, maxBaseLength) + '...' + ext
}
