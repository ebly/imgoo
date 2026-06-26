<template>
  <div class="image-remove-bg-view">
    <div class="page-container">
      <div class="page-header">
        <el-icon class="page-header-icon"><Scissor /></el-icon>
        <h2>{{ $t('tools.imageRemoveBg.title') }}</h2>
      </div>

      <el-card class="section-card" shadow="never">
        <template #header>
          <span class="section-title">
            <el-icon><Upload /></el-icon>
            {{ $t('imageRemoveBg.uploadTitle') }}
          </span>
        </template>
        <div v-if="!sourceImageUrl" class="upload-zone" @dragover.prevent="dragOver = true" @dragleave.prevent="dragOver = false" @drop.prevent="handleDrop" @click="triggerUpload" :class="{ 'drag-over': dragOver }">
          <el-icon class="upload-icon" :size="48"><UploadFilled /></el-icon>
          <p class="upload-text">{{ $t('imageRemoveBg.dropHint') }}</p>
          <p class="upload-hint">{{ $t('upload.supportedFormats') }}</p>
        </div>
        <input ref="fileInputRef" type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/bmp" hidden @change="handleFileSelect" />
      </el-card>

      <el-card v-if="sourceImageUrl" class="section-card" shadow="never">
        <template #header>
          <span class="section-title">
            <el-icon><Setting /></el-icon>
            {{ $t('imageRemoveBg.controlTitle') }}
          </span>
        </template>
        <div class="control-panel">
          <div class="action-row-top">
            <el-button type="primary" size="large" @click="removeBgAction" :loading="processing" :disabled="!sourceImageUrl">
              <el-icon><MagicStick /></el-icon>
              {{ processing ? $t('imageRemoveBg.removing') : $t('imageRemoveBg.removeBg') }}
            </el-button>
            <el-button v-if="bgRemoved" size="large" @click="restoreOriginal">
              <el-icon><RefreshRight /></el-icon>
              {{ $t('imageRemoveBg.restore') }}
            </el-button>
          </div>
          <div class="control-divider" />
          <div class="control-row">
            <label class="control-label">{{ $t('imageRemoveBg.model') }}</label>
            <div class="control-content">
              <el-select v-model="modelFile" size="small" style="width: 260px">
                <el-option label="RMBG-1.4 量化 (44MB)" value="model_quantized.onnx" />
                <el-option label="RMBG-1.4 FP16 (88MB)" value="model_fp16.onnx" />
                <el-option label="RMBG-1.4 FP32 (176MB)" value="model.onnx" />
              </el-select>
            </div>
          </div>
          <template v-if="bgRemoved">
            <div class="control-divider" />
            <div class="control-row">
              <label class="control-label">{{ $t('imageRemoveBg.bgColor') }}</label>
              <div class="control-content">
                <el-radio-group v-model="bgColorMode" size="small">
                  <el-radio-button value="transparent">{{ $t('imageRemoveBg.transparent') }}</el-radio-button>
                  <el-radio-button value="solid">{{ $t('imageRemoveBg.solidBg') }}</el-radio-button>
                </el-radio-group>
                <el-color-picker v-if="bgColorMode === 'solid'" v-model="bgColor" :predefine="predefinedColors" show-alpha size="small" />
              </div>
            </div>
            <div class="control-row">
              <label class="control-label">{{ $t('imageRemoveBg.opacity') }}</label>
              <div class="control-content">
                <el-slider v-model="opacity" :min="0" :max="100" :step="1" :show-tooltip="false" class="opacity-slider" />
                <span class="slider-value">{{ opacity }}%</span>
              </div>
            </div>
          </template>
        </div>
      </el-card>

      <el-card v-if="sourceImageUrl" class="section-card" shadow="never">
        <template #header>
          <span class="section-title">
            <el-icon><ZoomIn /></el-icon>
            {{ $t('imageRemoveBg.previewTitle') }}
          </span>
        </template>
        <div class="preview-container">
          <div class="preview-item">
            <div class="preview-label">{{ $t('preview.original') }}</div>
            <div class="image-wrapper">
              <img ref="sourceImageRef" :src="sourceImageUrl" alt="Original" class="preview-image" />
            </div>
            <div class="image-info" v-if="originalDimensions">
              <span>{{ originalDimensions.width }} × {{ originalDimensions.height }}px</span>
              <span v-if="originalSize">{{ formatSize(originalSize) }}</span>
            </div>
          </div>
          <div class="preview-divider"><el-icon :size="24"><ArrowRight /></el-icon></div>
          <div class="preview-item">
            <div class="preview-label">{{ $t('imageRemoveBg.resultPreview') }}</div>
            <div class="image-wrapper result-wrapper">
              <canvas ref="outputCanvasRef" class="result-canvas" v-show="bgRemoved" />
              <div v-if="!bgRemoved && !processing" class="placeholder-hint">
                <el-icon :size="32"><MagicStick /></el-icon>
                <p>{{ $t('imageRemoveBg.clickToRemove') }}</p>
              </div>
              <div v-if="processing" class="processing-overlay">
                <el-icon class="processing-icon" :size="36"><Loading /></el-icon>
                <p>{{ progressText }}</p>
              </div>
            </div>
            <div class="image-info" v-if="bgRemoved && originalDimensions">
              <span>{{ originalDimensions.width }} × {{ originalDimensions.height }}px</span>
            </div>
          </div>
        </div>
        <div class="action-row">
          <el-button type="primary" @click="downloadResult" :disabled="!bgRemoved">
            <el-icon><Download /></el-icon> {{ $t('imageRemoveBg.download') }}
          </el-button>
          <el-button @click="resetImage">
            <el-icon><Refresh /></el-icon> {{ $t('imageRemoveBg.rechoose') }}
          </el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import {
  Scissor, Upload, UploadFilled, Setting, ZoomIn,
  ArrowRight, Download, Refresh, MagicStick, RefreshRight,
  Loading
} from '@element-plus/icons-vue'

