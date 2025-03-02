export default defineNuxtRouteMiddleware((to, from) => {
  // Skip middleware if not client-side
  if (process.server) return
  
  const user = useSupabaseUser()
  
  // If user is logged in but hasn't completed profile setup
  if (user.value && 
      to.path !== '/profile' && 
      to.path !== '/login' && 
      !user.value.user_metadata?.full_name) {
    // Redirect to profile page
    return navigateTo('/profile')
  }
}) 