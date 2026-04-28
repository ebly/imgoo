import imageCompression from 'browser-image-compression'

export function useImageCompress() {
  const compressImage = async (file, options = {}) => {
    const defaultOptions = {
      maxSizeMB: options.maxSizeMB || 0.6,
      maxWidthOrHeight: 16384,
      useWebWorker: true,
      fileType: options.fileType || file.type,
      onProgress: options.onProgress || (() => {})
    }
    
    try {
      const compressedFile = await imageCompression(file, defaultOptions)
      
      // 计算压缩率
      const originalSize = file.size
      const compressedSize = compressedFile.size
      const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(2)
      
      return {
        success: true,
        originalFile: file,
        compressedFile,
        originalSize,
        compressedSize,
        ratio: `${ratio}%`,
        originalUrl: URL.createObjectURL(file),
        compressedUrl: URL.createObjectURL(compressedFile)
      }
    } catch (error) {
      console.error('Compression error:', error)
      return {
        success: false,
        error: error.message,
        originalFile: file
      }
    }
  }
  
  const resizeImage = async (file, width, height, maintainAspectRatio = true) => {
    const options = {
      maxWidthOrHeight: Math.max(width, height),
      useWebWorker: true,
      fileType: file.type
    }
    
    if (!maintainAspectRatio) {
      options.maxWidthOrHeight = undefined
    }
    
    return compressImage(file, options)
  }
  
  const convertFormat = async (file, targetFormat) => {
    const formatMap = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp'
    }
    
    const options = {
      fileType: targetFormat,
      useWebWorker: true
    }
    
    return compressImage(file, options)
  }
  
  return { 
    compressImage, 
    resizeImage, 
    convertFormat 
  }
}