const { t } = useI18n()

const fileInputRef = ref(null)
const sourceImageRef = ref(null)
const outputCanvasRef = ref(null)
const sourceImageUrl = ref(null)
const originalSize = ref(0)
const originalDimensions = ref(null)
const dragOver = ref(false)

const processing = ref(false)
const bgRemoved = ref(false)
const resultBlob = ref(null)
const progressText = ref('')

const modelFile = ref('model_quantized.onnx')
const bgColorMode = ref('transparent')
const bgColor = ref('#FFFFFF')
const opacity = ref(100)

let ortSession = null
let lastModelFile = ''

const predefinedColors = [
  '#FF6B35', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
  '#EF4444', '#EC4899', '#1F2937', '#FFFFFF', '#000000'
]

function triggerUpload() { fileInputRef.value?.click() }
function handleFileSelect(e) {
  const file = e.target.files?.[0]
  if (file && file.type.startsWith('image/')) loadImage(file)
  e.target.value = ''
}
function handleDrop(e) {
  dragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('image/')) loadImage(file)
}
function loadImage(file) {
  cleanup()
  originalSize.value = file.size
  sourceImageUrl.value = URL.createObjectURL(file)
  const img = new Image()
  img.onload = () => { originalDimensions.value = { width: img.naturalWidth, height: img.naturalHeight } }
  img.src = sourceImageUrl.value
}

// ============== RMBG-1.4 via onnxruntime-web ==============

async function loadOrt() {
  if (window.__ort) return window.__ort
  progressText.value = '加载 AI 引擎...'
  const ort = await import('onnxruntime-web')
  // 从本地加载 WASM 文件
  ort.env.wasm.wasmPaths = '/ort/'
  window.__ort = ort
  return ort
}

