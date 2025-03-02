<script setup lang="ts">
const user = useSupabaseUser()
const router = useRouter()
const { getUserProfile, updateUserProfile, uploadAvatar } = useProfile()

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
  <div class="min-h-screen bg-gray-100 py-12">
    <div class="container mx-auto px-4">
      <div class="card bg-base-100 shadow-xl max-w-2xl mx-auto">
        <div class="card-body">
          <!-- Welcome message for new users -->
          <div v-if="isNewUser" class="alert alert-info mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <div>
              <h3 class="font-bold">Welcome to PDF Analyser!</h3>
              <div class="text-xs">Please complete your profile to continue.</div>
            </div>
          </div>
          
          <h2 class="card-title text-2xl mb-6">Your Profile</h2>
          
          <form @submit.prevent="updateProfile">
            <!-- Avatar Upload -->
            <div class="form-control mb-6">
              <label class="label">
                <span class="label-text">Profile Picture</span>
              </label>
              <div class="flex items-center space-x-4">
                <div class="avatar">
                  <div class="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                    <img :src="avatarPreview || 'https://placehold.co/100'" alt="Avatar preview" />
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  class="file-input file-input-bordered w-full max-w-xs"
                  @change="handleFileChange"
                />
              </div>
            </div>
            
            <!-- Full Name -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">Full Name</span>
              </label>
              <input
                v-model="fullName"
                type="text"
                placeholder="Your full name"
                class="input input-bordered"
                required
              />
            </div>
            
            <!-- Description -->
            <div class="form-control mt-4">
              <label class="label">
                <span class="label-text">About You</span>
              </label>
              <textarea
                v-model="description"
                class="textarea textarea-bordered h-24"
                placeholder="Tell us a bit about yourself"
              ></textarea>
            </div>
            
            <!-- Submit Button -->
            <div class="form-control mt-6">
              <button type="submit" class="btn btn-primary" :disabled="loading">
                {{ loading ? 'Saving...' : isNewUser ? 'Complete Profile' : 'Save Profile' }}
              </button>
            </div>
          </form>
          
          <!-- Success Message -->
          <div v-if="success" class="alert alert-success mt-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{{ isNewUser ? 'Profile completed successfully! Redirecting...' : 'Profile updated successfully!' }}</span>
          </div>
          
          <!-- Error Display -->
          <div v-if="error" class="alert alert-error mt-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{{ error }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 