<template>
  <div class="video-to-gif-view">
    <div class="page-container">
      <!-- 页面标题 -->
      <div class="page-header">
        <el-button @click="$router.push('/')" text>
          <el-icon><ArrowLeft /></el-icon>
          {{ $t('workspace.back') }}
        </el-button>
        <h2>{{ $t('videoToGif.title') }}</h2>
      </div>

      <!-- 步骤 1: 上传视频 -->
      <el-card class="section-card" shadow="never">
        <template #header>
          <span class="section-title">
            <el-icon><Upload /></el-icon>
            {{ $t('videoToGif.step1') }}
          </span>
        </template>

        <div
          v-if="!videoFile"
          class="upload-zone"
          @dragover.prevent="dragOver = true"
          @dragleave.prevent="dragOver = false"
          @drop.prevent="handleDrop"
          @click="triggerUpload"
          :class="{ 'drag-over': dragOver }"
        >
          <el-icon class="upload-icon"><VideoCamera /></el-icon>
          <p>{{ $t('videoToGif.dropHint') }}</p>
          <el-button type="primary" size="small">{{ $t('videoToGif.selectFile') }}</el-button>
          <input
            ref="fileInput"
            type="file"
            accept="video/mp4,video/webm,video/ogg"
            style="display:none"
            @change="handleFileSelect"
          />
        </div>

        <div v-else class="video-info">
          <el-icon class="check-icon"><CircleCheckFilled /></el-icon>
          <span class="file-name">{{ videoFile.name }}</span>
          <span class="file-size">({{ formatSize(videoFile.size) }})</span>
          <el-button size="small" text type="danger" @click="resetVideo">
            {{ $t('common.remove') }}
          </el-button>
        </div>
      </el-card>

      <!-- 步骤 2: 预览与剪辑 -->
      <el-card v-if="videoFile" class="section-card" shadow="never">
        <template #header>
          <span class="section-title">
            <el-icon><VideoPlay /></el-icon>
            {{ $t('videoToGif.step2') }}
          </span>
        </template>

        <div class="video-preview-container">
          <video
            ref="videoEl"
            :src="videoUrl"
            controls
            preload="auto"
            @loadedmetadata="onVideoLoaded"
            @timeupdate="onTimeUpdate"
          ></video>
        </div>

        <div v-if="videoDuration" class="clip-controls">
          <div class="range-header">
            <span>{{ $t('videoToGif.clipRange') }}</span>
            <span class="time-labels">
              {{ formatTime(clipStart) }} ~ {{ formatTime(clipEnd) }}
              ({{ $t('videoToGif.duration') }}: {{ formatTime(clipEnd - clipStart) }})
            </span>
          </div>
          <el-slider
            v-model="clipRange"
            :min="0"
            :max="videoDuration"
            :step="0.1"
            range
            :format-tooltip="formatTime"
            @input="syncCurrentTime"
          />
          <div class="time-inputs">
            <el-input-number v-model="clipStart" :min="0" :max="clipEnd - 0.1" :step="0.5" :precision="1" size="small" />
            <span class="separator">~</span>
            <el-input-number v-model="clipEnd" :min="clipStart + 0.1" :max="videoDuration" :step="0.5" :precision="1" size="small" />
            <el-button size="small" @click="setToCurrentTime('start')">{{ $t('videoToGif.setStart') }}</el-button>
            <el-button size="small" @click="setToCurrentTime('end')">{{ $t('videoToGif.setEnd') }}</el-button>
          </div>

          <div class="clip-play-controls">
            <el-button
              :type="isPlayingClip ? 'warning' : 'success'"
              size="small"
              :icon="isPlayingClip ? SwitchIcon : VideoPlay"
              @click="toggleClipPlay"
            >
              {{ isPlayingClip ? $t('videoToGif.stopClip') : $t('videoToGif.playClip') }}
            </el-button>
            <div class="loop-control">
              <span class="loop-label">{{ $t('videoToGif.loop') }}</span>
              <el-switch v-model="clipLoop" size="small" />
            </div>
          </div>
        </div>
      </el-card>

      <!-- 步骤 3: 帧提取参数 -->
      <el-card v-if="videoFile" class="section-card" shadow="never">
        <template #header>
          <span class="section-title">
            <el-icon><Setting /></el-icon>
            {{ $t('videoToGif.step3') }}
          </span>
        </template>

        <div class="extract-params">
          <div class="param-item">
            <label>{{ $t('videoToGif.frameInterval') }}</label>
            <el-slider v-model="frameInterval" :min="1" :max="30" :step="1" show-input />
            <span class="param-hint">{{ $t('videoToGif.frameIntervalHint') }}</span>
          </div>
          <div class="param-item">
            <label>{{ $t('videoToGif.gifQuality') }}</label>
            <el-slider v-model="gifQuality" :min="1" :max="30" :step="1" show-input />
            <span class="param-hint">{{ $t('videoToGif.gifQualityHint') }}</span>
          </div>
          <div class="param-item">
            <label>{{ $t('videoToGif.outputWidth') }}</label>
            <el-input-number v-model="outputWidth" :min="50" :max="1920" :step="50" size="small" />
          </div>
          <div class="param-item">
            <label>{{ $t('videoToGif.frameDelay') }}</label>
            <el-input-number v-model="frameDelay" :min="10" :max="1000" :step="10" size="small">
              <template #suffix>ms</template>
            </el-input-number>
          </div>
          <div v-if="videoDuration" class="param-item estimate">
            <label>{{ $t('videoToGif.estimate') }}</label>
            <span class="estimate-value">{{ estimatedFrames }} {{ $t('videoToGif.framesCount') }}</span>
          </div>
        </div>

        <el-button
          type="primary"
          :loading="extracting"
          :disabled="extracting"
          @click="extractFrames"
          class="extract-btn"
        >
          <el-icon><VideoCameraFilled /></el-icon>
          {{ extracting ? $t('videoToGif.extracting') : $t('videoToGif.extract') }}
        </el-button>
      </el-card>

      <!-- 帧列表 -->
      <el-card v-if="frames.length > 0" class="section-card" shadow="never">
        <template #header>
          <span class="section-title">
            <el-icon><Grid /></el-icon>
            {{ $t('videoToGif.framesTitle', { count: frames.length }) }}
          </span>
        </template>

        <div class="frames-grid" v-if="frames.length > 0">
          <div
            v-for="(frame, index) in frames"
            :key="index"
            class="frame-item"
            @mouseenter="frame.hover = true"
            @mouseleave="frame.hover = false"
          >
            <img :src="frame.dataUrl" :alt="'Frame ' + (index + 1)" />
            <span class="frame-index">{{ index + 1 }}</span>
            <transition name="fade">
              <div v-if="frame.hover" class="frame-delete" @click.stop="removeFrame(index)">
                <el-icon><Delete /></el-icon>
              </div>
            </transition>
          </div>
        </div>

        <div v-if="frames.length > 0" class="frames-actions">
          <el-button type="danger" size="small" text @click="clearAllFrames">
            <el-icon><Delete /></el-icon>
            {{ $t('videoToGif.clearAll') }}
          </el-button>
        </div>
      </el-card>

      <!-- 生成 GIF -->
      <el-card v-if="frames.length > 0" class="section-card" shadow="never">
        <template #header>
          <span class="section-title">
            <el-icon><MagicStick /></el-icon>
            {{ $t('videoToGif.step4') }}
          </span>
        </template>

        <el-button
          type="success"
          size="large"
          :loading="generating"
          :disabled="generating || frames.length === 0"
          @click="generateGif"
          class="generate-btn"
        >
          <el-icon><MagicStick /></el-icon>
          {{ generating ? $t('videoToGif.generatingProgress', { current: generateProgress, total: frames.length }) : $t('videoToGif.generate') }}
        </el-button>

        <div v-if="generateProgress > 0" class="progress-bar-wrapper">
          <el-progress :percentage="Math.round((generateProgress / frames.length) * 100)" :stroke-width="12" />
        </div>
      </el-card>

      <!-- GIF 预览与下载 -->
      <el-card v-if="gifResultUrl" class="section-card" shadow="never">
        <template #header>
          <span class="section-title">
            <el-icon><PictureFilled /></el-icon>
            {{ $t('videoToGif.preview') }}
          </span>
        </template>

        <div class="gif-result">
          <div class="gif-preview">
            <img :src="gifResultUrl" alt="Generated GIF" />
          </div>
          <div class="gif-info">
            <p>{{ $t('videoToGif.resultInfo', { size: formatSize(gifResultSize) }) }}</p>
            <p>{{ $t('videoToGif.resultFrames', { count: frames.length }) }}</p>
          </div>
          <el-button type="primary" size="large" @click="downloadGif">
            <el-icon><Download /></el-icon>
            {{ $t('videoToGif.download') }}
          </el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import GIF from 'gif.js'
