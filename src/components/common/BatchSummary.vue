<template>
  <div class="batch-summary">
    <input 
      ref="gridFileInput"
      type="file" 
      multiple 
      accept="image/*"
      @change="handleGridFileSelect"
      class="file-input"
    />
    
    <div class="summary-header">
      <h4>{{ store.isZipMode ? $t('upload.selectedZip', { count: 1 }) : $t('upload.selected', { count: store.files.length }) }}</h4>
      <div class="header-actions">
        <el-button 
          text 
          type="primary" 
          size="default"
          :loading="store.processing"
          @click="handleCompress"
        >
          {{ store.processing ? $t('control.processing') : $t('control.compressAll') }}
        </el-button>
      </div>
    </div>
    
    <div v-if="store.files.length > 0">
      <div class="summary-stats">
        <div class="stat-item">
          <span class="stat-label">{{ $t('preview.fileSize') }}</span>
          <span class="stat-value">{{ formatFileSize(store.totalSize) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">{{ $t('upload.maxFiles') }}</span>
          <span class="stat-value">{{ store.isZipMode ? store.zipImageCount : store.files.length }} / {{ store.MAX_FILES }}</span>
        </div>
        <div class="stat-item quality-item">
          <span class="stat-label">{{ $t('control.quality') }}</span>
          <el-input 
            v-model="qualityInput" 
            placeholder="60"
            class="quality-input"
            @input="handleQualityInput"
            @blur="handleQualityBlur"
          >
            <template #suffix>
              <span class="input-suffix">%</span>
            </template>
          </el-input>
        </div>
        <div class="stat-item resize-item">
          <span class="stat-label">{{ $t('control.resize') }}</span>
          <el-input 
            v-model="resizeInput" 
            placeholder="100"
            class="resize-input"
            @input="handleResizeInput"
            @blur="handleResizeBlur"
          >
            <template #suffix>
              <span class="input-suffix">%</span>
            </template>
          </el-input>
        </div>
        <div class="stat-item format-item">
          <span class="stat-label">{{ $t('control.format') }}</span>
          <el-select v-model="store.outputFormat" class="format-select" size="small">
            <el-option :label="$t('control.formatOriginal')" value="original" />
            <el-option :label="$t('control.formatJpeg')" value="image/jpeg" />
            <el-option :label="$t('control.formatPng')" value="image/png" />
            <el-option :label="$t('control.formatWebp')" value="image/webp" />
          </el-select>
        </div>
      </div>
      
      <div 
        class="image-grid"
        :class="{ 'is-dragover': isDragover, 'is-zip-mode': store.isZipMode }"
        @dragover.prevent="!store.isZipMode && handleDragover()"
        @dragleave="!store.isZipMode && handleDragleave()"
        @drop.prevent="!store.isZipMode && handleDrop($event)"
        @click="!store.isZipMode && triggerGridFileInput($event)"
      >
        <ImageCard 
          v-for="(file, index) in store.files" 
          :key="index"
          :file="file"
          @remove="store.removeFile(index)"
          @compress-single="handleCompressSingle(file)"
        />
      </div>
    </div>
    
    <div v-if="store.results.length > 0" class="compressed-section">
      <div class="compressed-header">
        <h4>{{ store.results[0]?.isZipResult ? $t('preview.compressedZip', { count: store.results[0]?.imageCount || 0 }) : $t('preview.compressed', { count: store.results.length }) }}</h4>
        <el-button 
          text 
          type="primary" 
          size="default"
          @click="handleDownloadAll"
        >
          {{ $t('preview.downloadAll') }}
        </el-button>
      </div>
      
      <div class="image-grid compressed-grid">
        <div v-for="(result, index) in store.results" :key="index" class="result-card">
          <div v-if="result.isZipResult" class="result-zip-preview">
            <div class="result-zip-icon">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 9h-2v2H9v-2H7v-2h2V7h2v2h2v2zm1-7V3.5L18.5 8H14zM12 17l-4-4h3v-4h2v4h3l-4 4z"/></svg>
            </div>
            <p class="result-zip-count">{{ result.imageCount }} 张图片</p>
            <div class="result-overlay-btns">
              <button class="result-action-btn compare-btn" @click.stop="openCompare(result)" title="对比">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M9 3L5 6.99h3V14h2V6.99h3L9 3zm7 14.01V10h-2v7.01h-3L15 21l4-3.99h-3z"/></svg>
              </button>
              <button class="result-action-btn close-btn" @click.stop="removeResult(index)" title="删除">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
              </button>
            </div>
          </div>
          <div v-else class="result-preview">
            <img :src="result.compressedUrl" alt="compressed" />
            <div class="result-overlay-btns">
              <button class="result-action-btn compare-btn" @click.stop="openCompare(result)" title="对比">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M9 3L5 6.99h3V14h2V6.99h3L9 3zm7 14.01V10h-2v7.01h-3L15 21l4-3.99h-3z"/></svg>
              </button>
              <button class="result-action-btn close-btn" @click.stop="removeResult(index)" title="删除">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
              </button>
            </div>
          </div>
          <div class="result-info">
            <p class="result-name">{{ result.compressedFile.name }}</p>
            <p v-if="!result.isZipResult && result.compressedWidth && result.compressedHeight" class="result-dimensions">{{ result.compressedWidth }} × {{ result.compressedHeight }}</p>
            <div class="result-stats">
              <span class="stat">{{ formatFileSize(result.originalSize) }} → {{ formatFileSize(result.compressedSize) }}</span>
              <span class="ratio" :class="{ 'is-positive': parseFloat(result.ratio) > 0 }">
                {{ result.ratio }}
              </span>
            </div>
            <el-button type="primary" size="small" @click="downloadResult(result)">
              {{ $t('preview.download') }}
            </el-button>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="store.files.length === 0 && store.results.length === 0" class="upload-placeholder">
      <UploadArea @files-selected="$emit('files-selected', $event)" />
    </div>
    
    <!-- 对比弹窗 -->
    <div v-if="showCompare" class="compare-overlay" @click.self="closeCompare">
      <div class="compare-modal">
        <div class="compare-header">
          <h4>{{ compareResult?.originalFile?.name || '图片对比' }}</h4>
          <button class="compare-close-btn" @click="closeCompare">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          </button>
        </div>
        <div class="compare-container" ref="compareContainer">
          <div class="compare-image-wrapper">
            <img :src="compareResult?.originalUrl" alt="original" class="compare-original" />
            <div class="compare-label compare-original-label">原图</div>
          </div>
          <div class="compare-image-wrapper" :style="{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }">
            <img :src="compareResult?.compressedUrl" alt="compressed" class="compare-compressed" />
            <div class="compare-label compare-compressed-label">压缩后</div>
          </div>
          <div class="compare-slider" :style="{ left: sliderPosition + '%' }" @mousedown="startDrag" @touchstart="startDrag">
            <div class="compare-slider-line"></div>
            <div class="compare-slider-handle">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8 5v14l-7-7zm8 0l7 7-7 7z"/></svg>
            </div>
          </div>
        </div>
        <div class="compare-stats">
          <span>原图: {{ formatFileSize(compareResult?.originalSize || 0) }}</span>
          <span>压缩后: {{ formatFileSize(compareResult?.compressedSize || 0) }}</span>
          <span class="compare-ratio" :class="{ 'is-positive': parseFloat(compareResult?.ratio || '0') > 0 }">
            {{ compareResult?.ratio || '0%' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { useImageStore } from '@/stores/imageStore'
import { useBatchProcessor } from '@/composables/useBatchProcessor'
import { useImageCompress } from '@/composables/useImageCompress'
import { useZipHandler } from '@/composables/useZipHandler'
import { formatFileSize } from '@/utils/formatters'
import { validateFiles } from '@/utils/validators'
import UploadArea from '../home/UploadArea.vue'
import ImageCard from './ImageCard.vue'

const { t } = useI18n()
const store = useImageStore()
const { downloadResult, downloadAll, processBatch } = useBatchProcessor()
const { createZipFromResults, downloadZip } = useZipHandler()

const emit = defineEmits(['files-selected'])

const isDragover = ref(false)
const gridFileInput = ref(null)
const qualityInput = ref(String(store.quality))
const resizeInput = ref(String(store.resizePercent))

// 同步 store.quality 变化
watch(() => store.quality, (newVal) => {
  qualityInput.value = String(newVal)
})

// 同步 store.resizePercent 变化
watch(() => store.resizePercent, (newVal) => {
  resizeInput.value = String(newVal)
})

const handleQualityInput = (value) => {
  // 只允许输入数字
  const numValue = value.replace(/[^\d]/g, '')
  qualityInput.value = numValue
  
  // 更新 store 中的 quality
  const parsed = parseInt(numValue, 10)
  if (!isNaN(parsed) && parsed >= 1 && parsed <= 100) {
    store.quality = parsed
  }
}

const handleQualityBlur = () => {
  const parsed = parseInt(qualityInput.value, 10)
  if (isNaN(parsed) || parsed < 1) {
    store.quality = 1
    qualityInput.value = '1'
  } else if (parsed > 100) {
    store.quality = 100
    qualityInput.value = '100'
  } else {
    store.quality = parsed
  }
}

const handleResizeInput = (value) => {
  const numValue = value.replace(/[^\d]/g, '')
  resizeInput.value = numValue
  const parsed = parseInt(numValue, 10)
  if (!isNaN(parsed) && parsed >= 1 && parsed <= 100) {
    store.resizePercent = parsed
  }
}

const handleResizeBlur = () => {
  const parsed = parseInt(resizeInput.value, 10)
  if (isNaN(parsed) || parsed < 1) {
    store.resizePercent = 1
    resizeInput.value = '1'
  } else if (parsed > 100) {
    store.resizePercent = 100
    resizeInput.value = '100'
  } else {
    store.resizePercent = parsed
  }
}

const handleDragover = () => {
  isDragover.value = true
}

const handleDragleave = () => {
  isDragover.value = false
}

const handleDrop = (e) => {
  isDragover.value = false
  const files = Array.from(e.dataTransfer.files)
  processFiles(files)
}

const triggerGridFileInput = (e) => {
  // 避免点击删除按钮时触发上传
  if (e.target.closest('.image-card-remove')) return
  gridFileInput.value?.click()
}

const handleGridFileSelect = (e) => {
  const files = Array.from(e.target.files)
  processFiles(files)
  e.target.value = ''
}

const processFiles = (files) => {
  if (files.length === 0) return
  
  const { validFiles, errors } = validateFiles(files, store.files)
  
  errors.forEach(error => {
    ElMessage.warning(t(`upload.${error.message}`, { name: error.file }))
  })
  
  if (validFiles.length > 0) {
    store.addFiles(validFiles)
    emit('files-selected', validFiles)
    ElMessage.success(t('upload.selected', { count: validFiles.length }))
  }
}

const handleCompress = async () => {
  if (!store.hasFiles) {
    ElMessage.warning(t('upload.noFiles'))
    return
  }
  
  const options = {
    initialQuality: store.quality / 100,
    resizePercent: store.resizePercent,
    fileType: store.outputFormat === 'original' ? undefined : store.outputFormat
  }
  
  const result = await processBatch(options)
  
  if (result.results.length > 0) {
    ElMessage.success(t('common.success'))
  }
  
  if (result.errors.length > 0) {
    ElMessage.warning(t('common.error'))
  }
}

const handleCompressSingle = async (file) => {
  if (store.isZipMode) {
    handleCompress()
    return
  }
  
  const options = {
    initialQuality: store.quality / 100,
    resizePercent: store.resizePercent,
    fileType: store.outputFormat === 'original' ? undefined : store.outputFormat,
    onProgress: (p) => store.setFileProgress(file.name, Math.round(p))
  }
  
  const { compressImage } = useImageCompress()
  const result = await compressImage(file, options)
  store.clearFileProgress(file.name)
  
  if (result.success) {
    store.addResult(result)
    ElMessage.success(t('common.success'))
  } else {
    ElMessage.error(t('common.error'))
  }
}

const handleSettings = (file) => {
  ElMessage.info(`${t('control.settings')}: ${file.name}`)
}

const handleReset = () => {
  store.quality = 60
  store.outputFormat = 'original'
  store.clearFiles()
  store.clearResults()
}

const handleDownloadAll = async () => {
  if (store.results.length === 0) {
    ElMessage.warning(t('preview.noResults'))
    return
  }
  
  const firstResult = store.results[0]
  if (firstResult?.isZipResult) {
    downloadResult(firstResult)
    ElMessage.success(t('preview.downloadSuccess'))
  } else {
    downloadAll(store.results)
    ElMessage.success(t('preview.downloadSuccess'))
  }
}

const handleBack = () => {
  store.clearResults()
}

const removeResult = (index) => {
  const result = store.results[index]
  if (result?.originalUrl) URL.revokeObjectURL(result.originalUrl)
  if (result?.compressedUrl) URL.revokeObjectURL(result.compressedUrl)
  store.results.splice(index, 1)
}

const showCompare = ref(false)
const compareResult = ref(null)
const sliderPosition = ref(50)
const compareContainer = ref(null)
const isDragging = ref(false)

const openCompare = (result) => {
  let compareData = result
  if (store.isZipMode && store.firstImageFile) {
    compareData = {
      ...result,
      originalFile: store.firstImageFile,
      originalUrl: URL.createObjectURL(store.firstImageFile),
      originalSize: store.firstImageFile.size
    }
  }
  compareResult.value = compareData
  sliderPosition.value = 50
  showCompare.value = true
}

const closeCompare = () => {
  if (store.isZipMode && compareResult.value?.originalUrl && compareResult.value?.originalFile !== store.firstImageFile) {
    URL.revokeObjectURL(compareResult.value.originalUrl)
  }
  showCompare.value = false
  compareResult.value = null
  isDragging.value = false
}

const startDrag = (e) => {
  e.preventDefault()
  isDragging.value = true
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchmove', onDrag)
  document.addEventListener('touchend', stopDrag)
}

const onDrag = (e) => {
  if (!isDragging.value || !compareContainer.value) return
  const rect = compareContainer.value.getBoundingClientRect()
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  let pos = ((clientX - rect.left) / rect.width) * 100
  pos = Math.max(0, Math.min(100, pos))
  sliderPosition.value = pos
}

const stopDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', stopDrag)
}

const clearAll = () => {
  store.clearFiles()
  store.clearResults()
}
</script>

<style scoped lang="scss">
.file-input {
  display: none;
}

.batch-summary {
  background: $bg-white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  min-height: 200px;
  
  @include mobile {
    padding: 16px;
  }
  
  .summary-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    h4 {
      font-size: 16px;
      font-weight: 600;
      color: $text-primary;
    }
    
    .header-actions {
      display: flex;
      gap: 4px;
      
      .el-button {
        font-size: 13px;
        font-weight: 500;
        padding: 2px 8px;
        height: 28px;
        
        &.el-button--primary {
          color: $primary;
          
          &:hover {
            background: $primary-light;
          }
        }
        
        &.el-button--info {
          color: $text-secondary;
          
          &:hover {
            background: $bg-light;
          }
        }
        
        &.el-button--success {
          color: #67c23a;
          
          &:hover {
            background: #f0f9eb;
          }
          
          &:disabled {
            color: $text-muted;
          }
        }
      }
    }
  }
  
  .summary-stats {
    display: flex;
    gap: 24px;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid $border-light;
    flex-wrap: wrap;
    
    .stat-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
      
      .stat-label {
        font-size: 12px;
        color: $text-muted;
      }
      
      .stat-value {
        font-size: 14px;
        font-weight: 600;
        color: $text-primary;
      }
      
      &.quality-item {
        .quality-input {
          width: 80px;
          
          .input-suffix {
            color: $text-muted;
            font-size: 12px;
          }
          
          :deep(.el-input__wrapper) {
            height: 24px;
            box-shadow: 0 0 0 1px $border-light inset;
            
            &:hover, &.is-focus {
              box-shadow: 0 0 0 1px $primary inset;
            }
          }
          
          :deep(.el-input__inner) {
            text-align: center;
            font-size: 14px;
            font-weight: 600;
            height: 32px;
            line-height: 32px;
          }
        }
      }
      
      &.resize-item {
        .resize-input {
          width: 80px;
          
          .input-suffix {
            color: $text-muted;
            font-size: 12px;
          }
          
          :deep(.el-input__wrapper) {
            height: 24px;
            box-shadow: 0 0 0 1px $border-light inset;
            
            &:hover, &.is-focus {
              box-shadow: 0 0 0 1px $primary inset;
            }
          }
          
          :deep(.el-input__inner) {
            text-align: center;
            font-size: 14px;
            font-weight: 600;
            height: 32px;
            line-height: 32px;
          }
        }
      }
      
      &.format-item {
        .format-select {
          width: 120px;
          
          :deep(.el-input__wrapper) {
            padding: 0 8px;
            height: 32px;
            box-shadow: 0 0 0 1px $border-light inset;
            
            &:hover, &.is-focus {
              box-shadow: 0 0 0 1px $primary inset;
            }
          }
          
          :deep(.el-input__inner) {
            font-size: 13px;
            height: 32px;
            line-height: 32px;
          }
        }
      }
    }
  }
  
  .upload-placeholder {
    .upload-area {
      border: 2px dashed $border-light;
      background: $bg-light;
      
      &:hover {
        border-color: $primary;
        background: $primary-light;
      }
    }
  }
  
  .image-grid {
    display: grid;
    gap: 12px;
    padding: 12px;
    border: 2px dashed transparent;
    border-radius: 12px;
    transition: all 0.3s;
    cursor: pointer;
    position: relative;
    
    &:hover {
      border-color: $primary;
      background: $primary-light;
    }
    
    &.is-dragover {
      border-color: $primary;
      background: $primary-light;
    }
    
    &.is-zip-mode {
      cursor: default;
      
      &:hover {
        border-color: transparent;
        background: transparent;
      }
    }
    
    .file-input {
      display: none;
    }
    
    @include mobile {
      grid-template-columns: repeat(2, 1fr);
    }
    
    @include desktop {
      grid-template-columns: repeat(4, 1fr);
    }
  }
  
  .compressed-section {
    .compressed-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      h4 {
        font-size: 16px;
        font-weight: 600;
        color: $text-primary;
      }
      
      .el-button {
        font-size: 13px;
        font-weight: 500;
        padding: 2px 8px;
        height: 28px;
        
        &.el-button--primary {
          color: $primary;
          
          &:hover {
            background: $primary-light;
          }
        }
      }
    }
    
    .compressed-grid {
      .result-card {
        background: $bg-light;
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid $border-light;
        transition: all 0.3s;
        
        &:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .result-preview {
          width: 100%;
          height: 80px;
          background: $bg-dark;
          overflow: hidden;
          position: relative;
          
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          
          .result-overlay-btns {
            position: absolute;
            top: 6px;
            right: 6px;
            display: flex;
            gap: 6px;
            opacity: 0;
            transition: opacity 0.2s;
            
            .result-action-btn {
              width: 28px;
              height: 28px;
              border-radius: 50%;
              border: none;
              background: rgba(255, 255, 255, 0.95);
              color: #303133;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
              transition: all 0.2s;
              padding: 0;
              
              &:hover {
                transform: scale(1.15);
              }
              
              &.compare-btn:hover {
                background: #409eff;
                color: #fff;
              }
              
              &.close-btn:hover {
                background: #f56c6c;
                color: #fff;
              }
            }
          }
        }
        
        .result-zip-preview {
          width: 100%;
          height: 80px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          
          .result-zip-icon {
            color: rgba(255, 255, 255, 0.9);
          }
          
          .result-zip-count {
            color: #fff;
            font-size: 11px;
            font-weight: 600;
            margin: 0;
            margin-top: 2px;
          }
          
          .result-overlay-btns {
            position: absolute;
            top: 6px;
            right: 6px;
            display: flex;
            gap: 6px;
            opacity: 0;
            transition: opacity 0.2s;
            
            .result-action-btn {
              width: 28px;
              height: 28px;
              border-radius: 50%;
              border: none;
              background: rgba(255, 255, 255, 0.95);
              color: #303133;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
              transition: all 0.2s;
              padding: 0;
              
              &:hover {
                transform: scale(1.15);
              }
              
              &.compare-btn:hover {
                background: #409eff;
                color: #fff;
              }
              
              &.close-btn:hover {
                background: #f56c6c;
                color: #fff;
              }
            }
          }
        }
        
        &:hover .result-overlay-btns {
          opacity: 1;
        }
        
        .result-info {
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          
          .result-name {
            font-size: 12px;
            font-weight: 600;
            color: $text-primary;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          .result-dimensions {
            font-size: 11px;
            color: $text-secondary;
            margin: 0;
          }
          
          .result-stats {
            display: flex;
            justify-content: space-between;
            align-items: center;
            
            .stat {
              font-size: 11px;
              color: $text-secondary;
            }
            
            .ratio {
              font-size: 11px;
              font-weight: 600;
              color: $text-muted;
              
              &.is-positive {
                color: #67c23a;
              }
            }
          }
        }
      }
    }
  }
  
  .compare-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.85);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    
    .compare-modal {
      background: $bg-white;
      border-radius: 16px;
      width: 90vw;
      max-width: 900px;
      max-height: 90vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      
      .compare-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        border-bottom: 1px solid $border-light;
        
        h4 {
          font-size: 16px;
          font-weight: 600;
          color: $text-primary;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin: 0;
        }
        
        .compare-close-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          background: transparent;
          color: #606266;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          padding: 0;
          
          &:hover {
            background: #f5f7fa;
            color: #303133;
          }
        }
      }
      
      .compare-container {
        position: relative;
        width: 100%;
        height: 500px;
        overflow: hidden;
        cursor: col-resize;
        user-select: none;
        background: #1a1a1a;
        
        .compare-image-wrapper {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          
          img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            display: block;
          }
          
          .compare-label {
            position: absolute;
            bottom: 12px;
            padding: 4px 12px;
            border-radius: 4px;
            background: rgba(0, 0, 0, 0.7);
            color: #fff;
            font-size: 12px;
            font-weight: 600;
            pointer-events: none;
          }
          
          .compare-original-label {
            left: 12px;
          }
          
          .compare-compressed-label {
            right: 12px;
          }
        }
        
        .compare-slider {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 2px;
          transform: translateX(-50%);
          z-index: 10;
          
          .compare-slider-line {
            position: absolute;
            top: 0;
            bottom: 0;
            left: 50%;
            width: 2px;
            transform: translateX(-50%);
            background: #fff;
          }
          
          .compare-slider-handle {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: #fff;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #409eff;
          }
        }
      }
      
      .compare-stats {
        display: flex;
        justify-content: center;
        gap: 24px;
        padding: 12px 20px;
        border-top: 1px solid $border-light;
        font-size: 13px;
        color: $text-secondary;
        
        .compare-ratio {
          font-weight: 600;
          color: $text-muted;
          
          &.is-positive {
            color: #67c23a;
          }
        }
      }
    }
  }
}
</style>
