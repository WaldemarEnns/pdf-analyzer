<script setup lang="ts">
const user = useSupabaseUser()

const handleLogout = async () => {
  await useSupabaseClient().auth.signOut()
  navigateTo('/login')
}
</script>

<template>
    <TheNavigation
      @logout="handleLogout"
    />
    <slot />
</template>