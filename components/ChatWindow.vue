<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  aiResponse: {
    type: String,
    default: ''
  },
  isGenerating: {
    type: Boolean,
    default: false
  },
  isStreaming: {
    type: Boolean,
    default: false
  },
  waitingForFirstChunk: {
    type: Boolean,
    default: false
  },
  chunkReceived: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['generate', 'update:prompt'])

const prompt = ref('')
const chatContainer = ref(null)

// Scroll to bottom when new messages arrive
watch(() => props.aiResponse, () => {
  setTimeout(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  }, 100)
})

function handleSubmit() {
  if (!prompt.value.trim()) return
  emit('update:prompt', prompt.value)
  emit('generate')
  prompt.value = ''
}
</script>

<template>
  <div class="chat-window h-full flex flex-col">
    <!-- Chat Header -->
    <div class="chat-header bg-primary text-primary-content p-4">
      <h2 class="text-xl font-bold flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        AI Chat Assistant
      </h2>
    </div>
    
    <!-- Chat Messages -->
    <div ref="chatContainer" class="chat-messages flex-1 overflow-y-auto p-4 bg-base-100">
      <div v-if="!aiResponse && !isGenerating" class="flex flex-col items-center justify-center h-full text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-primary opacity-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p class="text-lg text-gray-500 mt-4">Ask a question about the PDF</p>
        <p class="text-sm text-gray-400">I'll analyze the content and provide insights</p>
      </div>
      
      <div v-else>
        <!-- User Message (if there's a response) -->
        <div v-if="aiResponse || isGenerating" class="chat chat-end mb-4">
          <div class="chat-image avatar">
            <div class="w-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <div class="chat-bubble chat-bubble-primary">
            <p>{{ $attrs.userPrompt || 'Analyze this PDF document' }}</p>
          </div>
        </div>
        
        <!-- AI Response -->
        <div class="chat chat-start">
          <div class="chat-image avatar">
            <div class="w-10 rounded-full bg-base-300 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
              </svg>
            </div>
          </div>
          <div 
            class="chat-bubble bg-base-200 transition-all"
            :class="{ 'border-primary border-2': chunkReceived, 'border-transparent border-2': !chunkReceived }"
          >
            <div v-if="waitingForFirstChunk" class="flex items-center justify-center py-2">
              <div class="loading loading-dots loading-md text-primary"></div>
            </div>
            <div v-else-if="aiResponse" class="prose max-w-none">
              <p class="whitespace-pre-wrap">{{ aiResponse }}</p>
            </div>
            <div v-else class="flex items-center justify-center py-2">
              <div class="loading loading-spinner loading-sm text-primary"></div>
            </div>
          </div>
          
          <!-- Streaming indicator -->
          <div v-if="isStreaming" class="chat-footer opacity-75 flex items-center mt-1">
            <span class="text-xs">Streaming</span>
            <span class="relative flex h-2 w-2 ml-1">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Chat Input -->
    <div class="chat-input p-4 bg-base-200 border-t border-base-300">
      <form @submit.prevent="handleSubmit" class="flex gap-2">
        <input 
          v-model="prompt" 
          type="text" 
          class="input input-bordered flex-1 focus:input-primary focus:outline-none" 
          placeholder="Ask about the PDF content..."
          :disabled="isGenerating"
        />
        <button 
          type="submit" 
          class="btn btn-primary" 
          :disabled="!prompt.trim() || isGenerating"
        >
          <span v-if="isGenerating" class="loading loading-spinner loading-xs"></span>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.chat-messages {
  min-height: 0;
}
</style> 