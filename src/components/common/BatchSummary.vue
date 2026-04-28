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
      <h4>{{ $t('upload.selected', { count: store.files.length }) }}</h4>
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
          <span class="stat-value">{{ store.files.length }} / {{ store.MAX_FILES }}</span>
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
        :class="{ 'is-dragover': isDragover }"
        @dragover.prevent="handleDragover"
        @dragleave="handleDragleave"
        @drop.prevent="handleDrop"
        @click="triggerGridFileInput"
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
        <h4>{{ $t('preview.compressed', { count: store.results.length }) }}</h4>
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
          <div class="result-preview">
            <img :src="result.compressedUrl" alt="compressed" />
          </div>
          <div class="result-info">
            <p class="result-name">{{ result.compressedFile.name }}</p>
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
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { useImageStore } from '@/stores/imageStore'
import { useBatchProcessor } from '@/composables/useBatchProcessor'
import { useImageCompress } from '@/composables/useImageCompress'
import { formatFileSize } from '@/utils/formatters'
import { validateFiles } from '@/utils/validators'
import UploadArea from '../home/UploadArea.vue'
import ImageCard from './ImageCard.vue'

const { t } = useI18n()
const store = useImageStore()
const { downloadResult, downloadAll, processBatch } = useBatchProcessor()

const emit = defineEmits(['files-selected'])

const isDragover = ref(false)
const gridFileInput = ref(null)
const qualityInput = ref(String(store.quality))

// 同步 store.quality 变化
watch(() => store.quality, (newVal) => {
  qualityInput.value = String(newVal)
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
    maxSizeMB: store.quality / 100,
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
  const options = {
    maxSizeMB: store.quality / 100,
    fileType: store.outputFormat === 'original' ? undefined : store.outputFormat
  }
  
  const { compressImage } = useImageCompress()
  const result = await compressImage(file, options)
  
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

const handleDownloadAll = () => {
  if (store.results.length === 0) {
    ElMessage.warning(t('preview.noResults'))
    return
  }
  
  downloadAll(store.results)
  ElMessage.success(t('preview.downloadSuccess'))
}

const handleBack = () => {
  store.clearResults()
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
          
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
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
}
</style>
