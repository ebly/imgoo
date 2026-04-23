import { ref, computed } from 'vue'

export function useImagePreview() {
  const previewImage = ref(null)
  const showPreview = ref(false)
  
  const openPreview = (image) => {
    previewImage.value = image
    showPreview.value = true
  }
  
  const closePreview = () => {
    previewImage.value = null
    showPreview.value = false
  }
  
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
  
  const getImageDimensions = (file) => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height
        })
      }
      img.src = URL.createObjectURL(file)
    })
  }
  
  return {
    previewImage,
    showPreview,
    openPreview,
    closePreview,
    formatFileSize,
    getImageDimensions
  }
}
