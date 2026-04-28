<template>
  <section id="contact-section" class="contact-section">
    <div class="contact-container">
      <div class="contact-header">
        <h2>{{ $t('contact.title') }}</h2>
        <p>{{ $t('contact.subtitle') }}</p>
      </div>
      
      <div class="contact-content">
        <el-form 
          ref="formRef"
          :model="form"
          :rules="rules"
          class="contact-form"
          @submit.prevent="handleSubmit"
        >
          <el-form-item prop="name">
            <el-input 
              v-model="form.name" 
              :placeholder="$t('contact.namePlaceholder')"
              size="large"
            >
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item prop="email">
            <el-input 
              v-model="form.email" 
              :placeholder="$t('contact.emailPlaceholder')"
              size="large"
            >
              <template #prefix>
                <el-icon><Message /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item prop="message">
            <el-input 
              v-model="form.message" 
              type="textarea"
              :rows="5"
              :placeholder="$t('contact.messagePlaceholder')"
              resize="none"
            />
          </el-form-item>
          
          <el-button 
            type="primary" 
            size="large" 
            class="submit-btn"
            :loading="loading"
            @click="handleSubmit"
          >
            {{ $t('contact.send') }}
          </el-button>
        </el-form>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { Message, User } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const { t } = useI18n()

const formRef = ref(null)
const loading = ref(false)

const getLastSubmitDate = () => {
  return localStorage.getItem('lastEmailSubmitDate')
}

const setLastSubmitDate = () => {
  const today = new Date().toDateString()
  localStorage.setItem('lastEmailSubmitDate', today)
}

const isAlreadySubmittedToday = () => {
  const lastDate = getLastSubmitDate()
  if (!lastDate) return false
  return lastDate === new Date().toDateString()
}

const form = reactive({
  name: '',
  email: '',
  message: ''
})

const rules = {
  name: [
    { required: true, message: t('contact.nameRequired'), trigger: 'blur' }
  ],
  email: [
    { required: true, message: t('contact.emailRequired'), trigger: 'blur' },
    { type: 'email', message: t('contact.emailInvalid'), trigger: 'blur' }
  ],
  message: [
    { required: true, message: t('contact.messageRequired'), trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  if (isAlreadySubmittedToday()) {
    ElMessage.warning(t('contact.alreadySubmitted'))
    return
  }

  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const formData = {
          name: form.name,
          email: form.email,
          message: form.message
        }

        const response = await fetch('https://formsubmit.co/ajax/eblybryan123@gmail.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        })

        const result = await response.json()

        if (result.success) {
          ElMessage.success(t('contact.success'))
          setLastSubmitDate()
          form.name = ''
          form.email = ''
          form.message = ''
          window.scrollTo({ top: 0, behavior: 'smooth' })
        } else {
          ElMessage.error(t('contact.error'))
        }
      } catch (error) {
        console.error('Submission failed:', error)
        ElMessage.error(t('contact.error'))
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped lang="scss">
.contact-section {
  padding: 80px 0;
  background: $bg-light;
}

.contact-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 24px;
  
  @include mobile {
    padding: 0 16px;
  }
}

.contact-header {
  text-align: center;
  margin-bottom: 48px;
  
  h2 {
    font-size: 32px;
    font-weight: 700;
    color: $text-primary;
    margin-bottom: 12px;
  }
  
  p {
    font-size: 16px;
    color: $text-secondary;
  }
}

.contact-content {
  display: flex;
  justify-content: center;
}

.contact-form {
  width:100%;
  background: $bg-white;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  
  .submit-btn {
    width: 100%;
    height: 48px;
    font-size: 16px;
    font-weight: 600;
  }
  
  :deep(.el-form-item) {
    margin-bottom: 20px;
  }
  
  :deep(.el-textarea__inner) {
    padding: 12px;
  }
}
</style>
