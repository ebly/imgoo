<template>
  <div class="home-view">
    <HeroSection />
    <ToolsSection />
    <FormatsSection />
  </div>
</template>

<script setup>
import HeroSection from '@/components/home/HeroSection.vue'
import ToolsSection from '@/components/home/ToolsSection.vue'
import FormatsSection from '@/components/home/FormatsSection.vue'
</script>

<style scoped>
.home-view {
  min-height: 100vh;
}
</style>