async function removeBgAction() {
  if (!sourceImageUrl.value) return

  processing.value = true
  bgRemoved.value = false
  resultBlob.value = null
  progressText.value = '正在初始化...'

  try {
    const ort = await loadOrt()

    // 从本地加载模型
    const modelPath = `/models/RMBG-1.4/${modelFile.value}`
    if (!ortSession || lastModelFile !== modelFile.value) {
      // 清空旧会话
      if (ortSession) {
        try { ortSession.release() } catch {}
        ortSession = null
      }
      lastModelFile = modelFile.value
      progressText.value = `加载 ${modelFile.value} (${modelFile.value === 'model.onnx' ? '176' : modelFile.value === 'model_fp16.onnx' ? '88' : '44'}MB)...`
      console.time('load-model')
      const resp = await fetch(modelPath)
      if (!resp.ok) throw new Error(`模型文件 ${modelFile.value} 未找到`)
      const modelBuf = await resp.arrayBuffer()
      console.timeEnd('load-model')

      progressText.value = '模型初始化中...'
      console.time('create-session')
      ortSession = await ort.InferenceSession.create(modelBuf, {
        executionProviders: ['wasm'],
        graphOptimizationLevel: 'all',
        executionMode: 'parallel',
      })
      console.timeEnd('create-session')
      progressText.value = '模型加载完成✓'
    }

    // 读取原图
    const img = new Image()
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = sourceImageUrl.value })
    const w = img.naturalWidth, h = img.naturalHeight
    const SZ = 1024

    // 预处理：缩放到 1024x1024，归一化
    progressText.value = '预处理...'
    const c = document.createElement('canvas')
    c.width = SZ; c.height = SZ
    const ctx = c.getContext('2d')
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, 0, 0, w, h, 0, 0, SZ, SZ)
    const rgba = ctx.getImageData(0, 0, SZ, SZ).data
    const input = new Float32Array(3 * SZ * SZ)
    for (let i = 0; i < SZ * SZ; i++) {
      input[i] = (rgba[i * 4] - 128) / 256
      input[SZ * SZ + i] = (rgba[i * 4 + 1] - 128) / 256
      input[2 * SZ * SZ + i] = (rgba[i * 4 + 2] - 128) / 256
    }
    const tensor = new ort.Tensor('float32', input, [1, 3, SZ, SZ])

    // 推理
    progressText.value = 'AI 推理中...'
    const feeds = { [ortSession.inputNames[0]]: tensor }
    const results = await ortSession.run(feeds)
    const mask = results[ortSession.outputNames[0]].data // [1,1,1024,1024]

    // 后处理
    progressText.value = '生成结果...'
    const mc = document.createElement('canvas')
    mc.width = SZ; mc.height = SZ
    const mctx = mc.getContext('2d')
    const id = mctx.createImageData(SZ, SZ)
    const src = ctx.getImageData(0, 0, SZ, SZ).data
    for (let i = 0; i < SZ * SZ; i++) {
      id.data[i * 4] = src[i * 4]
      id.data[i * 4 + 1] = src[i * 4 + 1]
      id.data[i * 4 + 2] = src[i * 4 + 2]
      id.data[i * 4 + 3] = Math.round(mask[i] * 255)
    }
    mctx.putImageData(id, 0, 0)

    // 缩放到原尺寸
    const rc = document.createElement('canvas')
    rc.width = w; rc.height = h
    const rctx = rc.getContext('2d')
    rctx.drawImage(mc, 0, 0, SZ, SZ, 0, 0, w, h)

    const blob = await new Promise(r => rc.toBlob(r, 'image/png'))
    resultBlob.value = blob
    bgRemoved.value = true
    progressText.value = ''

    await nextTick()
    renderResult()
  } catch (err) {
    console.error('RMBG-1.4 failed:', err)
    ElMessage.error(err.message || t('imageRemoveBg.error'))
  } finally {
    processing.value = false
    progressText.value = ''
  }
}

function renderResult() {
  const canvas = outputCanvasRef.value
  if (!canvas || !resultBlob.value) return
  const img = new Image()
  img.onload = () => {
    canvas.width = img.naturalWidth; canvas.height = img.naturalHeight
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (bgColorMode.value === 'solid' && bgColor.value) {
      ctx.fillStyle = bgColor.value; ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    ctx.globalAlpha = opacity.value / 100; ctx.drawImage(img, 0, 0); ctx.globalAlpha = 1
  }
  img.src = URL.createObjectURL(resultBlob.value)
}

function restoreOriginal() { bgColorMode.value = 'transparent'; opacity.value = 100; renderResult() }

watch(bgColorMode, () => { if (bgRemoved.value) renderResult() })
watch(bgColor, () => { if (bgRemoved.value && bgColorMode.value === 'solid') renderResult() })
watch(opacity, () => { if (bgRemoved.value) renderResult() })

function downloadResult() {
  if (!resultBlob.value || !bgRemoved.value) return
  const c = outputCanvasRef.value; if (!c) return
  const a = document.createElement('a'); a.download = 'removed_bg.png'; a.href = c.toDataURL('image/png'); a.click()
}

function formatSize(bytes) {
  if (!bytes) return '0 B'
  const k = 1024; const s = ['B', 'KB', 'MB', 'GB']; const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / k ** i).toFixed(2)) + ' ' + s[i]
}

