<template>
  <div class="home-view">
    <IntroSection />
    <HeroSection />
    <ToolsSection />
    <FormatsSection />
    <ContactSection />
  </div>
</template>

<script setup>
import IntroSection from '@/components/home/IntroSection.vue'
import HeroSection from '@/components/home/HeroSection.vue'
import ToolsSection from '@/components/home/ToolsSection.vue'
import FormatsSection from '@/components/home/FormatsSection.vue'
import ContactSection from '@/components/home/ContactSection.vue'
</script>

<style scoped>
.home-view {
  min-height: 100vh;
}
</style>
