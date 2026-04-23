<template>
  <section class="formats-section">
    <div class="formats-container">
      <div class="formats-content">
        <h2 class="formats-title">{{ $t('formats.title') }}</h2>
        <p class="formats-subtitle">{{ $t('formats.subtitle') }}</p>
        <el-button type="primary" size="large">
          {{ $t('formats.action') }}
        </el-button>
      </div>
      
      <div class="formats-icons">
        <div class="format-icon" v-for="format in formats" :key="format.name">
          <div class="format-badge" :class="{ 'is-active': format.isActive }">
            {{ format.name }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const formats = [
  { name: 'JPG', isActive: false },
  { name: 'PNG', isActive: true },
  { name: 'WebP', isActive: false },
  { name: 'GIF', isActive: false }
]
</script>

<style scoped lang="scss">
.formats-section {
  padding: 80px 0;
  background: $bg-white;
  
  @include mobile {
    padding: 48px 0;
  }
}

.formats-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 48px;
  
  @include mobile {
    flex-direction: column;
    text-align: center;
    padding: 0 16px;
    gap: 32px;
  }
  
  @include desktop {
    flex-direction: row;
  }
}

.formats-content {
  flex: 1;
  
  .formats-title {
    font-size: 28px;
    font-weight: 700;
    color: $text-primary;
    margin-bottom: 12px;
    
    @include mobile {
      font-size: 24px;
    }
  }
  
  .formats-subtitle {
    font-size: 16px;
    color: $text-secondary;
    margin-bottom: 24px;
    line-height: 1.6;
  }
}

.formats-icons {
  display: flex;
  gap: 16px;
  
  @include mobile {
    justify-content: center;
  }
  
  .format-icon {
    .format-badge {
      width: 60px;
      height: 70px;
      background: $bg-light;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 600;
      color: $text-secondary;
      border: 1px solid $border-light;
      position: relative;
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        width: 0;
        height: 0;
        border-style: solid;
        border-width: 0 16px 16px 0;
        border-color: transparent $border-light transparent transparent;
      }
      
      &.is-active {
        background: $primary-light;
        color: $primary;
        border-color: $primary;
        
        &::before {
          border-color: transparent $primary transparent transparent;
        }
      }
    }
  }
}
</style>
