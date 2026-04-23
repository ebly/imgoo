<template>
  <div 
    class="upload-area"
    :class="{ 'is-dragover': isDragover }"
    @dragover.prevent="handleDragover"
    @dragleave="handleDragleave"
    @drop.prevent="handleDrop"
    @click="triggerFileInput"
  >
    <el-icon class="upload-icon"><UploadFilled /></el-icon>
    <p class="upload-text">{{ $t('hero.dragDrop') }}</p>
    <p class="upload-hint">{{ $t('hero.dragDropHint') }}</p>
    <input 
      ref="fileInput"
      type="file" 
      multiple 
      accept="image/*"
      @change="handleFileSelect"
      class="file-input"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import { useImageStore } from '@/stores/imageStore'
import { validateFiles } from '@/utils/validators'

const { t } = useI18n()
const store = useImageStore()

const fileInput = ref(null)
const isDragover = ref(false)

const emit = defineEmits(['files-selected'])

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleDragover = () => {
  isDragover.value = true
}

const handleDragleave = () => {
  isDragover.value = false
}

const handleDrop = (e) => {
  isDragover.value = false
  const files = Array.from(e.dataTransfer.files)
  processFiles(files)
}

const handleFileSelect = (e) => {
  const files = Array.from(e.target.files)
  processFiles(files)
  // 清空 input 以便重复选择相同文件
  e.target.value = ''
}

const processFiles = (files) => {
  if (files.length === 0) return
  
  const { validFiles, errors } = validateFiles(files, store.files)
  
  // 显示错误信息
  errors.forEach(error => {
    ElMessage.warning(t(`upload.${error.message}`, { name: error.file }))
  })
  
  if (validFiles.length > 0) {
    store.addFiles(validFiles)
    emit('files-selected', validFiles)
    ElMessage.success(t('upload.selected', { count: validFiles.length }))
  }
}
</script>

<style scoped lang="scss">
.upload-area {
  border: 2px dashed $border-medium;
  border-radius: 16px;
  padding: 48px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: $bg-white;
  
  &:hover, &.is-dragover {
    border-color: $primary;
    background: $primary-light;
  }
  
  @include mobile {
    padding: 32px 16px;
  }
  
  .upload-icon {
    font-size: 48px;
    color: $primary;
    margin-bottom: 16px;
  }
  
  .upload-text {
    font-size: 16px;
    color: $text-primary;
    margin-bottom: 8px;
    font-weight: 500;
  }
  
  .upload-hint {
    font-size: 14px;
    color: $text-muted;
  }
  
  .file-input {
    display: none;
  }
}
</style>