import {
  ArrowLeft, Upload, VideoCamera, VideoPlay,
  Setting, Grid, MagicStick, PictureFilled,
  Download, Delete, CircleCheckFilled, VideoCameraFilled,
  Switch as SwitchIcon
} from '@element-plus/icons-vue'

const { t } = useI18n()

// --- 文件上传 ---
const fileInput = ref(null)
const videoFile = ref(null)
const videoUrl = ref('')
const dragOver = ref(false)

const triggerUpload = () => fileInput.value?.click()

const handleFileSelect = (e) => {
  const file = e.target.files?.[0]
  if (file) loadVideo(file)
}

const handleDrop = (e) => {
  dragOver.value = false
  const file = e.dataTransfer.files?.[0]
  if (file && file.type.startsWith('video/')) {
    loadVideo(file)
  }
}

const loadVideo = (file) => {
  // 释放之前的 URL
  if (videoUrl.value) URL.revokeObjectURL(videoUrl.value)
  videoFile.value = file
  videoUrl.value = URL.createObjectURL(file)
}

const resetVideo = () => {
  if (videoUrl.value) URL.revokeObjectURL(videoUrl.value)
  videoFile.value = null
  videoUrl.value = ''
  videoDuration.value = 0
  clipRange.value = [0, 0]
  videoEl.value = null
  frames.value = []
  gifResultUrl.value = ''
  gifResultSize.value = 0
}

