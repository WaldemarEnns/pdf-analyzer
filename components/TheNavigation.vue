<script setup lang="ts">
const user = useSupabaseUser()

const avatar = computed(() => user.value?.user_metadata.avatar_url)

const emit = defineEmits<{
  logout: [void]
}>()

const logout = () => {
  emit('logout')
}
</script>

<template>
    <div class="navbar bg-base-100 shadow-sm">
  <div class="flex-1">
    <NuxtLink to="/" class="btn btn-ghost text-xl">PDF analyser</NuxtLink>
  </div>
  <div v-if="user" class="flex-none">
    <div class="dropdown dropdown-end">
      <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
        <div class="w-10 rounded-full">
          <img
            v-if="avatar"
            :src="avatar"
            alt="Tailwind CSS Navbar component"
          />
          <img
            v-else
            src="https://placehold.co/100"
            alt="Default avatar placeholder"
          />
        </div>
      </div>
      <ul
        tabindex="0"
        class="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
        <li>
          <a class="justify-between">
            Profile
          </a>
        </li>
        <li><a @click="logout">Logout</a></li>
      </ul>
    </div>
  </div>
  <div v-else>
    <NuxtLink to="/login" class="btn btn-primary">Login</NuxtLink>
  </div>
</div>
</template>