<template>
  <div v-if="store.hasFiles" class="batch-summary">
    <div class="summary-header">
      <h4>{{ $t('upload.selected', { count: store.files.length }) }}</h4>
      <el-button 
        text 
        type="danger" 
        size="small"
        @click="store.clearFiles()"
      >
        {{ $t('common.clear') || '清空' }}
      </el-button>
    </div>
    
    <div class="summary-stats">
      <div class="stat-item">
        <span class="stat-label">{{ $t('preview.fileSize') }}</span>
        <span class="stat-value">{{ formatFileSize(store.totalSize) }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">{{ $t('upload.maxFiles') }}</span>
        <span class="stat-value">{{ store.files.length }} / {{ store.MAX_FILES }}</span>
      </div>
    </div>
    
    <div class="image-grid">
      <ImageCard 
        v-for="(file, index) in store.files" 
        :key="index"
        :file="file"
        @remove="store.removeFile(index)"
      />
    </div>
  </div>
</template>

<script setup>
import { useImageStore } from '@/stores/imageStore'
import { formatFileSize } from '@/utils/formatters'
import ImageCard from './ImageCard.vue'

const store = useImageStore()
</script>

<style scoped lang="scss">
.batch-summary {
  background: $bg-white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  
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
  }
  
  .summary-stats {
    display: flex;
    gap: 24px;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid $border-light;
    
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
    }
  }
  
  .image-grid {
    display: grid;
    gap: 12px;
    
    @include mobile {
      grid-template-columns: repeat(2, 1fr);
    }
    
    @include desktop {
      grid-template-columns: repeat(4, 1fr);
    }
  }
}
</style>