// --- 视频预览 ---
const videoEl = ref(null)
const videoDuration = ref(0)
const clipRange = ref([0, 0])
const clipStart = computed(() => clipRange.value[0])
const clipEnd = computed(() => clipRange.value[1])

const onVideoLoaded = () => {
  if (videoEl.value) {
    videoDuration.value = videoEl.value.duration
    clipRange.value = [0, videoEl.value.duration]
  }
}

const onTimeUpdate = () => {
  if (!isPlayingClip.value || !videoEl.value) return
  if (videoEl.value.currentTime >= clipEnd.value) {
    if (clipLoop.value) {
      videoEl.value.currentTime = clipStart.value
      videoEl.value.play()
    } else {
      videoEl.value.pause()
      isPlayingClip.value = false
      videoEl.value.currentTime = clipStart.value
    }
  }
}

const syncCurrentTime = (val) => {
  // 拖动滑块时同步视频当前时间到最近的端点
  if (videoEl.value) {
    // 如果拖的是起点附近的滑块，显示起点
    // el-slider range 返回 [start, end]
    // 这里只是为了预览，不做自动 seek
  }
}

const setToCurrentTime = (type) => {
  if (!videoEl.value) return
  const t = videoEl.value.currentTime
  if (type === 'start' && t < clipEnd.value - 0.1) {
    clipRange.value = [Math.round(t * 10) / 10, clipEnd.value]
  } else if (type === 'end' && t > clipStart.value + 0.1) {
    clipRange.value = [clipStart.value, Math.round(t * 10) / 10]
  }
}

// --- 剪辑播放 ---
const isPlayingClip = ref(false)
const clipLoop = ref(false)

const toggleClipPlay = () => {
  if (!videoEl.value) return
  if (isPlayingClip.value) {
    stopClipPlay()
  } else {
    startClipPlay()
  }
}

const startClipPlay = () => {
  const video = videoEl.value
  if (!video) return
  isPlayingClip.value = true
  video.currentTime = clipStart.value
  video.play()
}

const stopClipPlay = () => {
  const video = videoEl.value
  if (!video) return
  isPlayingClip.value = false
  video.pause()
  video.currentTime = clipStart.value
}

// 用户手动拖拽进度条或在 clipRange 变化时停止剪辑播放模式
watch(clipRange, () => {
  if (isPlayingClip.value) {
    isPlayingClip.value = false
  }
})

// --- 参数 ---
const frameInterval = ref(2)
const gifQuality = ref(10)
const outputWidth = ref(320)
const frameDelay = ref(100)

