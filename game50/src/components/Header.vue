<template>
  <header class="bg-white shadow-sm sticky top-0 z-50">
    <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
      <div class="flex items-center">
        <h1 class="text-2xl font-bold text-primary-600 cursor-pointer hover:text-primary-700 transition-colors">
          资讯头条
        </h1>
        <span class="ml-2 text-sm text-gray-400">News Headlines</span>
      </div>
      <div class="relative w-64">
        <input
          v-model="keyword"
          type="text"
          placeholder="搜索资讯..."
          class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          @keyup.enter="handleSearch"
        />
        <button
          class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary-500 transition-colors"
          @click="handleSearch"
        >
          <Search class="w-5 h-5" />
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { Search } from 'lucide-vue-next'

const emit = defineEmits(['search'])

const keyword = ref('')

const handleSearch = () => {
  emit('search', keyword.value.trim())
}
</script>
