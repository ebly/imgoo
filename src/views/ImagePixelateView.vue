<template>
  <div class="image-pixelate-view">
    <div class="page-container">
      <!-- 页面标题 -->
      <div class="page-header">
        <el-icon class="page-header-icon"><Grid /></el-icon>
        <h2>{{ $t('tools.imagePixelate.title') }}</h2>
      </div>

      <!-- 上传区域 -->
      <el-card class="section-card" shadow="never">
        <template #header>
          <span class="section-title">
            <el-icon><Upload /></el-icon>
            {{ $t('imagePixelate.uploadTitle') }}
          </span>
        </template>

        <div
          v-if="!sourceImageUrl"
          class="upload-zone"
          @dragover.prevent="dragOver = true"
          @dragleave.prevent="dragOver = false"
          @drop.prevent="handleDrop"
          @click="triggerUpload"
          :class="{ 'drag-over': dragOver }"
        >
          <el-icon class="upload-icon" :size="48"><UploadFilled /></el-icon>
          <p class="upload-text">{{ $t('imagePixelate.dropHint') }}</p>
          <p class="upload-hint">{{ $t('upload.supportedFormats') }}</p>
        </div>

        <input
          ref="fileInputRef"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/bmp"
          hidden
          @change="handleFileSelect"
        />
      </el-card>

      <!-- 参数控制 -->
      <el-card v-if="sourceImageUrl" class="section-card" shadow="never">
        <template #header>
          <span class="section-title">
            <el-icon><Setting /></el-icon>
            {{ $t('imagePixelate.controlTitle') }}
          </span>
        </template>

        <div class="control-panel">
          <div class="slider-row">
            <label class="slider-label">{{ $t('imagePixelate.pixelSize') }}</label>
            <el-slider
              v-model="pixelSize"
              :min="2"
              :max="64"
              :step="1"
              :show-tooltip="false"
              class="pixel-slider"
            />
            <span class="slider-value">{{ pixelSize }}px × {{ pixelSize }}px</span>
          </div>
          <div class="grid-toggle-row">
            <el-switch v-model="showGrid" size="small" />
            <span class="toggle-label">{{ $t('imagePixelate.showGrid') }}</span>
          </div>
        </div>
      </el-card>

      <!-- 预览对比 + 编辑面板 -->
      <el-card v-if="sourceImageUrl" class="section-card" shadow="never">
        <template #header>
          <span class="section-title">
            <el-icon><ZoomIn /></el-icon>
            {{ $t('imagePixelate.previewTitle') }}
          </span>
        </template>

        <div class="preview-container">
          <div class="preview-main">
            <div class="preview-item">
              <div class="preview-label">{{ $t('preview.original') }}</div>
              <div class="image-wrapper">
                <img :src="sourceImageUrl" alt="Original" class="preview-image" />
              </div>
              <div class="image-info">
                <span v-if="originalSize">{{ $t('preview.fileSize') }}: {{ formatSize(originalSize) }}</span>
                <span v-if="originalDimensions">{{ originalDimensions.width }} × {{ originalDimensions.height }}px</span>
              </div>
            </div>

            <div class="preview-divider">
              <el-icon :size="24"><ArrowRight /></el-icon>
            </div>

            <div class="preview-item">
              <div class="preview-label">{{ $t('imagePixelate.pixelated') }}</div>
              <div class="image-wrapper pixelated-wrapper">
                <canvas
                  ref="outputCanvasRef"
                  class="pixelated-canvas"
                  @click="handleCanvasClick"
                  :class="{ 'cursor-eyedropper': toolMode === 'eyedropper', 'cursor-paint': toolMode === 'paint' }"
                />
              </div>
              <div class="image-info">
                <span>{{ $t('imagePixelate.pixelSize') }}: {{ pixelSize }}px</span>
                <span>{{ blocksCols }} × {{ blocksRows }} {{ $t('imagePixelate.blocks') }}</span>
              </div>
            </div>
          </div>

          <!-- 编辑侧栏：吸色/上色 + 当前颜色 -->
          <div class="preview-sidebar">
            <div class="sidebar-section">
              <div class="sidebar-section-title">{{ $t('imagePixelate.editTitle') }}</div>
              <!-- 模式切换 -->
              <el-radio-group v-model="toolMode" size="small" class="mode-radio">
                <el-radio-button value="eyedropper">
                  <el-icon><MagicStick /></el-icon>
                  {{ $t('imagePixelate.eyedropper') }}
                </el-radio-button>
                <el-radio-button value="paint">
                  <el-icon><Edit /></el-icon>
                  {{ $t('imagePixelate.paint') }}
                </el-radio-button>
              </el-radio-group>

              <!-- 分隔线 -->
              <div class="sidebar-divider"></div>

              <!-- 当前颜色 -->
              <div class="color-section">
                <label class="color-label">{{ $t('imagePixelate.currentColor') }}:</label>
                <div class="color-preview" :style="{ background: currentColor }"></div>
                <el-color-picker
                  v-model="currentColor"
                  :predefine="predefinedColors"
                  size="small"
                  show-alpha
                />
              </div>

              <!-- 重置 -->
              <el-button size="small" @click="resetToOriginal" :disabled="!hasEdits" class="reset-btn">
                <el-icon><Refresh /></el-icon>
                {{ $t('imagePixelate.resetEdits') }}
              </el-button>

              <!-- 图例说明 -->
              <div class="edit-hint">
                <span v-if="toolMode === 'eyedropper'">
                  <el-icon><Pointer /></el-icon>
                  {{ $t('imagePixelate.eyedropperHint') }}
                </span>
                <span v-else>
                  <el-icon><EditPen /></el-icon>
                  {{ $t('imagePixelate.paintHint') }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="action-row">
          <el-button type="primary" @click="downloadPixelated" :disabled="!sourceImageUrl">
            <el-icon><Download /></el-icon>
            {{ $t('imagePixelate.download') }}
          </el-button>
          <el-button @click="resetImage">
            <el-icon><Refresh /></el-icon>
            {{ $t('imagePixelate.rechoose') }}
          </el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Grid, Upload, UploadFilled, Setting, ZoomIn, ArrowRight,
  Download, Refresh, EditPen, MagicStick, Edit, Pointer
} from '@element-plus/icons-vue'

