<template>
  <div class="space-y-4">
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
    </div>
    <div v-else-if="newsList.length === 0" class="text-center py-12">
      <div class="text-gray-400 mb-2">
        <Newspaper class="w-16 h-16 mx-auto" />
      </div>
      <p class="text-gray-500">暂无资讯内容</p>
    </div>
    <div
      v-for="item in newsList"
      :key="item.id || item.newsId"
      class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
    >
      <div class="flex flex-col md:flex-row">
        <div class="md:w-48 h-40 md:h-auto relative overflow-hidden flex-shrink-0">
          <img
            :src="item.imageUrl || item.picUrl || 'https://via.placeholder.com/300x200'"
            :alt="item.title"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div class="absolute top-2 left-2">
            <span class="bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
              {{ item.categoryName || item.channelName || '资讯' }}
            </span>
          </div>
        </div>
        <div class="flex-1 p-4 flex flex-col justify-between">
          <div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
              {{ item.title }}
            </h3>
            <p class="text-gray-500 text-sm line-clamp-2 mb-3">
              {{ item.summary || item.description || item.content || '暂无摘要' }}
            </p>
          </div>
          <div class="flex items-center justify-between text-gray-400 text-xs">
            <span class="flex items-center">
              <Clock class="w-4 h-4 mr-1" />
              {{ formatTime(item.publishTime || item.createTime) }}
            </span>
            <span class="flex items-center">
              <Eye class="w-4 h-4 mr-1" />
              {{ item.viewCount || '阅读量未知' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Newspaper, Clock, Eye } from 'lucide-vue-next'

defineProps({
  newsList: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const formatTime = (time) => {
  if (!time) return '未知时间'
  const date = new Date(time)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
