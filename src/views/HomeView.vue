<template>
  <div class="home-view">
    <section class="tools-grid-section">
      <div class="tools-grid">
        <div
          v-for="tool in tools"
          :key="tool.key"
          class="tool-card"
          @click="navigateTo(tool.route)"
        >
          <div class="card-icon">
            <el-icon :size="32"><component :is="tool.icon" /></el-icon>
          </div>
          <h3 class="card-title">{{ tool.title }}</h3>
          <p class="card-desc">{{ tool.desc }}</p>
          <el-button type="primary" size="small" round class="card-btn">
            {{ tool.action }}
          </el-button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Picture, VideoCamera, MagicStick, Grid } from '@element-plus/icons-vue'

const router = useRouter()
const { t } = useI18n()

const tools = [
  {
    key: 'image',
    icon: Picture,
    title: t('tools.imageCompress.title'),
    desc: t('tools.imageCompress.desc'),
    action: t('tools.imageCompress.action'),
    route: '/image-compress'
  },
  {
    key: 'video',
    icon: VideoCamera,
    title: t('tools.videoCompress.title'),
    desc: t('tools.videoCompress.desc'),
    action: t('tools.videoCompress.action'),
    route: '/video-compress'
  },
  {
    key: 'video-to-gif',
    icon: MagicStick,
    title: t('tools.videoToGif.title'),
    desc: t('tools.videoToGif.desc'),
    action: t('tools.videoToGif.action'),
    route: '/video-to-gif'
  },
  {
    key: 'image-pixelate',
    icon: Grid,
    title: t('tools.imagePixelate.title'),
    desc: t('tools.imagePixelate.desc'),
    action: t('tools.imagePixelate.action'),
    route: '/image-pixelate'
  }
]

const navigateTo = (route) => {
  router.push(route)
}
</script>

<style scoped lang="scss">
.home-view {
  min-height: calc(100vh - 64px - 200px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 80px 24px 40px;

  @include mobile {
    padding: 48px 16px 32px;
  }
}

.tools-grid-section {
  width: 100%;
  max-width: 800px;
}

.tools-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

.tool-card {
  width: 160px;
  height: 180px;
  background: $bg-white;
  border-radius: 12px;
  border: 1px solid $border-light;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 12px;
  cursor: pointer;
  transition: all 0.25s;
  text-align: center;

  &:hover {
    border-color: $primary;
    box-shadow: 0 4px 16px rgba($primary, 0.12);
    transform: translateY(-3px);
  }

  .card-icon {
    width: 52px;
    height: 52px;
    border-radius: 12px;
    background: $primary-light;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $primary;
    flex-shrink: 0;
  }

  .card-title {
    font-size: 14px;
    font-weight: 600;
    color: $text-primary;
    margin: 0;
    line-height: 1.3;
  }

  .card-desc {
    font-size: 11px;
    color: $text-muted;
    margin: 0;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .card-btn {
    margin-top: auto;
    font-size: 11px;
    height: 26px;
    padding: 0 12px;
  }
}
</style>
