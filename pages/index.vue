<script setup>
    // AI text generation
    const prompt = ref('')
    const aiResponse = ref('')
    const isGenerating = ref(false)
    const isStreaming = ref(false)
    const waitingForFirstChunk = ref(false)
    const chunkReceived = ref(false)
    const selectedFile = ref(null)
    const userPrompt = ref('')

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
      
      // Store the user prompt for display in the chat
      userPrompt.value = prompt.value
      
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
    
    // Handle prompt updates from the ChatWindow component
    const updatePrompt = (newPrompt) => {
      prompt.value = newPrompt
    }
</script>

<template>
    <div class="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-gray-100">
      <!-- Main Content Area with Split Layout -->
      <div class="flex-1 flex flex-col md:flex-row overflow-hidden">
        <!-- Left Side: PDF Viewer -->
        <div class="w-full md:w-1/2 h-screen md:h-auto border-r border-gray-200 bg-base-100">
          <div class="h-full flex flex-col">
            <!-- PDF Upload Section -->
            <div class="p-4 bg-base-200 border-b border-base-300">
              <h2 class="text-xl font-bold mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                PDF Viewer
              </h2>
              
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
            
            <!-- PDF Viewer Component -->
            <div class="flex-1 overflow-hidden">
              <PdfViewer :file="selectedFile" />
            </div>
          </div>
        </div>
        
        <!-- Right Side: Chat Window -->
        <div class="w-full md:w-1/2 h-screen md:h-auto">
          <ChatWindow 
            :aiResponse="aiResponse"
            :isGenerating="isGenerating"
            :isStreaming="isStreaming"
            :waitingForFirstChunk="waitingForFirstChunk"
            :chunkReceived="chunkReceived"
            :userPrompt="userPrompt"
            @generate="generateAIResponse"
            @update:prompt="updatePrompt"
          />
        </div>
      </div>
      
      <div class="text-center text-sm text-gray-500 p-2 bg-base-200 border-t border-base-300">
        Powered by AI • Upload PDFs and chat about their content
      </div>
    </div>
  </template>