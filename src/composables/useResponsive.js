import { ref, computed, onMounted, onUnmounted } from 'vue'

export function useResponsive() {
  const width = ref(window.innerWidth)
  const BREAKPOINT = 768
  
  const isMobile = computed(() => width.value <= BREAKPOINT)
  const isDesktop = computed(() => width.value > BREAKPOINT)
  
  const handleResize = () => {
    width.value = window.innerWidth
  }
  
  onMounted(() => {
    window.addEventListener('resize', handleResize)
  })
  
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })
  
  return {
    width,
    isMobile,
    isDesktop,
    BREAKPOINT
  }
}