const { t } = useI18n()

// 状态
const fileInputRef = ref(null)
const outputCanvasRef = ref(null)
const sourceImageUrl = ref(null)
const originalSize = ref(0)
const originalDimensions = ref(null)
const dragOver = ref(false)
const pixelSize = ref(16)
const imageElement = ref(null)
const showGrid = ref(true)

// 编辑相关
const toolMode = ref('eyedropper')  // 'eyedropper' | 'paint'
const currentColor = ref('#FF6B35')
const hasEdits = ref(false)

// 预定义颜色
const predefinedColors = [
  '#FF6B35', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
  '#EF4444', '#EC4899', '#1F2937', '#FFFFFF', '#9CA3AF'
]

// 像素块颜色数据: blockGrid[row][col] = '#RRGGBB'
const blockGrid = ref([])
const blocksCols = ref(0)
const blocksRows = ref(0)

// 触发文件选择
function triggerUpload() {
  fileInputRef.value?.click()
}

// 文件选择处理
function handleFileSelect(e) {
  const file = e.target.files?.[0]
  if (file) {
    loadImage(file)
  }
}

// 拖放处理
function handleDrop(e) {
  dragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('image/')) {
    loadImage(file)
  }
}

// 加载图片
function loadImage(file) {
  if (sourceImageUrl.value) {
    URL.revokeObjectURL(sourceImageUrl.value)
  }

  originalSize.value = file.size
  sourceImageUrl.value = URL.createObjectURL(file)

  const img = new Image()
  img.onload = () => {
    originalDimensions.value = {
      width: img.naturalWidth,
      height: img.naturalHeight
    }
    imageElement.value = img
    initBlockGrid()
  }
  img.src = sourceImageUrl.value
}

// 从原始图片初始化像素块颜色
function initBlockGrid() {
  const img = imageElement.value
  if (!img) return

  const size = pixelSize.value
  const cols = Math.max(1, Math.round(img.naturalWidth / size))
  const rows = Math.max(1, Math.round(img.naturalHeight / size))
  blocksCols.value = cols
  blocksRows.value = rows

  // 用临时 canvas 获取每个块的颜色
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = cols
  tempCanvas.height = rows
  const tempCtx = tempCanvas.getContext('2d')
  tempCtx.imageSmoothingEnabled = false
  tempCtx.drawImage(img, 0, 0, cols, rows)

  const imageData = tempCtx.getImageData(0, 0, cols, rows)
  const data = imageData.data
  const grid = []
  for (let r = 0; r < rows; r++) {
    const row = []
    for (let c = 0; c < cols; c++) {
      const idx = (r * cols + c) * 4
      const hex = rgbaToHex(data[idx], data[idx + 1], data[idx + 2], data[idx + 3])
      row.push(hex)
    }
    grid.push(row)
  }
  blockGrid.value = grid
  hasEdits.value = false
  renderBlocks()
}

