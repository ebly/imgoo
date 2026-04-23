<template>
  <div class="feature-card">
    <div class="feature-icon">
      <el-icon><component :is="icon" /></el-icon>
    </div>
    <h3 class="feature-title">{{ title }}</h3>
    <p class="feature-desc">{{ desc }}</p>
    <a href="#" class="feature-link">
      {{ action }}
      <el-icon><ArrowRight /></el-icon>
    </a>
  </div>
</template>

<script setup>
import { ArrowRight } from '@element-plus/icons-vue'

defineProps({
  icon: {
    type: Object,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  desc: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true
  }
})
</script>

<style scoped lang="scss">
.feature-card {
  background: $bg-white;
  border-radius: 16px;
  padding: 32px 24px;
  text-align: center;
  border: 1px solid $border-light;
  transition: all 0.3s;
  
  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    transform: translateY(-4px);
  }
  
  .feature-icon {
    width: 64px;
    height: 64px;
    margin: 0 auto 20px;
    background: $primary-light;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .el-icon {
      font-size: 28px;
      color: $primary;
    }
  }
  
  .feature-title {
    font-size: 18px;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 12px;
  }
  
  .feature-desc {
    font-size: 14px;
    color: $text-secondary;
    line-height: 1.6;
    margin-bottom: 20px;
  }
  
  .feature-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: $primary;
    font-size: 14px;
    font-weight: 500;
    transition: gap 0.3s;
    
    &:hover {
      gap: 10px;
    }
  }
}
</style>
