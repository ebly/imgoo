import JSZip from 'jszip'
import { useImageStore } from '@/stores/imageStore'

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff', '.tif', '.svg', '.ico']

export function useZipHandler() {
  const store = useImageStore()

  const isZipFile = (file) => {
    return file.type === 'application/zip' ||
           file.type === 'application/x-zip-compressed' ||
           file.name.toLowerCase().endsWith('.zip')
  }

  const extractImagesFromZip = async (zipFile) => {
    try {
      const zip = await JSZip.loadAsync(zipFile)
      const imageFiles = []
      const imageExtensions = new Set(IMAGE_EXTENSIONS)

      const entries = Object.values(zip.files)
      for (const entry of entries) {
        if (entry.dir) continue
        const ext = '.' + entry.name.split('.').pop().toLowerCase()
        if (imageExtensions.has(ext)) {
          imageFiles.push(entry)
        }
      }

      if (imageFiles.length > store.MAX_FILES) {
        return { error: 'maxFilesInZip', count: imageFiles.length }
      }

      if (imageFiles.length === 0) {
        return { error: 'noImagesInZip' }
      }

      const files = []
      let firstFile = null

      for (const entry of imageFiles) {
        const blob = await entry.async('blob')
        const name = entry.name.split('/').pop()
        const file = new File([blob], name, { type: blob.type || 'image/jpeg' })
        files.push(file)
        if (!firstFile) firstFile = file
      }

      return { files, firstFile, count: files.length }
    } catch (error) {
      console.error('ZIP extraction error:', error)
      return { error: 'invalidZip' }
    }
  }

  const createZipFromResults = async (results) => {
    const zip = new JSZip()
    const folder = zip.folder('compressed_images')

    for (const result of results) {
      const arrayBuffer = await result.compressedFile.arrayBuffer()
      folder.file(result.compressedFile.name, arrayBuffer)
    }

    const blob = await zip.generateAsync({ type: 'blob' })
    return blob
  }

  const downloadZip = (blob, filename = 'imgoo_compressed.zip') => {
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
  }

  return {
    isZipFile,
    extractImagesFromZip,
    createZipFromResults,
    downloadZip
  }
}
