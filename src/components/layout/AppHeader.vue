<template>
  <header class="app-header">
    <div class="header-container">
      <!-- Logo with Tool Dropdown -->
      <el-dropdown @command="handleToolNavigate" trigger="click">
        <div class="logo">
          <el-icon class="logo-icon"><Picture /></el-icon>
          <span class="logo-text">Imgoo</span>
          <el-icon class="logo-arrow"><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="/image-compress">
              <el-icon><Picture /></el-icon>
              {{ $t('tools.imageCompress.title') }}
            </el-dropdown-item>
            <el-dropdown-item command="/video-compress">
              <el-icon><VideoCamera /></el-icon>
              {{ $t('tools.videoCompress.title') }}
            </el-dropdown-item>
            <el-dropdown-item command="/video-to-gif">
              <el-icon><MagicStick /></el-icon>
              {{ $t('tools.videoToGif.title') }}
            </el-dropdown-item>
            <el-dropdown-item divided disabled>
              <el-icon><MoreFilled /></el-icon>
              {{ $t('workspace.moreComing') }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- Right Side -->
      <div class="header-right">
        <!-- Language Switcher -->
        <el-dropdown @command="handleLanguageChange">
          <span class="language-switcher">
            {{ locale === 'zh' ? '中文' : 'EN' }}
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="zh">中文</el-dropdown-item>
              <el-dropdown-item command="en">English</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </header>
</template>

<script setup>
import { Picture, ArrowDown, VideoCamera, MagicStick, MoreFilled } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { locale } = useI18n()

const handleToolNavigate = (command) => {
  router.push(command)
}

const handleLanguageChange = (command) => {
  locale.value = command
  localStorage.setItem('locale', command)
}
</script>

<style scoped lang="scss">
.app-header {
  background: $bg-white;
  border-bottom: 1px solid $border-light;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  @include mobile {
    padding: 0 16px;
  }
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background 0.2s;

  &:hover {
    background: $bg-light;
  }

  .logo-icon {
    font-size: 24px;
    color: $primary;
  }

  .logo-text {
    font-size: 20px;
    font-weight: 700;
    color: $text-primary;
  }

  .logo-arrow {
    font-size: 14px;
    color: $text-muted;
    transition: transform 0.2s;
  }
}

// When dropdown is open, rotate arrow
.el-dropdown:focus-within .logo-arrow {
  transform: rotate(180deg);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.language-switcher {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  font-size: 14px;
  color: $text-secondary;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.3s;

  &:hover {
    background: $bg-light;
    color: $text-primary;
  }
}
</style>
