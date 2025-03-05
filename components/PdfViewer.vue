<script setup>
import { ref, watch } from 'vue'
import PdfEmbed from 'vue-pdf-embed'

const pdfRef = ref(null)
const isLoading = ref(false)
const currentPage = ref(1)
const totalPages = ref(0)
const scale = ref(1.5)
const pdfSrc = ref(null)
const pdfLoaded = ref(false)
const pageCount = ref(0)

const props = defineProps({
  file: {
    type: Object,
    default: null
  }
})

// Watch for file changes
watch(() => props.file, async (newFile) => {
  if (newFile) {
    await loadPdf(newFile)
  }
}, { immediate: true })

// Load PDF file
async function loadPdf(file) {
  if (!file) return
  
  isLoading.value = true
  pdfLoaded.value = false
  
  try {
    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    
    // Create a Blob from the ArrayBuffer
    const blob = new Blob([arrayBuffer], { type: 'application/pdf' })
    
    // Create a URL for the Blob
    const url = URL.createObjectURL(blob)
    
    // Set the PDF source
    pdfSrc.value = url
    pdfLoaded.value = true
  } catch (error) {
    console.error('Error loading PDF:', error)
  } finally {
    isLoading.value = false
  }
}

// Handle PDF loading
function onPdfLoaded() {
  isLoading.value = false
}

// Handle page count
function onPagesLoaded(numPages) {
  pageCount.value = numPages
  totalPages.value = numPages
}

// Navigation functions
function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    // Force re-render of the PDF with the new page
    if (pdfRef.value && pdfRef.value.renderPage) {
      pdfRef.value.renderPage(currentPage.value)
    }
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
    // Force re-render of the PDF with the new page
    if (pdfRef.value && pdfRef.value.renderPage) {
      pdfRef.value.renderPage(currentPage.value)
    }
  }
}

function zoomIn() {
  scale.value += 0.2
  // Force re-render with new scale
  if (pdfRef.value && pdfRef.value.renderPage) {
    pdfRef.value.renderPage(currentPage.value)
  }
}

function zoomOut() {
  if (scale.value > 0.5) {
    scale.value -= 0.2
    // Force re-render with new scale
    if (pdfRef.value && pdfRef.value.renderPage) {
      pdfRef.value.renderPage(currentPage.value)
    }
  }
}
</script>

<template>
  <ClientOnly>
    <div class="pdf-viewer h-full flex flex-col">
      <!-- PDF Toolbar -->
      <div class="pdf-toolbar bg-base-200 p-2 flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <button @click="prevPage" class="btn btn-sm btn-circle" :disabled="currentPage <= 1 || isLoading">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span class="text-sm">{{ currentPage }} / {{ totalPages }}</span>
          <button @click="nextPage" class="btn btn-sm btn-circle" :disabled="currentPage >= totalPages || isLoading">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        <div class="flex items-center space-x-2">
          <button @click="zoomOut" class="btn btn-sm btn-circle" :disabled="scale <= 0.5 || isLoading">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
            </svg>
          </button>
          <span class="text-sm">{{ Math.round(scale * 100) }}%</span>
          <button @click="zoomIn" class="btn btn-sm btn-circle" :disabled="isLoading">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
      
      <!-- PDF Viewer -->
      <div class="pdf-container flex-1 overflow-auto bg-base-300 flex items-center justify-center">
        <div v-if="isLoading" class="loading loading-spinner loading-lg text-primary"></div>
        <div v-else-if="!pdfLoaded" class="text-center p-4">
          <p class="text-lg text-gray-500">No PDF file selected</p>
          <p class="text-sm text-gray-400">Upload a PDF to view it here</p>
        </div>
        <div v-else class="pdf-content">
          <PdfEmbed
            ref="pdfRef"
            v-if="pdfSrc"
            :source="pdfSrc"
            :initial-page="currentPage"
            :scale="scale" 
            @pages-loaded="onPagesLoaded"
            @loaded="onPdfLoaded"
            class="shadow-lg"
          />
        </div>
      </div>
    </div>
    
    <template #fallback>
      <div class="h-full flex items-center justify-center bg-base-300">
        <div class="text-center p-4">
          <div class="loading loading-spinner loading-lg text-primary mb-4"></div>
          <p class="text-lg text-gray-500">Loading PDF viewer...</p>
        </div>
      </div>
    </template>
  </ClientOnly>
</template>

<style scoped>
.pdf-container {
  min-height: 0;
}

.pdf-content {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  overflow: auto;
  padding: 1rem;
}

/* Make the PDF fill the available height */
.pdf-content :deep(canvas) {
  max-height: calc(100vh - 150px);
  width: auto !important;
  height: auto !important;
  object-fit: contain;
}
</style> 