import imageCompression from 'browser-image-compression'

export function useImageCompress() {
  const getImageDimensions = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }

  const compressImage = async (file, options = {}) => {
    const maxSizeMB = options.maxSizeMB || 0.6
    const initialQuality = options.initialQuality ?? 0.6
    const resizePercent = options.resizePercent ?? 100

    let fileType = options.fileType || file.type
    if (fileType === 'image/png' || fileType === 'image/gif') {
      fileType = 'image/jpeg'
    }

    let maxWidthOrHeight = options.maxWidthOrHeight
    if (!maxWidthOrHeight && resizePercent < 100) {
      try {
        const dims = await getImageDimensions(file)
        const maxDim = Math.max(dims.width, dims.height)
        maxWidthOrHeight = Math.round(maxDim * resizePercent / 100)
      } catch {
        maxWidthOrHeight = 1920
      }
    } else if (!maxWidthOrHeight) {
      maxWidthOrHeight = 1920
    }

    const defaultOptions = {
      maxSizeMB,
      maxWidthOrHeight,
      useWebWorker: true,
      fileType,
      initialQuality,
      onProgress: options.onProgress || (() => {})
    }

    try {
      const compressedFile = await imageCompression(file, defaultOptions)

      const originalSize = file.size
      const compressedSize = compressedFile.size
      const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(2)

      const compressedUrl = URL.createObjectURL(compressedFile)
      const compressedDims = await getImageDimensions(compressedFile)

      return {
        success: true,
        originalFile: file,
        compressedFile,
        originalSize,
        compressedSize,
        ratio: `${ratio}%`,
        originalUrl: URL.createObjectURL(file),
        compressedUrl,
        compressedWidth: compressedDims.width,
        compressedHeight: compressedDims.height
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
      fileType: file.type
    }

    if (!maintainAspectRatio) {
      options.maxWidthOrHeight = undefined
    }

    return compressImage(file, options)
  }

  const convertFormat = async (file, targetFormat) => {
    const options = {
      fileType: targetFormat
    }

    return compressImage(file, options)
  }

  return {
    compressImage,
    resizeImage,
    convertFormat
  }
}
