<script setup>
  const supabase = useSupabaseClient()
  const loginEmail = ref('')
  const loginPassword = ref('')
  const signupEmail = ref('')
  const signupPassword = ref('')
  const loading = ref(false)
  const error = ref(null)
  const isNewUser = ref(false)
  
  // Login handler
  const handleLogin = async () => {
    loading.value = true
    error.value = null
    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: loginEmail.value,
        password: loginPassword.value,
      })
      if (loginError) throw loginError
      loginEmail.value = ''
      loginPassword.value = ''
      navigateTo('/')
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }
  
  // Signup handler
  const handleSignUp = async () => {
    loading.value = true
    error.value = null
    try {
      const { error: signupError, data } = await supabase.auth.signUp({
        email: signupEmail.value,
        password: signupPassword.value,
      })
      if (signupError) throw signupError
      
      // Check if user was created successfully
      if (data?.user) {
        isNewUser.value = true
        signupEmail.value = ''
        signupPassword.value = ''
        // Redirect to profile page for setup
        navigateTo('/profile')
      }
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }
  
  // Logout handler
  const signOut = async () => {
    loading.value = true
    error.value = null
    try {
      const { error: logoutError } = await supabase.auth.signOut()
      if (logoutError) throw logoutError
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }
</script>

<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="card w-96 bg-base-100 shadow-xl">
        <div class="card-body">
          <!-- Login Form -->
          <h2 class="card-title text-2xl">Log In</h2>
          <form @submit.prevent="handleLogin">
            <div class="form-control">
              <label class="label">
                <span class="label-text">Email</span>
              </label>
              <input
                v-model="loginEmail"
                type="email"
                placeholder="Email"
                class="input input-bordered"
                required
              />
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text">Password</span>
              </label>
              <input
                v-model="loginPassword"
                type="password"
                placeholder="Password"
                class="input input-bordered"
                required
              />
            </div>
            <div class="form-control mt-6">
              <button type="submit" class="btn btn-primary" :disabled="loading">
                {{ loading ? 'Logging In...' : 'Log In' }}
              </button>
            </div>
          </form>
  
          <div class="divider">OR</div>
  
          <!-- Signup Form -->
          <h2 class="card-title text-2xl">Sign Up</h2>
          <form @submit.prevent="handleSignUp">
            <div class="form-control">
              <label class="label">
                <span class="label-text">Email</span>
              </label>
              <input
                v-model="signupEmail"
                type="email"
                placeholder="Email"
                class="input input-bordered"
                required
              />
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text">Password</span>
              </label>
              <input
                v-model="signupPassword"
                type="password"
                placeholder="Password"
                class="input input-bordered"
                required
              />
            </div>
            <div class="form-control mt-6">
              <button type="submit" class="btn btn-secondary" :disabled="loading">
                {{ loading ? 'Signing Up...' : 'Sign Up' }}
              </button>
            </div>
          </form>
  
          <!-- Success Message for New User -->
          <div v-if="isNewUser" class="alert alert-success mt-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>Account created successfully! Redirecting to profile setup...</span>
          </div>
  
          <!-- Error Display -->
          <div v-if="error" class="alert alert-error mt-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{{ error }}</span>
          </div>
        </div>
      </div>
    </div>
  </template>