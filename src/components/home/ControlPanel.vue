<template>
  <div class="control-panel">
    <h3 class="panel-title">{{ $t('control.title') }}</h3>
    
    <el-form label-position="top" size="default">
      <!-- 压缩质量 -->
      <el-form-item :label="$t('control.quality')">
        <el-slider 
          v-model="quality" 
          :min="10" 
          :max="100"
          :step="5"
          show-input
          :input-props="{ min: 10, max: 100 }"
        />
        <div class="quality-hint">
          {{ $t('control.qualityHint') }}
        </div>
      </el-form-item>
      
      <!-- 最大尺寸 -->
      <el-form-item :label="$t('control.maxSize')">
        <el-input-number 
          v-model="maxSize" 
          :min="100" 
          :max="4096"
          :step="100"
          controls-position="right"
          style="width: 100%"
        />
      </el-form-item>
      
      <!-- 输出格式 -->
      <el-form-item :label="$t('control.format')">
        <el-select v-model="outputFormat" style="width: 100%">
          <el-option :label="$t('control.formatOriginal')" value="original" />
          <el-option :label="$t('control.formatJpeg')" value="image/jpeg" />
          <el-option :label="$t('control.formatPng')" value="image/png" />
          <el-option :label="$t('control.formatWebp')" value="image/webp" />
        </el-select>
      </el-form-item>
      
      <!-- 操作按钮 -->
      <el-form-item>
        <el-button 
          type="primary" 
          size="large"
          :loading="store.processing"
          @click="handleCompress"
          :disabled="!store.hasFiles"
          style="width: 100%"
        >
          {{ store.processing ? $t('control.processing') : $t('control.startCompress') }}
        </el-button>
        <el-button @click="handleReset" style="width: 100%; margin-top: 8px">
          {{ $t('control.reset') }}
        </el-button>
      </el-form-item>
    </el-form>
    
    <!-- 进度显示 -->
    <div v-if="store.processing" class="progress-section">
      <el-progress :percentage="store.progress" :stroke-width="8" />
      <p class="progress-text">
        {{ $t('control.progress', { processed: store.processedCount, total: store.files.length }) }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { useImageStore } from '@/stores/imageStore'
import { useBatchProcessor } from '@/composables/useBatchProcessor'

const { t } = useI18n()
const store = useImageStore()
const { processBatch } = useBatchProcessor()

const quality = ref(60)
const maxSize = ref(1920)
const outputFormat = ref('original')

const emit = defineEmits(['compress-complete'])

const handleCompress = async () => {
  const options = {
    maxSizeMB: quality.value / 100,
    maxWidthOrHeight: maxSize.value,
    fileType: outputFormat.value === 'original' ? undefined : outputFormat.value
  }
  
  const result = await processBatch(options)
  
  if (result.results.length > 0) {
    ElMessage.success(t('common.success'))
  }
  
  if (result.errors.length > 0) {
    ElMessage.warning(t('common.error'))
  }
  
  emit('compress-complete', result)
}

const handleReset = () => {
  quality.value = 60
  maxSize.value = 1920
  outputFormat.value = 'original'
  store.clearFiles()
  store.clearResults()
}
</script>

<style scoped lang="scss">
.control-panel {
  background: $bg-white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  
  @include mobile {
    padding: 16px;
  }
  
  .panel-title {
    font-size: 18px;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 24px;
  }
  
  .quality-hint {
    font-size: 12px;
    color: $text-muted;
    margin-top: 8px;
  }
  
  .progress-section {
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid $border-light;
    
    .progress-text {
      text-align: center;
      font-size: 14px;
      color: $text-secondary;
      margin-top: 12px;
    }
  }
}
</style>
