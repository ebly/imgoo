import { ref } from 'vue'
import { useImageCompress } from './useImageCompress'
import { useImageStore } from '../stores/imageStore'

export function useBatchProcessor() {
  const { compressImage } = useImageCompress()
  const store = useImageStore()
  
  const BATCH_SIZE = 5
  
  const processBatch = async (compressOptions) => {
    store.setProcessing(true)
    store.setProgress(0)
    store.clearResults()
    
    const files = [...store.files]
    const totalFiles = files.length
    
    if (totalFiles === 0) {
      store.setProcessing(false)
      return { results: [], errors: [] }
    }
    
    let processedCount = 0
    
    // 分批处理
    for (let i = 0; i < totalFiles; i += BATCH_SIZE) {
      const batch = files.slice(i, i + BATCH_SIZE)
      
      const batchResults = await Promise.allSettled(
        batch.map(async (file) => {
          const result = await compressImage(file, compressOptions)
          return { file, result }
        })
      )
      
      batchResults.forEach((item) => {
        if (item.status === 'fulfilled') {
          if (item.value.result.success) {
            store.addResult(item.value.result)
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
