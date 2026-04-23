import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useImageStore = defineStore('image', () => {
  // 状态
  const files = ref([])
  const results = ref([])
  const errors = ref([])
  const processing = ref(false)
  const progress = ref(0)
  
  // 配置
  const MAX_FILES = 20
  const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB
  const MAX_TOTAL_SIZE = 100 * 1024 * 1024 // 100MB
  
  // 计算属性
  const totalSize = computed(() => {
    return files.value.reduce((sum, file) => sum + file.size, 0)
  })
  
  const hasFiles = computed(() => files.value.length > 0)
  
  const processedCount = computed(() => {
    return Math.round(progress.value / 100 * files.value.length)
  })
  
  // 方法
  function addFiles(newFiles) {
    const validFiles = []
    const newErrors = []
    
    // 检查文件数量
    if (files.value.length + newFiles.length > MAX_FILES) {
      newErrors.push({ type: 'maxFiles', message: 'maxFilesExceeded' })
      return { validFiles, errors: newErrors }
    }
    
    // 检查每个文件
    for (const file of newFiles) {
      if (file.size > MAX_FILE_SIZE) {
        newErrors.push({ 
          type: 'fileTooLarge', 
          file: file.name,
          message: 'fileTooLarge' 
        })
        continue
      }
      
      if (!file.type.startsWith('image/')) {
        newErrors.push({ 
          type: 'invalidType', 
          file: file.name,
          message: 'invalidType' 
        })
        continue
      }
      
      validFiles.push(file)
    }
    
    // 检查总大小
    const newTotalSize = totalSize.value + validFiles.reduce((sum, f) => sum + f.size, 0)
    if (newTotalSize > MAX_TOTAL_SIZE) {
      newErrors.push({ type: 'totalSizeExceeded', message: 'totalSizeExceeded' })
      return { validFiles: [], errors: newErrors }
    }
    
    files.value = [...files.value, ...validFiles]
    return { validFiles, errors: newErrors }
  }
  
  function removeFile(index) {
    files.value.splice(index, 1)
  }
  
  function clearFiles() {
    files.value = []
    results.value = []
    errors.value = []
    progress.value = 0
  }
  
  function setProcessing(value) {
    processing.value = value
  }
  
  function setProgress(value) {
    progress.value = value
  }
  
  function addResult(result) {
    results.value.push(result)
  }
  
  function addError(error) {
    errors.value.push(error)
  }
  
  function clearResults() {
    results.value = []
    errors.value = []
  }
  
  return {
    files,
    results,
    errors,
    processing,
    progress,
    MAX_FILES,
    MAX_FILE_SIZE,
    MAX_TOTAL_SIZE,
    totalSize,
    hasFiles,
    processedCount,
    addFiles,
    removeFile,
    clearFiles,
    setProcessing,
    setProgress,
    addResult,
    addError,
    clearResults
  }
})