const estimatedFrames = computed(() => {
  if (!videoDuration.value) return 0
  const dur = clipEnd.value - clipStart.value
  if (dur <= 0) return 0
  // 假设 30fps 视频，每隔 frameInterval 帧取一帧
  // 帧率估计用 30fps
  return Math.ceil((dur * 30) / frameInterval.value)
})

// --- 帧提取 ---
const frames = ref([])
const extracting = ref(false)

const extractFrames = async () => {
  if (!videoEl.value || !videoFile.value) return

  extracting.value = true
  frames.value = []

  const video = videoEl.value
  const start = clipStart.value
  const end = clipEnd.value
  const interval = frameInterval.value
  const width = outputWidth.value

  // 创建离屏 canvas
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  // 先跳转到起始位置，等待 seek 完成
  video.currentTime = start
  await new Promise((resolve) => {
    const handler = () => { video.removeEventListener('seeked', handler); resolve() }
    video.addEventListener('seeked', handler)
  })

  // 估计帧率（从 video 的 metadata 或者用 30fps）
  const fps = 30
  // 计算每秒提取的帧数
  const framesPerSecond = fps / interval
  // 提取的总帧数
  const totalFrames = Math.ceil((end - start) * framesPerSecond)
  // 限制最大帧数
  const maxFrames = 200
  const actualFrames = Math.min(totalFrames, maxFrames)

  // 计算实际需要跳转的时间点
  const timePoints = []
  for (let i = 0; i < actualFrames; i++) {
    timePoints.push(start + (i * interval) / fps)
  }

  let canvasWidth = 0
  let canvasHeight = 0

  for (let i = 0; i < timePoints.length; i++) {
    if (!extracting.value) break // 允许取消

    video.currentTime = timePoints[i]
    await new Promise((resolve) => {
      const handler = () => { video.removeEventListener('seeked', handler); resolve() }
      video.addEventListener('seeked', handler)
    })

    // 等待一帧渲染
    await new Promise(r => requestAnimationFrame(r))

    // 设置 canvas 尺寸（基于第一次提取的视频尺寸）
    if (canvasWidth === 0) {
      const scale = width / video.videoWidth
      canvasWidth = width
      canvasHeight = Math.round(video.videoHeight * scale)
      canvas.width = canvasWidth
      canvas.height = canvasHeight
    }

    ctx.drawImage(video, 0, 0, canvasWidth, canvasHeight)

    frames.value.push({
      dataUrl: canvas.toDataURL('image/png'),
      hover: false
    })

    // 更新进度 - 已经通过 frames.length 显示
    if (i % 5 === 0) {
      // 允许 UI 更新
      await nextTick()
    }
  }

  extracting.value = false
}

const removeFrame = (index) => {
  frames.value.splice(index, 1)
}

const clearAllFrames = () => {
  frames.value = []
}

// --- GIF 生成 ---
const generating = ref(false)
const generateProgress = ref(0)
const gifResultUrl = ref('')
const gifResultSize = ref(0)

const generateGif = () => {
  if (frames.value.length === 0) return

  generating.value = true
  generateProgress.value = 0

  // 获取第一帧的尺寸
  const img = new Image()
  img.onload = () => {
    const w = img.naturalWidth
    const h = img.naturalHeight

    const gif = new GIF({
      workers: 2,
      quality: gifQuality.value,
      width: w,
      height: h,
      workerScript: '/gif.worker.js'
    })

    // 添加每一帧
    const totalFrames = frames.value.length

    const addNextFrame = (index) => {
      if (index >= totalFrames) {
        // 所有帧已添加，开始渲染
        gif.on('progress', (p) => {
          generateProgress.value = Math.round(p * totalFrames)
        })
        gif.on('finished', (blob) => {
          gifResultSize.value = blob.size
          if (gifResultUrl.value) URL.revokeObjectURL(gifResultUrl.value)
          gifResultUrl.value = URL.createObjectURL(blob)
          generating.value = false
          generateProgress.value = 0
        })
        gif.render()
        return
      }

      const frameImg = new Image()
      frameImg.onload = () => {
        const cvs = document.createElement('canvas')
        cvs.width = w
        cvs.height = h
        const ctx = cvs.getContext('2d')
        ctx.drawImage(frameImg, 0, 0)
        gif.addFrame(ctx, { delay: frameDelay.value, copy: true, dispose: 1 })
        generateProgress.value = index + 1
        // 延迟一下让 UI 更新
        setTimeout(() => addNextFrame(index + 1), 0)
      }
      frameImg.src = frames.value[index].dataUrl
    }

    addNextFrame(0)
  }

  img.src = frames.value[0].dataUrl
}

