<template>
  <div 
    class="upload-area"
    :class="{ 'is-dragover': isDragover, 'is-zip-mode': store.isZipMode }"
    @dragover.prevent="handleDragover"
    @dragleave="handleDragleave"
    @drop.prevent="handleDrop"
    @click="triggerFileInput"
  >
    <el-icon class="upload-icon"><UploadFilled /></el-icon>
    <p class="upload-text">{{ store.isZipMode ? $t('upload.zipModeActive') : $t('hero.dragDrop') }}</p>
    <p class="upload-hint">{{ store.isZipMode ? $t('upload.zipModeHint') : $t('hero.dragDropHint') }}</p>
    <input 
      ref="fileInput"
      type="file" 
      multiple 
      accept="image/*"
      @change="handleFileSelect"
      class="file-input"
    />
    <input 
      ref="zipFileInput"
      type="file" 
      accept=".zip"
      @change="handleZipSelect"
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
import { useZipHandler } from '@/composables/useZipHandler'
import { validateFiles } from '@/utils/validators'

const { t } = useI18n()
const store = useImageStore()
const { isZipFile, extractImagesFromZip } = useZipHandler()

const fileInput = ref(null)
const zipFileInput = ref(null)
const isDragover = ref(false)

const emit = defineEmits(['files-selected'])

const triggerFileInput = () => {
  if (store.isZipMode) return
  if (store.files.length === 0) {
    zipFileInput.value?.click()
  } else {
    fileInput.value?.click()
  }
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
  e.target.value = ''
}

const handleZipSelect = (e) => {
  const files = Array.from(e.target.files)
  e.target.value = ''
  if (files.length > 0) {
    processFiles(files)
  }
}

const processFiles = async (files) => {
  if (files.length === 0) return
  
  if (store.isZipMode) {
    ElMessage.warning(t('upload.zipModeLocked'))
    return
  }
  
  const zipFile = files.find(isZipFile)
  if (zipFile) {
    if (files.length > 1) {
      ElMessage.warning(t('upload.zipOnlyOne'))
      return
    }
    await processZipFile(zipFile)
    return
  }
  
  const { validFiles, errors } = validateFiles(files, store.files)
  
  errors.forEach(error => {
    ElMessage.warning(t(`upload.${error.message}`, { name: error.file }))
  })
  
  if (validFiles.length > 0) {
    store.addFiles(validFiles)
    emit('files-selected', validFiles)
    ElMessage.success(t('upload.selected', { count: validFiles.length }))
  }
}

const processZipFile = async (zipFile) => {
  const result = await extractImagesFromZip(zipFile)
  
  if (result.error) {
    if (result.error === 'maxFilesInZip') {
      ElMessage.error(t('upload.zipTooManyFiles', { count: result.count }))
    } else if (result.error === 'noImagesInZip') {
      ElMessage.error(t('upload.zipNoImages'))
    } else {
      ElMessage.error(t('upload.zipInvalid'))
    }
    return
  }
  
  store.setZipMode(true, zipFile.name)
  store.setFirstImageFile(result.firstFile)
  store.setZipExtractedFiles(result.files, result.count)
  store.setFiles([zipFile])
  emit('files-selected', result.files)
  ElMessage.success(t('upload.zipLoaded', { count: result.count, name: zipFile.name }))
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
  
  &.is-zip-mode {
    cursor: not-allowed;
    opacity: 0.7;
    
    &:hover {
      border-color: $border-medium;
      background: $bg-white;
    }
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
