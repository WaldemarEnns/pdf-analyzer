<script setup>
    const user = useSupabaseUser()
</script>

<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="card w-96 bg-base-100 shadow-xl">
        <div class="card-body">
          <h1 class="card-title text-2xl">Home Page</h1>
          <p v-if="user">You are logged in as {{ user.email }}</p>
          <p v-else>You are not logged in.</p>
          <NuxtLink to="/login" class="btn btn-primary">Go to Login</NuxtLink>
        </div>
      </div>
    </div>
  </template>