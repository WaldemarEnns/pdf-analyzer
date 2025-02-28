<script setup>
  // Reactive state
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const loginEmail = ref('')
  const loginPassword = ref('')
  const signupEmail = ref('')
  const signupPassword = ref('')
  const loading = ref(false)
  const error = ref(null)
  
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
      const { error: signupError } = await supabase.auth.signUp({
        email: signupEmail.value,
        password: signupPassword.value,
      })
      if (signupError) throw signupError
      signupEmail.value = ''
      signupPassword.value = ''
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
      <div v-if="user" class="card w-96 bg-base-100 shadow-xl">
        <div class="card-body">
          <h1 class="card-title text-2xl">Welcome, {{ user.email }}!</h1>
          <button class="btn btn-primary" @click="signOut">Log Out</button>
        </div>
      </div>
      <div v-else class="card w-96 bg-base-100 shadow-xl">
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
  
          <!-- Error Display -->
          <div v-if="error" class="alert alert-error mt-4">
            <span>{{ error }}</span>
          </div>
        </div>
      </div>
    </div>
  </template>