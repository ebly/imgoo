<template>
  <header class="app-header">
    <div class="header-container">
      <!-- Logo -->
      <div class="logo">
        <el-icon class="logo-icon"><Picture /></el-icon>
        <span class="logo-text">Imgoo</span>
      </div>
      
      <!-- Desktop Navigation -->
      <nav class="desktop-nav" v-if="isDesktop">
        <el-menu mode="horizontal" :ellipsis="false">
          <el-menu-item index="1">{{ $t('header.home') }}</el-menu-item>
          <el-menu-item index="2">
            <span class="nav-link" @click="scrollToTools">{{ $t('header.tools') }}</span>
          </el-menu-item>
          <el-menu-item index="3">
            <span class="nav-link" @click="scrollToContact">{{ $t('header.contact') }}</span>
          </el-menu-item>
        </el-menu>
      </nav>
      
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
        
        <!-- Mobile Menu Button -->
        <el-button 
          v-if="isMobile" 
          :icon="Menu" 
          circle 
          @click="mobileMenuVisible = true"
          class="mobile-menu-btn"
        />
      </div>
    </div>
    
    <!-- Mobile Drawer -->
    <el-drawer v-model="mobileMenuVisible" direction="rtl" size="280px">
      <template #header>
        <div class="drawer-header">
          <el-icon class="logo-icon"><Picture /></el-icon>
          <span>Imgoo</span>
        </div>
      </template>
      <el-menu>
        <el-menu-item index="1">{{ $t('header.home') }}</el-menu-item>
        <el-menu-item index="2" @click="scrollToToolsAndClose">{{ $t('header.tools') }}</el-menu-item>
        <el-menu-item index="3" @click="scrollToContactAndClose">{{ $t('header.contact') }}</el-menu-item>
      </el-menu>
    </el-drawer>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Picture, ArrowDown, Menu } from '@element-plus/icons-vue'
import { useResponsive } from '@/composables/useResponsive'

const { locale } = useI18n()
const { isMobile, isDesktop } = useResponsive()

const mobileMenuVisible = ref(false)

const handleLanguageChange = (command) => {
  locale.value = command
  localStorage.setItem('locale', command)
}

const scrollToContact = () => {
  const contactSection = document.getElementById('contact-section')
  if (contactSection) {
    contactSection.scrollIntoView({ behavior: 'smooth' })
  }
}

const scrollToTools = () => {
  const toolsSection = document.getElementById('tools-section')
  if (toolsSection) {
    toolsSection.scrollIntoView({ behavior: 'smooth' })
  }
}

const scrollToContactAndClose = () => {
  mobileMenuVisible.value = false
  setTimeout(() => {
    scrollToContact()
  }, 300)
}

const scrollToToolsAndClose = () => {
  mobileMenuVisible.value = false
  setTimeout(() => {
    scrollToTools()
  }, 300)
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
  
  .logo-icon {
    font-size: 24px;
    color: $primary;
  }
  
  .logo-text {
    font-size: 20px;
    font-weight: 700;
    color: $text-primary;
  }
}

.desktop-nav {
  flex: 1;
  display: flex;
  justify-content: center;
  
  :deep(.el-menu) {
    border-bottom: none;
    background: transparent;
  }
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

.mobile-menu-btn {
  @include desktop {
    display: none;
  }
}

.drawer-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 700;
  
  .logo-icon {
    font-size: 24px;
    color: $primary;
  }
}
</style>
