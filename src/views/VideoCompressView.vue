<template>
  <div class="video-compress-view">
    <div class="page-header">
      <el-icon class="page-header-icon"><VideoCamera /></el-icon>
      <h2 class="page-title">{{ $t('tools.videoCompress.title') }}</h2>
    </div>
    <div class="coming-soon">
      <el-icon class="coming-icon"><VideoCamera /></el-icon>
      <h3>{{ $t('workspace.comingSoon') }}</h3>
      <p>{{ $t('workspace.videoComingSoonDesc') }}</p>
    </div>
  </div>
</template>

<script setup>
import { VideoCamera } from '@element-plus/icons-vue'
</script>

<style scoped lang="scss">
.video-compress-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  min-height: calc(100vh - 64px - 200px);

  @include mobile {
    padding: 16px;
  }

  .page-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;

    .page-title {
      font-size: 20px;
      font-weight: 600;
      color: $text-primary;
      margin: 0;
    }

    .page-header-icon {
      font-size: 22px;
      color: $primary;
    }
  }

  .coming-soon {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 24px;
    background: $bg-white;
    border-radius: 16px;
    border: 2px dashed $border-light;

    .coming-icon {
      font-size: 64px;
      color: $text-muted;
      margin-bottom: 16px;
    }

    h3 {
      font-size: 20px;
      font-weight: 600;
      color: $text-primary;
      margin: 0 0 8px;
    }

    p {
      font-size: 14px;
      color: $text-secondary;
      margin: 0;
    }
  }
}
</style>
