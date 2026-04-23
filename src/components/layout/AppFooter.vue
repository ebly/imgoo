<template>
  <footer class="app-footer">
    <div class="footer-container">
      <div class="footer-grid">
        <!-- Brand -->
        <div class="footer-brand">
          <div class="logo">
            <el-icon class="logo-icon"><Picture /></el-icon>
            <span class="logo-text">Imgoo</span>
          </div>
          <p class="description">{{ $t('footer.description') }}</p>
          <div class="social-links">
            <el-icon><ChatDotRound /></el-icon>
            <el-icon><User /></el-icon>
            <el-icon><Service /></el-icon>
          </div>
        </div>
        
        <!-- Tools -->
        <div class="footer-column">
          <h4>{{ $t('footer.tools') }}</h4>
          <ul>
            <li><a href="#">{{ $t('footer.resize') }}</a></li>
            <li><a href="#">{{ $t('footer.compress') }}</a></li>
            <li><a href="#">{{ $t('footer.convert') }}</a></li>
          </ul>
        </div>
        
        <!-- Company -->
        <div class="footer-column">
          <h4>{{ $t('footer.company') }}</h4>
          <ul>
            <li><a href="#">{{ $t('footer.about') }}</a></li>
            <li><a href="#">{{ $t('footer.contact') }}</a></li>
            <li><a href="#">{{ $t('footer.privacy') }}</a></li>
          </ul>
        </div>
        
        <!-- Resources -->
        <div class="footer-column">
          <h4>{{ $t('footer.resources') }}</h4>
          <ul>
            <li><a href="#">{{ $t('footer.blog') }}</a></li>
            <li><a href="#">{{ $t('footer.help') }}</a></li>
            <li><a href="#">{{ $t('footer.terms') }}</a></li>
          </ul>
        </div>
        
        <!-- Newsletter -->
        <div class="footer-newsletter">
          <h4>{{ $t('footer.newsletter') }}</h4>
          <p>{{ $t('footer.newsletterDesc') }}</p>
          <el-input
            v-model="email"
            :placeholder="$t('footer.emailPlaceholder')"
            class="email-input"
          >
            <template #append>
              <el-button type="primary">{{ $t('footer.subscribe') }}</el-button>
            </template>
          </el-input>
        </div>
      </div>
      
      <!-- Copyright -->
      <div class="footer-bottom">
        <p>{{ $t('footer.copyright') }}</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref } from 'vue'
import { Picture, ChatDotRound, User, Service } from '@element-plus/icons-vue'

const email = ref('')
</script>

<style scoped lang="scss">
.app-footer {
  background: $bg-dark;
  color: $text-white;
  padding: 48px 0 24px;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  
  @include mobile {
    padding: 0 16px;
  }
}

.footer-grid {
  display: grid;
  gap: 32px;
  
  @include mobile {
    grid-template-columns: 1fr;
  }
  
  @include desktop {
    grid-template-columns: 2fr 1fr 1fr 1fr 2fr;
  }
}

.footer-brand {
  .logo {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    
    .logo-icon {
      font-size: 24px;
      color: $primary;
    }
    
    .logo-text {
      font-size: 20px;
      font-weight: 700;
    }
  }
  
  .description {
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
    margin-bottom: 16px;
  }
  
  .social-links {
    display: flex;
    gap: 16px;
    
    .el-icon {
      font-size: 20px;
      color: rgba(255, 255, 255, 0.7);
      cursor: pointer;
      transition: color 0.3s;
      
      &:hover {
        color: $primary;
      }
    }
  }
}

.footer-column {
  h4 {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
  }
  
  ul {
    li {
      margin-bottom: 8px;
      
      a {
        color: rgba(255, 255, 255, 0.7);
        font-size: 14px;
        transition: color 0.3s;
        
        &:hover {
          color: $primary;
        }
      }
    }
  }
}

.footer-newsletter {
  h4 {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
  }
  
  p {
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
    margin-bottom: 16px;
  }
  
  .email-input {
    :deep(.el-input__wrapper) {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      box-shadow: none;
    }
    
    :deep(.el-input__inner) {
      color: $text-white;
      
      &::placeholder {
        color: rgba(255, 255, 255, 0.5);
      }
    }
  }
}

.footer-bottom {
  margin-top: 48px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  
  p {
    color: rgba(255, 255, 255, 0.5);
    font-size: 14px;
  }
}
</style>