// RGBA 转十六进制字符串
function rgbaToHex(r, g, b, a) {
  if (a < 128) return 'transparent'
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

// 渲染像素块到 canvas
function renderBlocks() {
  const canvas = outputCanvasRef.value
  if (!canvas || !blockGrid.value.length) return

  const grid = blockGrid.value
  const rows = grid.length
  const cols = grid[0].length
  const size = pixelSize.value
  const width = cols * size
  const height = rows * size

  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')

  // 绘制每个块
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const color = grid[r][c]
      if (color === 'transparent') {
        ctx.clearRect(c * size, r * size, size, size)
      } else {
        ctx.fillStyle = color
        ctx.fillRect(c * size, r * size, size, size)
      }
    }
  }

  // 绘制网格线
  if (showGrid.value) {
    ctx.strokeStyle = 'rgba(0,0,0,0.12)'
    ctx.lineWidth = 0.5
    for (let r = 0; r <= rows; r++) {
      ctx.beginPath()
      ctx.moveTo(0, r * size)
      ctx.lineTo(width, r * size)
      ctx.stroke()
    }
    for (let c = 0; c <= cols; c++) {
      ctx.beginPath()
      ctx.moveTo(c * size, 0)
      ctx.lineTo(c * size, height)
      ctx.stroke()
    }
  }

  // 标记已编辑的块（可选高亮）
  // (此处暂不实现)
}

// 像素化（初始转换，兼容之前的接口）
function renderPixelated() {
  if (blockGrid.value.length) return
  initBlockGrid()
}

// 处理画布点击
function handleCanvasClick(e) {
  const canvas = outputCanvasRef.value
  if (!canvas || !blockGrid.value.length) return

  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height
  const x = (e.clientX - rect.left) * scaleX
  const y = (e.clientY - rect.top) * scaleY
  const size = pixelSize.value
  const col = Math.floor(x / size)
  const row = Math.floor(y / size)
  const grid = blockGrid.value

  if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length) return

  if (toolMode.value === 'eyedropper') {
    // 吸色：读取该块颜色
    const color = grid[row][col]
    if (color !== 'transparent') {
      currentColor.value = color
    }
  } else if (toolMode.value === 'paint') {
    // 上色：用当前颜色填充该块
    grid[row][col] = currentColor.value
    hasEdits.value = true
    renderBlocks()
  }
}

// 重置为原始颜色
function resetToOriginal() {
  initBlockGrid()
}

// 监听网格显示开关
watch(showGrid, () => {
  renderBlocks()
})

// 监听像素大小变化
watch(pixelSize, () => {
  if (imageElement.value) {
    initBlockGrid()
  }
})

// 格式化文件大小
function formatSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 下载像素化图片（不包含网格线）
function downloadPixelated() {
  const canvas = outputCanvasRef.value
  if (!canvas) return

  // 重新渲染一次不含网格线的画布用于下载
  const grid = blockGrid.value
  const rows = grid.length
  const cols = grid[0].length
  const size = pixelSize.value
  const width = cols * size
  const height = rows * size

  const dlCanvas = document.createElement('canvas')
  dlCanvas.width = width
  dlCanvas.height = height
  const dlCtx = dlCanvas.getContext('2d')

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const color = grid[r][c]
      if (color === 'transparent') {
        dlCtx.clearRect(c * size, r * size, size, size)
      } else {
        dlCtx.fillStyle = color
        dlCtx.fillRect(c * size, r * size, size, size)
      }
    }
  }

  const link = document.createElement('a')
  link.download = `pixelated_${size}px.png`
  link.href = dlCanvas.toDataURL('image/png')
  link.click()
}

// 重置
function resetImage() {
  if (sourceImageUrl.value) {
    URL.revokeObjectURL(sourceImageUrl.value)
  }
  sourceImageUrl.value = null
  originalSize.value = 0
  originalDimensions.value = null
  imageElement.value = null
  pixelSize.value = 16
  blockGrid.value = []
  hasEdits.value = false
}
</script>

