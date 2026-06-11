<template>
  <div class="min-h-screen bg-gray-50">
    <Header @search="handleSearch" />
    <div class="bg-white border-b">
      <div class="max-w-6xl mx-auto px-4 py-3">
        <div class="flex items-center overflow-x-auto space-x-6">
          <button
            v-for="cat in categories"
            :key="cat.id"
            :class="[
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
              activeCategory === cat.id
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            ]"
            @click="activeCategory = cat.id"
          >
            {{ cat.name }}
          </button>
        </div>
      </div>
    </div>
    <main class="max-w-6xl mx-auto px-4 py-8">
      <div class="flex gap-8">
        <div class="flex-1">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-gray-800">最新资讯</h2>
            <span class="text-sm text-gray-400">共 {{ filteredNewsList.length }} 条</span>
          </div>
          <NewsList :newsList="filteredNewsList" :loading="loading" />
        </div>
        <aside class="w-72 flex-shrink-0 hidden lg:block">
          <div class="bg-white rounded-xl shadow-md p-4 mb-4">
            <h3 class="font-semibold text-gray-800 mb-4 pb-2 border-b">热门资讯</h3>
            <div class="space-y-3">
              <div
                v-for="(item, index) in hotNews"
                :key="item.id"
                class="flex items-start cursor-pointer group"
              >
                <span
                  :class="[
                    'w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold mr-3 flex-shrink-0',
                    index < 3 ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'
                  ]"
                >
                  {{ index + 1 }}
                </span>
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-gray-700 truncate group-hover:text-primary-600 transition-colors">
                    {{ item.title }}
                  </p>
                  <p class="text-xs text-gray-400 mt-1">{{ item.viewCount }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-xl shadow-md p-4">
            <h3 class="font-semibold text-gray-800 mb-4 pb-2 border-b">推荐阅读</h3>
            <div class="space-y-4">
              <div
                v-for="item in recommendNews"
                :key="item.id"
                class="flex cursor-pointer group"
              >
                <img
                  :src="item.imageUrl || item.picUrl || 'https://via.placeholder.com/100x80'"
                  :alt="item.title"
                  class="w-24 h-16 object-cover rounded-lg flex-shrink-0 group-hover:opacity-80 transition-opacity"
                />
                <div class="ml-3 flex-1 min-w-0">
                  <p class="text-sm text-gray-700 line-clamp-2 group-hover:text-primary-600 transition-colors">
                    {{ item.title }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
    <footer class="bg-gray-800 text-gray-400 py-8 mt-8">
      <div class="max-w-6xl mx-auto px-4">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <div class="mb-4 md:mb-0">
            <span class="text-white font-bold text-lg">资讯头条</span>
            <p class="text-sm mt-1">提供最新、最全的资讯信息</p>
          </div>
          <div class="flex space-x-6 text-sm">
            <a href="#" class="hover:text-white transition-colors">关于我们</a>
            <a href="#" class="hover:text-white transition-colors">联系我们</a>
            <a href="#" class="hover:text-white transition-colors">隐私政策</a>
            <a href="#" class="hover:text-white transition-colors">使用条款</a>
          </div>
        </div>
        <div class="text-center mt-6 pt-4 border-t border-gray-700 text-sm">
          <p>© 2024 资讯头条. 保留所有权利.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Header from './components/Header.vue'
import NewsList from './components/NewsList.vue'
import { fetchNewsData } from './utils/api'

const newsList = ref([])
const searchKeyword = ref('')
const loading = ref(true)
const activeCategory = ref('all')

const categories = ref([
  { id: 'all', name: '全部' },
  { id: 'finance', name: '财经' },
  { id: 'tech', name: '科技' },
  { id: 'sports', name: '体育' },
  { id: 'entertainment', name: '娱乐' },
  { id: 'health', name: '健康' },
  { id: 'education', name: '教育' }
])

const filteredNewsList = computed(() => {
  let result = newsList.value
  if (searchKeyword.value) {
    result = result.filter(item =>
      item.title?.includes(searchKeyword.value) ||
      item.description?.includes(searchKeyword.value) ||
      item.summary?.includes(searchKeyword.value)
    )
  }
  return result
})

const hotNews = computed(() => {
  return [...newsList.value].sort((a, b) => 
    (parseInt(b.viewCount?.replace(/[^0-9]/g, '')) || 0) - 
    (parseInt(a.viewCount?.replace(/[^0-9]/g, '')) || 0)
  ).slice(0, 5)
})

const recommendNews = computed(() => {
  return newsList.value.slice(0, 3)
})

const handleSearch = (keyword) => {
  searchKeyword.value = keyword
}

onMounted(async () => {
  try {
    loading.value = true
    const data = await fetchNewsData()
    newsList.value = data
  } catch (error) {
    console.error('Failed to fetch news:', error)
  } finally {
    loading.value = false
  }
})
</script>
