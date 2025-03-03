<script setup>
    // AI text generation
    const prompt = ref('')
    const aiResponse = ref('')
    const isGenerating = ref(false)
    const isStreaming = ref(false)
    const waitingForFirstChunk = ref(false)
    const chunkReceived = ref(false)
    const selectedFile = ref(null)

    const handleFileChange = (event) => {
      const file = event.target.files[0]
      if (file && file.type === 'application/pdf') {
        selectedFile.value = file
      } else {
        alert('Please select a PDF file')
        event.target.value = null
      }
    }
    
    const generateAIResponse = async () => {
      if (!prompt.value.trim() && !selectedFile.value) return
      
      isGenerating.value = true
      aiResponse.value = ''
      
      try {
        if (selectedFile.value) {
          // Handle PDF upload and analysis
          const formData = new FormData()
          formData.append('file', selectedFile.value)
          
          // Set waiting state before fetch
          waitingForFirstChunk.value = true
          
          // For streaming response, we need to use fetch directly instead of useFetch
          const response = await fetch('/api/analyze-pdf', {
            method: 'POST',
            body: formData
          })
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          
          // Get a reader from the response body stream
          const reader = response.body.getReader()
          const decoder = new TextDecoder()
          
          // Stream started
          isStreaming.value = true
          
          // Read the stream
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            
            // First chunk received
            if (waitingForFirstChunk.value) {
              waitingForFirstChunk.value = false
            }
            
            // Show chunk received animation
            chunkReceived.value = true
            setTimeout(() => {
              chunkReceived.value = false
            }, 300)
            
            // Decode the chunk and append to the response
            const chunk = decoder.decode(value, { stream: true })
            aiResponse.value += chunk
          }
          
          selectedFile.value = null
          // Reset file input
          const fileInput = document.querySelector('input[type="file"]')
          if (fileInput) fileInput.value = ''
        } else {
          // Regular text generation
          const { data, error } = await useFetch('/api/generate', {
            method: 'POST',
            body: {
              prompt: prompt.value
            }
          })
          
          if (error.value) throw error.value
          aiResponse.value = data.value.result.text
        }
      } catch (error) {
        console.error('Error:', error)
        aiResponse.value = 'Sorry, there was an error processing your request.'
      } finally {
        isGenerating.value = false
        isStreaming.value = false
        waitingForFirstChunk.value = false
      }
    }
</script>

<template>
    <div class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-gray-100 p-6">
      <!-- AI Text Generation Card -->
      <div class="card w-full max-w-3xl bg-base-100 shadow-xl border border-gray-200">
        <div class="card-body p-6">
          <h2 class="card-title text-2xl font-bold text-primary mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
            </svg>
            AI Text Generation
          </h2>
          
          <div class="divider"></div>
          
          <!-- Text Input Section -->
          <div class="form-control">
            <label class="label">
              <span class="label-text text-lg font-medium">Enter your prompt</span>
            </label>
            <div class="relative">
              <textarea 
                v-model="prompt" 
                class="textarea textarea-bordered h-40 text-lg w-full focus:textarea-primary focus:outline-none" 
                placeholder="Ask Grok something..."
                :disabled="selectedFile || isGenerating"
              ></textarea>
              <div v-if="prompt.trim()" class="absolute top-2 right-2">
                <button 
                  @click="prompt = ''" 
                  class="btn btn-circle btn-xs btn-ghost"
                  :disabled="isGenerating"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- PDF Upload Section -->
          <div class="form-control mt-6">
            <label class="label">
              <span class="label-text text-lg font-medium">Or upload a PDF for analysis</span>
            </label>
            <div class="flex flex-col gap-2">
              <input 
                type="file" 
                accept=".pdf"
                @change="handleFileChange"
                class="file-input file-input-bordered file-input-primary w-full"
                :disabled="isGenerating"
              />
              <div v-if="selectedFile" class="flex items-center">
                <div class="badge badge-primary p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  PDF Selected: {{ selectedFile.name }}
                </div>
                <button 
                  @click="selectedFile = null" 
                  class="btn btn-ghost btn-xs ml-2"
                  :disabled="isGenerating"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <!-- Generate Button -->
          <button 
            @click="generateAIResponse" 
            class="btn btn-primary btn-lg mt-6 w-full" 
            :disabled="isGenerating || (!prompt.trim() && !selectedFile)"
          >
            <span v-if="isGenerating && !isStreaming" class="loading loading-spinner loading-md mr-2"></span>
            {{ isGenerating ? (waitingForFirstChunk ? 'Initializing...' : (isStreaming ? 'Receiving data...' : 'Processing...')) : (selectedFile ? 'Analyze PDF' : 'Generate') }}
          </button>
          
          <!-- Response Section -->
          <div v-if="aiResponse || waitingForFirstChunk" class="mt-8">
            <div class="flex justify-between items-center mb-2">
              <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
                </svg>
                <span class="label-text font-bold text-lg">Response:</span>
              </div>
              <div v-if="isStreaming" class="flex items-center badge badge-primary badge-outline p-3">
                <span class="text-sm mr-2">Streaming</span>
                <span class="relative flex h-3 w-3">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </span>
              </div>
            </div>
            
            <div 
              class="p-6 bg-base-100 rounded-lg whitespace-pre-wrap border shadow-sm min-h-[200px] relative transition-all text-lg"
              :class="{ 'border-primary border-2': chunkReceived, 'border-gray-200': !chunkReceived }"
            >
              <div v-if="waitingForFirstChunk" class="absolute inset-0 flex items-center justify-center">
                <div class="loading loading-dots loading-lg text-primary"></div>
              </div>
              <div v-else class="prose max-w-none text-base-content">{{ aiResponse }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="mt-4 text-center text-sm text-gray-500">
        Powered by AI • Stream responses in real-time
      </div>
    </div>
  </template>