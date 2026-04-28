<template>
  <section class="hero-section">
    <div class="hero-container">
      <div class="hero-right">
        <BatchSummary @files-selected="handleFilesSelected" />
      </div>
    </div>
  </section>
</template>

<script setup>
import BatchSummary from '../common/BatchSummary.vue'

const handleFilesSelected = (files) => {
  console.log('Files selected:', files)
}
</script>

<style scoped lang="scss">
.hero-container {
  display: flex;
  justify-content: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.hero-right {
  width: 100%;
  max-width: 600px;
}
</style>
