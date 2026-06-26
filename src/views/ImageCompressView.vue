<template>
  <div class="image-compress-view">
    <div class="page-header">
      <el-icon class="page-header-icon"><Picture /></el-icon>
      <h2 class="page-title">{{ $t('tools.imageCompress.title') }}</h2>
    </div>
    <BatchSummary />
  </div>
</template>

<script setup>
import { Picture } from '@element-plus/icons-vue'
import BatchSummary from '@/components/common/BatchSummary.vue'
</script>

<style scoped lang="scss">
.image-compress-view {
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
}
</style>
