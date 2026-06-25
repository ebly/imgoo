<template>
  <div class="image-compress-view">
    <div class="page-header">
      <el-button text @click="goBack" class="back-btn">
        <el-icon><ArrowLeft /></el-icon>
        {{ $t('workspace.back') }}
      </el-button>
      <h2 class="page-title">{{ $t('tools.imageCompress.title') }}</h2>
    </div>
    <BatchSummary />
  </div>
</template>

<script setup>
import { ArrowLeft } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import BatchSummary from '@/components/common/BatchSummary.vue'

const router = useRouter()
const goBack = () => router.push('/')
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

    .back-btn {
      font-size: 14px;
      color: $text-secondary;

      &:hover {
        color: $primary;
      }
    }

    .page-title {
      font-size: 20px;
      font-weight: 600;
      color: $text-primary;
      margin: 0;
    }
  }
}
</style>
