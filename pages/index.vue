<script setup>
    const user = useSupabaseUser()
    
    // AI text generation
    const prompt = ref('')
    const aiResponse = ref('')
    const isGenerating = ref(false)
    
    const generateAIResponse = async () => {
      if (!prompt.value.trim()) return
      
      isGenerating.value = true
      aiResponse.value = ''
      
      try {
        // Call our API endpoint instead of directly using the AI SDK
        const { data, error } = await useFetch('/api/generate', {
          method: 'POST',
          body: {
            prompt: prompt.value
          }
        })
        
        if (error.value) {
          throw error.value
        }
        
        aiResponse.value = data.value.result.text
      } catch (error) {
        console.error('Error generating text:', error)
        aiResponse.value = 'Sorry, there was an error generating a response.'
      } finally {
        isGenerating.value = false
      }
    }
</script>

<template>
    <div class="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div class="card w-96 bg-base-100 shadow-xl mb-6">
        <div class="card-body">
          <h1 class="card-title text-2xl">Home Page</h1>
          <p v-if="user">You are logged in as {{ user.email }}</p>
          <p v-else>You are not logged in.</p>
          <NuxtLink to="/login" class="btn btn-primary">Go to Login</NuxtLink>
        </div>
      </div>
      
      <!-- AI Text Generation Card -->
      <div class="card w-96 bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-xl">AI Text Generation</h2>
          <div class="form-control">
            <label class="label">
              <span class="label-text">Enter your prompt</span>
            </label>
            <textarea 
              v-model="prompt" 
              class="textarea textarea-bordered h-24" 
              placeholder="Ask Grok something..."
            ></textarea>
          </div>
          
          <button 
            @click="generateAIResponse" 
            class="btn btn-primary mt-4" 
            :disabled="isGenerating || !prompt.trim()"
          >
            {{ isGenerating ? 'Generating...' : 'Generate' }}
          </button>
          
          <div v-if="aiResponse" class="mt-4">
            <label class="label">
              <span class="label-text font-medium">Response:</span>
            </label>
            <div class="p-4 bg-blue-50 rounded-lg whitespace-pre-wrap text-gray-800 border border-blue-200 shadow-sm">{{ aiResponse }}</div>
          </div>
        </div>
      </div>
    </div>
  </template>