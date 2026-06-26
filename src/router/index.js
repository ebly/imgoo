import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ImageCompressView from '../views/ImageCompressView.vue'
import VideoCompressView from '../views/VideoCompressView.vue'
import VideoToGifView from '../views/VideoToGifView.vue'
import ImagePixelateView from '../views/ImagePixelateView.vue'
import ImageRemoveBgView from '../views/ImageRemoveBgView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/image-compress',
    name: 'image-compress',
    component: ImageCompressView
  },
  {
    path: '/video-compress',
    name: 'video-compress',
    component: VideoCompressView
  },
  {
    path: '/video-to-gif',
    name: 'video-to-gif',
    component: VideoToGifView
  },
  {
    path: '/image-pixelate',
    name: 'image-pixelate',
    component: ImagePixelateView
  },
  {
    path: '/image-remove-bg',
    name: 'image-remove-bg',
    component: ImageRemoveBgView
  }
]

const router = createRouter({
  history: createWebHistory('/'),
  routes
})

export default router
