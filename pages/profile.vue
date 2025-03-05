<script setup lang="ts">
const user = useSupabaseUser()
const router = useRouter()
const { getUserProfile, updateUserProfile, uploadAvatar, deleteAvatar } = useProfile()

// Redirect if not logged in
onMounted(() => {
  if (!user.value) {
    return navigateTo('/login')
  }
})

// Check if this is a new user (no profile data yet)
const isNewUser = computed(() => {
  return !getUserProfile.value.fullName
})

// Form data
const fullName = ref(getUserProfile.value.fullName || '')
const description = ref(getUserProfile.value.description || '')
const avatarUrl = ref(getUserProfile.value.avatarUrl || '')
const loading = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

// File upload
const avatarFile = ref<File | null>(null)
const avatarPreview = ref(avatarUrl.value)

// Handle file selection
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    avatarFile.value = file
    // Create a preview URL
    avatarPreview.value = URL.createObjectURL(file)
  }
}

// Delete avatar
const handleDeleteAvatar = async () => {
  loading.value = true
  error.value = null
  success.value = false
  
  try {
    await deleteAvatar()
    
    // Update local state
    avatarUrl.value = ''
    avatarPreview.value = ''
    avatarFile.value = null
    
    success.value = true
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

// Update profile
const updateProfile = async () => {
  loading.value = true
  error.value = null
  success.value = false
  
  try {
    // Upload avatar if a new one is selected
    let newAvatarUrl = avatarUrl.value
    
    if (avatarFile.value) {
      const { publicUrl } = await uploadAvatar(avatarFile.value)
      newAvatarUrl = publicUrl
    }
    
    // Update user metadata
    await updateUserProfile({
      fullName: fullName.value,
      description: description.value,
      avatarUrl: newAvatarUrl,
    })
    
    success.value = true
    
    // If this was a new user, redirect to home after a short delay
    if (isNewUser.value) {
      setTimeout(() => {
        navigateTo('/')
      }, 2000)
    }
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-gray-100 p-6">
    <div class="card w-full max-w-2xl bg-base-100 shadow-xl border border-gray-200">
      <div class="card-body p-6">
        <!-- Welcome message for new users -->
        <div v-if="isNewUser" class="alert alert-info mb-6 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <div>
            <h3 class="font-bold">Welcome to PDF Analyser!</h3>
            <div class="text-sm">Please complete your profile to continue.</div>
          </div>
        </div>
        
        <h2 class="card-title text-2xl font-bold text-primary mb-4 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Your Profile
        </h2>
        
        <div class="divider"></div>
        
        <form @submit.prevent="updateProfile">
          <!-- Avatar Upload -->
          <div class="form-control mb-6">
            <label class="label">
              <span class="label-text text-lg font-medium">Profile Picture</span>
            </label>
            <div class="flex flex-col sm:flex-row items-center gap-6">
              <div class="avatar">
                <div class="w-28 h-28 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 bg-gray-100 flex items-center justify-center overflow-hidden">
                  <img 
                    :src="avatarPreview || 'https://placehold.co/100'" 
                    alt="Avatar preview"
                    class="object-cover w-full h-full"
                  />
                </div>
              </div>
              <div class="flex flex-col space-y-3 w-full">
                <input
                  type="file"
                  accept="image/*"
                  class="file-input file-input-bordered file-input-primary w-full"
                  @change="handleFileChange"
                  :disabled="loading"
                />
                <button 
                  v-if="avatarUrl || avatarPreview" 
                  type="button" 
                  class="btn btn-outline btn-error btn-sm" 
                  @click="handleDeleteAvatar"
                  :disabled="loading"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Remove Photo
                </button>
              </div>
            </div>
          </div>
          
          <!-- Full Name -->
          <div class="form-control mb-4">
            <label class="label flex flex-col items-start p-0 mb-2">
              <span class="label-text text-lg font-medium mb-1">Full Name</span>
            </label>
            <input
              v-model="fullName"
              type="text"
              placeholder="Your full name"
              class="input input-bordered focus:input-primary focus:outline-none text-lg w-full"
              required
              :disabled="loading"
            />
          </div>
          
          <!-- Description -->
          <div class="form-control mb-6">
            <label class="label flex flex-col items-start p-0 mb-2">
              <span class="label-text text-lg font-medium mb-1">About You</span>
            </label>
            <textarea
              v-model="description"
              class="textarea textarea-bordered h-32 focus:textarea-primary focus:outline-none text-lg w-full"
              placeholder="Tell us a bit about yourself"
              :disabled="loading"
            ></textarea>
          </div>
          
          <!-- Submit Button -->
          <div class="form-control mt-8">
            <button type="submit" class="btn btn-primary btn-lg w-full" :disabled="loading">
              <span v-if="loading" class="loading loading-spinner loading-md mr-2"></span>
              {{ loading ? 'Saving...' : isNewUser ? 'Complete Profile' : 'Save Profile' }}
            </button>
          </div>
        </form>
        
        <!-- Success Message -->
        <div v-if="success" class="alert alert-success mt-6 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>{{ isNewUser ? 'Profile completed successfully! Redirecting...' : 'Profile updated successfully!' }}</span>
        </div>
        
        <!-- Error Display -->
        <div v-if="error" class="alert alert-error mt-6 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>{{ error }}</span>
        </div>
      </div>
    </div>
    
    <div class="mt-4 text-center text-sm text-gray-500">
      PDF Analyser • Manage your profile
    </div>
  </div>
</template> 