<template>
  <div class="image-card">
    <div class="image-preview">
      <img :src="previewUrl" :alt="file.name" />
    </div>
    
    <div class="image-overlay">
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
      <p class="image-size">{{ formatFileSize(file.size) }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed, onUnmounted } from 'vue'
import { formatFileSize } from '@/utils/formatters'

const props = defineProps({
  file: {
    type: File,
    required: true
  }
})

defineEmits(['remove', 'settings', 'compress-single'])

const previewUrl = computed(() => URL.createObjectURL(props.file))

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
    
    .image-size {
      font-size: 11px;
      color: $text-muted;
    }
  }
}
</style>
