<template>
  <section id="tools-section" class="tools-section">
    <div class="section-header">
      <h2 class="section-title">{{ $t('tools.title') }}</h2>
      <p class="section-subtitle">{{ $t('tools.subtitle') }}</p>
    </div>
    
    <div class="tools-grid">
      <FeatureCard 
        :icon="Crop"
        :title="$t('tools.resize.title')"
        :desc="$t('tools.resize.desc')"
        :action="$t('tools.resize.action')"
      />
      <FeatureCard 
        :icon="Download"
        :title="$t('tools.compress.title')"
        :desc="$t('tools.compress.desc')"
        :action="$t('tools.compress.action')"
      />
      <FeatureCard 
        :icon="Document"
        :title="$t('tools.convert.title')"
        :desc="$t('tools.convert.desc')"
        :action="$t('tools.convert.action')"
      />
    </div>
  </section>
</template>

<script setup>
import { Crop, Download, Document } from '@element-plus/icons-vue'
import FeatureCard from './FeatureCard.vue'
</script>

<style scoped lang="scss">
.tools-section {
  padding: 40px 0;
  background: $bg-light;
  
  @include mobile {
    padding: 48px 0;
  }
}

.section-header {
  text-align: center;
  margin-bottom: 48px;
  
  @include mobile {
    margin-bottom: 32px;
  }
  
  .section-tag {
    font-size: 12px;
    font-weight: 600;
    color: $primary;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 12px;
  }
  
  .section-title {
    font-size: 32px;
    font-weight: 700;
    color: $text-primary;
    margin-bottom: 12px;
    
    @include mobile {
      font-size: 24px;
    }
  }
  
  .section-subtitle {
    font-size: 16px;
    color: $text-secondary;
  }
}

.tools-grid {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  gap: 24px;
  
  @include mobile {
    grid-template-columns: 1fr;
    padding: 0 16px;
  }
  
  @include desktop {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
