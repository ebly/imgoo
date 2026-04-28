import { ref } from 'vue'
import { useImageCompress } from './useImageCompress'
import { useImageStore } from '../stores/imageStore'
import JSZip from 'jszip'

export function useBatchProcessor() {
  const { compressImage } = useImageCompress()
  const store = useImageStore()
  
  const BATCH_SIZE = 5
  
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
  
  const processBatch = async (compressOptions) => {
    store.setProcessing(true)
    store.setProgress(0)
    store.clearResults()
    
    const files = store.isZipMode ? [...store.zipExtractedFiles] : [...store.files]
    const totalFiles = files.length
    
    if (totalFiles === 0) {
      store.setProcessing(false)
      return { results: [], errors: [] }
    }
    
    let processedCount = 0
    let totalOriginalSize = 0
    let totalCompressedSize = 0
    const allResults = []
    
    // 分批处理
    for (let i = 0; i < totalFiles; i += BATCH_SIZE) {
      const batch = files.slice(i, i + BATCH_SIZE)
      
      const batchResults = await Promise.allSettled(
        batch.map(async (file) => {
          const result = await compressImage(file, {
            ...compressOptions,
            onProgress: (p) => store.setFileProgress(file.name, Math.round(p))
          })
          store.clearFileProgress(file.name)
          return { file, result }
        })
      )
      
      batchResults.forEach((item) => {
        if (item.status === 'fulfilled') {
          if (item.value.result.success) {
            allResults.push(item.value.result)
            totalOriginalSize += item.value.result.originalSize
            totalCompressedSize += item.value.result.compressedSize
          } else {
            store.addError({
              file: item.value.file.name,
              error: item.value.result.error
            })
          }
        } else {
          store.addError({
            file: 'Unknown',
            error: item.reason?.message || 'Unknown error'
          })
        }
      })
      
      processedCount += batch.length
      store.setProgress(Math.round((processedCount / totalFiles) * 100))
      
      // 给 UI 一些渲染时间
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    
    // ZIP 模式：打包成单个 ZIP 文件
    if (store.isZipMode && allResults.length > 0) {
      const zipBlob = await createZipFromResults(allResults)
      const zipName = store.zipFileName.replace('.zip', '_compressed.zip')
      const zipFile = new File([zipBlob], zipName, { type: 'application/zip' })
      const ratio = ((1 - totalCompressedSize / totalOriginalSize) * 100).toFixed(2)
      
      store.addResult({
        success: true,
        originalFile: store.files[0],
        compressedFile: zipFile,
        originalSize: totalOriginalSize,
        compressedSize: zipBlob.size,
        ratio: `${ratio}%`,
        originalUrl: URL.createObjectURL(store.files[0]),
        compressedUrl: URL.createObjectURL(zipFile),
        isZipResult: true,
        imageCount: allResults.length
      })
    } else {
      allResults.forEach(r => store.addResult(r))
    }
    
    store.setProcessing(false)
    
    return { 
      results: store.results, 
      errors: store.errors 
    }
  }
  
  const downloadResult = (result) => {
    if (!result || !result.compressedFile) return
    
    const link = document.createElement('a')
    link.href = result.compressedUrl
    link.download = result.compressedFile.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  const downloadAll = (results) => {
    results.forEach((result, index) => {
      setTimeout(() => {
        downloadResult(result)
      }, index * 500)
    })
  }
  
  return {
    processBatch,
    downloadResult,
    downloadAll
  }
}
