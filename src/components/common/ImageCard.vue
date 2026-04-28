<template>
  <div class="image-card">
    <div v-if="isZipFile" class="zip-preview">
      <div class="zip-icon-wrapper">
        <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 9h-2v2H9v-2H7v-2h2V7h2v2h2v2zm1-7V3.5L18.5 8H14zM12 17l-4-4h3v-4h2v4h3l-4 4z"/></svg>
      </div>
      <p class="zip-count">{{ store.zipImageCount }} 张图片</p>
    </div>
    <div v-else class="image-preview">
      <img :src="previewUrl" :alt="file.name" />
    </div>
    
    <div v-if="!isZipFile" class="image-overlay">
      <div class="overlay-actions">
        <button class="action-btn compress-btn" @click.stop="$emit('compress-single')" title="压缩">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
        </button>
        <button class="action-btn close-btn" @click.stop="$emit('remove')" title="删除">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </button>
      </div>
    </div>
    <div v-else class="image-overlay">
      <div class="overlay-actions">
        <button class="action-btn compress-btn" @click.stop="$emit('compress-single')" title="压缩">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
        </button>
        <button class="action-btn close-btn" @click.stop="$emit('remove')" title="删除">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </button>
      </div>
    </div>
    
    <div class="image-info">
      <p class="image-name" :title="file.name">{{ formatFileName(file.name) }}</p>
      <p v-if="!isZipFile && imageWidth && imageHeight" class="image-dimensions">{{ imageWidth }} × {{ imageHeight }}</p>
      <p class="image-size">{{ formatFileSize(file.size) }}</p>
    </div>
    
    <div v-if="store.fileProgress[file.name] != null" class="progress-section">
      <el-progress :percentage="store.fileProgress[file.name]" :stroke-width="6" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { formatFileSize } from '@/utils/formatters'
import { useImageStore } from '@/stores/imageStore'

const store = useImageStore()

const props = defineProps({
  file: {
    type: File,
    required: true
  }
})

defineEmits(['remove', 'settings', 'compress-single'])

const isZipFile = computed(() => {
  return props.file.name.toLowerCase().endsWith('.zip')
})

const previewUrl = computed(() => isZipFile.value ? '' : URL.createObjectURL(props.file))
const imageWidth = ref(0)
const imageHeight = ref(0)

if (!isZipFile.value) {
  const img = new Image()
  img.onload = () => {
    imageWidth.value = img.naturalWidth
    imageHeight.value = img.naturalHeight
  }
  img.src = previewUrl.value
}

const formatFileName = (name) => {
  const maxLength = 15
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

onUnmounted(() => {
  URL.revokeObjectURL(previewUrl.value)
})
</script>

<style scoped lang="scss">
  .image-card {
    position: relative;
    border-radius: 12px;
    background: $bg-white;
    border: 1px solid $border-light;
    transition: all 0.3s;
    
    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      border-color: $primary;
      
      .image-overlay {
        opacity: 1;
      }
    }
    
    .image-preview {
      position: relative;
      width: 100%;
      height: 80px;
      background: $bg-light;
      border-radius: 12px 12px 0 0;
      overflow: hidden;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
    }
    
    .zip-preview {
      position: relative;
      width: 100%;
      height: 80px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px 12px 0 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      
      .zip-icon-wrapper {
        color: rgba(255, 255, 255, 0.9);
      }
      
      .zip-count {
        color: #fff;
        font-size: 11px;
        font-weight: 600;
        margin: 0;
        margin-top: 2px;
      }
    }
    
    .image-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 80px;
      display: flex;
      align-items: flex-start;
      justify-content: flex-end;
      padding: 6px;
      opacity: 0;
      transition: opacity 0.2s ease;
      z-index: 10;
      border-radius: 12px 12px 0 0;
      pointer-events: none;
      
      .overlay-actions {
        display: flex;
        gap: 6px;
        pointer-events: auto;
        
        .action-btn {
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
            background: #fff;
          }
          
          &.compress-btn:hover {
            background: #67c23a;
            color: #fff;
          }
          
          &.close-btn:hover {
            background: #f56c6c;
            color: #fff;
          }
        }
      }
    }
  
  .image-info {
    padding: 8px;
    
    .image-name {
      font-size: 12px;
      color: $text-primary;
      margin-bottom: 2px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .image-dimensions {
      font-size: 11px;
      color: $text-secondary;
      margin-bottom: 1px;
    }
    
    .image-size {
      font-size: 11px;
      color: $text-muted;
    }
  }
  
  .progress-section {
    padding: 0 8px 8px;
  }
}
</style>