<style scoped lang="scss">
.image-pixelate-view {
  min-height: calc(100vh - 64px - 200px);
  padding: 24px;

  @include mobile {
    padding: 16px;
  }
}

.page-container {
  max-width: 960px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;

  h2 {
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

.section-card {
  margin-bottom: 20px;
  border-radius: 12px;

  :deep(.el-card__header) {
    padding: 14px 20px;
    border-bottom: 1px solid $border-light;
  }
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: $text-primary;
}

// 上传区域
.upload-zone {
  border: 2px dashed $border-medium;
  border-radius: 12px;
  padding: 48px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.25s;
  background: $bg-light;

  &:hover,
  &.drag-over {
    border-color: $primary;
    background: $primary-light;
  }

  .upload-icon {
    color: $text-muted;
    margin-bottom: 12px;
  }

  .upload-text {
    font-size: 15px;
    color: $text-secondary;
    margin: 0 0 8px;
  }

  .upload-hint {
    font-size: 12px;
    color: $text-muted;
    margin: 0;
  }
}

// 控制面板
.control-panel {
  padding: 8px 0;
}

.slider-row {
  display: flex;
  align-items: center;
  gap: 16px;

  @include mobile {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
}

.slider-label {
  font-size: 14px;
  font-weight: 500;
  color: $text-primary;
  white-space: nowrap;
  min-width: 80px;
}

.pixel-slider {
  flex: 1;
}

.slider-value {
  font-size: 14px;
  font-weight: 600;
  color: $primary;
  white-space: nowrap;
  min-width: 100px;
  text-align: right;
}

// 网格切换
.grid-toggle-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;

  .toggle-label {
    font-size: 13px;
    color: $text-secondary;
  }
}

// 预览对比
.preview-container {
  display: flex;
  align-items: flex-start;
  gap: 20px;

  @include mobile {
    flex-direction: column;
  }
}

.preview-main {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex: 1;
  min-width: 0;

  @include mobile {
    flex-direction: column;
  }
}

.preview-item {
  flex: 1;
  min-width: 0;
}

.preview-divider {
  display: flex;
  align-items: center;
  padding-top: 32px;
  color: $text-muted;
  flex-shrink: 0;

  @include mobile {
    padding-top: 0;
    justify-content: center;
    transform: rotate(90deg);
  }
}

.preview-label {
  font-size: 13px;
  font-weight: 600;
  color: $text-secondary;
  margin-bottom: 8px;
}

// 编辑侧栏
.preview-sidebar {
  width: 220px;
  flex-shrink: 0;

  @include mobile {
    width: 100%;
  }
}

.sidebar-section {
  background: $bg-light;
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sidebar-section-title {
  font-size: 13px;
  font-weight: 600;
  color: $text-primary;
}

.mode-radio {
  display: flex;
  gap: 0;

  :deep(.el-radio-button__inner) {
    padding: 6px 12px;
    font-size: 12px;
  }
}

.sidebar-divider {
  height: 1px;
  background: $border-light;
  margin: 0;
}

.color-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-label {
  font-size: 13px;
  color: $text-secondary;
  white-space: nowrap;
}

.color-preview {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 2px solid $border-light;
  flex-shrink: 0;
}

.reset-btn {
  width: 100%;
}

.edit-hint {
  padding: 8px 10px;
  background: $primary-light;
  border-radius: 6px;
  font-size: 12px;
  color: $primary-dark;
  display: flex;
  align-items: center;
  gap: 6px;

  span {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

.image-wrapper {
  border: 1px solid $border-light;
  border-radius: 8px;
  overflow: hidden;
  background: #f0f0f0;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  max-height: 400px;

  .preview-image {
    max-width: 100%;
    max-height: 400px;
    display: block;
    object-fit: contain;
  }
}

.pixelated-wrapper {
  .pixelated-canvas {
    max-width: 100%;
    max-height: 400px;
    display: block;
    image-rendering: pixelated;
    image-rendering: crisp-edges;

    &.cursor-eyedropper {
      cursor: crosshair;
    }

    &.cursor-paint {
      cursor: cell;
    }
  }
}

.image-info {
  display: flex;
  gap: 16px;
  margin-top: 8px;
  font-size: 12px;
  color: $text-muted;
  flex-wrap: wrap;
}

// 操作按钮
.action-row {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  justify-content: center;
}
</style>
