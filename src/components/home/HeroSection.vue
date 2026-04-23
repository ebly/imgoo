<template>
  <section class="hero-section">
    <div class="hero-container">
      <!-- Left: Text & Upload -->
      <div class="hero-left">
        <p class="hero-tag">{{ $t('hero.tag') }}</p>
        <h1 class="hero-title">{{ $t('hero.title') }}</h1>
        <p class="hero-subtitle">{{ $t('hero.subtitle') }}</p>
        
        <UploadArea @files-selected="handleFilesSelected" />
        
        <div class="hero-actions">
          <div class="privacy-hint">
            <el-icon><Lock /></el-icon>
            <span>{{ $t('hero.privacy') }}</span>
          </div>
        </div>
      </div>
      
      <!-- Right: Preview & Control -->
      <div class="hero-right">
        <BatchSummary v-if="store.hasFiles" />
        <ControlPanel @compress-complete="handleCompressComplete" />
      </div>
    </div>
  </section>
</template>

<script setup>
import { useImageStore } from '@/stores/imageStore'
import UploadArea from './UploadArea.vue'
import ControlPanel from './ControlPanel.vue'
import BatchSummary from '../common/BatchSummary.vue'
import { Lock } from '@element-plus/icons-vue'

const store = useImageStore()

const handleFilesSelected = (files) => {
  console.log('Files selected:', files)
}

const handleCompressComplete = (result) => {
  console.log('Compression complete:', result)
}
</script>

<style scoped lang="scss">
.hero-section {
  padding: 64px 0;
  background: $bg-white;
  
  @include mobile {
    padding: 32px 0;
  }
}

.hero-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  gap: 48px;
  
  @include mobile {
    flex-direction: column;
    padding: 0 16px;
    gap: 32px;
  }
  
  @include desktop {
    flex-direction: row;
  }
}

.hero-left {
  flex: 1;
  
  .hero-tag {
    font-size: 12px;
    font-weight: 600;
    color: $primary;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 12px;
  }
  
  .hero-title {
    font-size: 40px;
    font-weight: 700;
    color: $text-primary;
    line-height: 1.2;
    margin-bottom: 16px;
    
    @include mobile {
      font-size: 28px;
    }
  }
  
  .hero-subtitle {
    font-size: 16px;
    color: $text-secondary;
    line-height: 1.6;
    margin-bottom: 32px;
  }
  
  .hero-actions {
    margin-top: 24px;
    
    .privacy-hint {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: $text-muted;
      
      .el-icon {
        font-size: 16px;
      }
    }
  }
}

.hero-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  
  @include mobile {
    width: 100%;
  }
}
</style>
