<template>
  <div class="image-card">
    <div class="image-preview">
      <img :src="previewUrl" :alt="file.name" />
      <div class="image-overlay">
        <el-button 
          :icon="Delete" 
          circle 
          size="small"
          class="remove-btn"
          @click.stop="$emit('remove')"
        />
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
import { Delete } from '@element-plus/icons-vue'
import { formatFileSize } from '@/utils/formatters'

const props = defineProps({
  file: {
    type: File,
    required: true
  }
})

defineEmits(['remove'])

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

// 清理 Object URL
onUnmounted(() => {
  URL.revokeObjectURL(previewUrl.value)
})
</script>

<style scoped lang="scss">
.image-card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: $bg-white;
  border: 1px solid $border-light;
  transition: all 0.3s;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    
    .image-overlay {
      opacity: 1;
    }
  }
  
  .image-preview {
    position: relative;
    width: 100%;
    height: 120px;
    background: $bg-light;
    overflow: hidden;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .image-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s;
      
      .remove-btn {
        background: $bg-white;
        border: none;
        
        &:hover {
          background: $error;
          color: $text-white;
        }
      }
    }
  }
  
  .image-info {
    padding: 12px;
    
    .image-name {
      font-size: 13px;
      color: $text-primary;
      margin-bottom: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .image-size {
      font-size: 12px;
      color: $text-muted;
    }
  }
}
</style>
