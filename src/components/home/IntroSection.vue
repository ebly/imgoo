<template>
  <section class="intro-section">
    <div class="intro-container">
      <span class="intro-tag">{{ $t('hero.tag') }}</span>
      <h1 class="intro-title">{{ $t('hero.title') }}</h1>
      <p class="intro-subtitle">{{ $t('hero.subtitle') }}</p>
    </div>
  </section>
</template>

<script setup>
</script>

<style scoped lang="scss">
.intro-section {
  text-align: center;
  padding: 40px 20px 20px;
  
  @include mobile {
    padding: 32px 16px 16px;
  }
  
  .intro-container {
    max-width: 800px;
    margin: 0 auto;
    
    .intro-tag {
      display: inline-block;
      padding: 6px 16px;
      background: $primary-light;
      color: $primary;
      font-size: 13px;
      font-weight: 600;
      border-radius: 20px;
      margin-bottom: 16px;
    }
    
    .intro-title {
      font-size: 32px;
      font-weight: 700;
      color: $text-primary;
      margin: 0 0 12px;
      line-height: 1.3;
      
      @include mobile {
        font-size: 24px;
      }
    }
    
    .intro-subtitle {
      font-size: 16px;
      color: $text-secondary;
      margin: 0;
      line-height: 1.6;
      
      @include mobile {
        font-size: 14px;
      }
    }
  }
}
</style>