function cleanup() {
  if (sourceImageUrl.value) URL.revokeObjectURL(sourceImageUrl.value)
  if (resultBlob.value) URL.revokeObjectURL(resultBlob.value)
  sourceImageUrl.value = null; originalSize.value = 0; originalDimensions.value = null
  bgRemoved.value = false; resultBlob.value = null; progressText.value = ''
  bgColorMode.value = 'transparent'; bgColor.value = '#FFFFFF'; opacity.value = 100
}
function resetImage() { cleanup() }
onBeforeUnmount(() => { cleanup() })
</script>

<style scoped lang="scss">
.image-remove-bg-view { min-height: calc(100vh - 64px - 200px); padding: 24px; @include mobile { padding: 16px; } }
.page-container { max-width: 960px; margin: 0 auto; }
.page-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; h2 { font-size: 20px; font-weight: 600; color: $text-primary; margin: 0; } .page-header-icon { font-size: 22px; color: $primary; } }
.section-card { margin-bottom: 20px; border-radius: 12px; :deep(.el-card__header) { padding: 14px 20px; border-bottom: 1px solid $border-light; } }
.section-title { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: $text-primary; }
.upload-zone { border: 2px dashed $border-medium; border-radius: 12px; padding: 48px 24px; text-align: center; cursor: pointer; transition: all .25s; background: $bg-light; &:hover, &.drag-over { border-color: $primary; background: $primary-light; } .upload-icon { color: $text-muted; margin-bottom: 12px; } .upload-text { font-size: 15px; color: $text-secondary; margin: 0 0 8px; } .upload-hint { font-size: 12px; color: $text-muted; margin: 0; } }
.control-panel { padding: 8px 0; }
.action-row-top { display: flex; gap: 12px; justify-content: center; }
.control-divider { height: 1px; background: $border-light; margin: 16px 0; }
.control-row { display: flex; align-items: center; gap: 16px; margin-bottom: 12px; @include mobile { flex-direction: column; align-items: stretch; gap: 8px; } }
.control-label { font-size: 14px; font-weight: 500; color: $text-primary; white-space: nowrap; min-width: 80px; }
.control-content { display: flex; align-items: center; gap: 12px; flex: 1; flex-wrap: wrap; }
.opacity-slider { flex: 1; min-width: 120px; }
.slider-value { font-size: 14px; font-weight: 600; color: $primary; white-space: nowrap; min-width: 40px; text-align: right; }
.preview-container { display: flex; align-items: flex-start; gap: 16px; @include mobile { flex-direction: column; } }
.preview-item { flex: 1; min-width: 0; }
.preview-divider { display: flex; align-items: center; padding-top: 32px; color: $text-muted; flex-shrink: 0; @include mobile { padding-top: 0; justify-content: center; transform: rotate(90deg); } }
.preview-label { font-size: 13px; font-weight: 600; color: $text-secondary; margin-bottom: 8px; }
.image-wrapper { border: 1px solid $border-light; border-radius: 8px; overflow: hidden; display: flex; align-items: center; justify-content: center; max-height: 400px; min-height: 200px; position: relative; .preview-image { max-width: 100%; max-height: 400px; display: block; object-fit: contain; } }
.result-wrapper { background-image: linear-gradient(45deg,#e5e5e5 25%,transparent 25%),linear-gradient(-45deg,#e5e5e5 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e5e5e5 75%),linear-gradient(-45deg,transparent 75%,#e5e5e5 75%); background-size: 20px 20px; background-position: 0 0,0 10px,10px -10px,-10px 0; }
.result-canvas { max-width: 100%; max-height: 400px; display: block; }
.placeholder-hint { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 40px; color: $text-muted; p { margin: 0; font-size: 14px; } }
.processing-overlay { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 40px; color: $primary; .processing-icon { animation: spin 1s linear infinite; } p { margin: 0; font-size: 14px; color: $text-secondary; } }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.image-info { display: flex; gap: 16px; margin-top: 8px; font-size: 12px; color: $text-muted; flex-wrap: wrap; }
.action-row { display: flex; gap: 12px; margin-top: 20px; justify-content: center; }
</style>