const downloadGif = () => {
  if (!gifResultUrl.value) return
  const a = document.createElement('a')
  a.href = gifResultUrl.value
  a.download = (videoFile.value?.name?.replace(/\.[^.]+$/, '') || 'output') + '.gif'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

// --- 工具函数 ---
const formatSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const formatTime = (seconds) => {
  if (seconds === undefined || isNaN(seconds)) return '00:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
</script>

<style scoped lang="scss">
.video-to-gif-view {
  min-height: calc(100vh - 64px - 200px);
  padding: 40px 24px 80px;

  @include mobile {
    padding: 24px 16px 48px;
  }
}

.page-container {
  max-width: 720px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;

  h2 {
    margin: 0;
    font-size: 20px;
    color: $text-primary;
  }
}

.section-card {
  margin-bottom: 20px;
  border-radius: 12px;

  :deep(.el-card__header) {
    padding: 12px 20px;
    border-bottom: 1px solid $border-light;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 600;
    color: $text-primary;

    .el-icon {
      font-size: 16px;
      color: $primary;
    }
  }
}

// 上传区域
.upload-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px 24px;
  border: 2px dashed $border-light;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s;
  text-align: center;

  &:hover,
  &.drag-over {
    border-color: $primary;
    background: $primary-light;
  }

  .upload-icon {
    font-size: 48px;
    color: $primary;
  }

  p {
    margin: 0;
    color: $text-secondary;
    font-size: 14px;
  }
}

.video-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;

  .check-icon {
    color: #67c23a;
    font-size: 18px;
  }

  .file-name {
    font-weight: 600;
    color: $text-primary;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .file-size {
    color: $text-muted;
    font-size: 13px;
    flex-shrink: 0;
  }
}

// 视频预览
.video-preview-container {
  margin-bottom: 16px;

  video {
    width: 100%;
    max-height: 400px;
    border-radius: 8px;
    background: #000;
  }
}

// 剪辑控制
.clip-controls {
  .range-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    font-size: 13px;
    color: $text-secondary;

    .time-labels {
      font-weight: 600;
      color: $primary;
    }
  }

  .time-inputs {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 12px;

    :deep(.el-input-number) {
      width: 110px;
    }

    .separator {
      color: $text-muted;
    }
  }

  .clip-play-controls {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid $border-light;

    .loop-control {
      display: flex;
      align-items: center;
      gap: 6px;

      .loop-label {
        font-size: 13px;
        color: $text-secondary;
      }
    }
  }
}

// 参数设置
.extract-params {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .param-item {
    display: flex;
    align-items: center;
    gap: 16px;

    @include mobile {
      flex-direction: column;
      align-items: stretch;
      gap: 8px;
    }

    label {
      min-width: 80px;
      font-size: 13px;
      color: $text-secondary;
      flex-shrink: 0;
    }

    .param-hint {
      font-size: 11px;
      color: $text-muted;
      white-space: nowrap;
    }

    &.estimate {
      .estimate-value {
        font-weight: 600;
        color: $primary;
      }
    }
  }
}

.extract-btn {
  margin-top: 20px;
  width: 100%;
}

// 帧列表
.frames-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px;
}

.frame-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid $border-light;
  cursor: default;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .frame-index {
    position: absolute;
    top: 4px;
    left: 4px;
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    font-size: 10px;
    padding: 1px 5px;
    border-radius: 4px;
  }

  .frame-delete {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 8px;

    .el-icon {
      font-size: 24px;
      color: #f56c6c;
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.frames-actions {
  margin-top: 12px;
  text-align: right;
}

// 生成按钮
.generate-btn {
  width: 100%;
}

.progress-bar-wrapper {
  margin-top: 16px;
}

// GIF 结果
.gif-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;

  .gif-preview {
    width: 100%;
    max-width: 400px;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid $border-light;

    img {
      width: 100%;
      display: block;
    }
  }

  .gif-info {
    text-align: center;
    font-size: 14px;
    color: $text-secondary;

    p {
      margin: 4px 0;
    }
  }
}
</style>
