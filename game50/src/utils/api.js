const BASE_URL = 'https://news-api.szwyi.com/api/compatible'
const CATEGORY_URL = 'https://news-api.szwyi.com/api/compatible/finance_info/db.json?num=40&thirdCategoryIds=2234,2235,2236,2237,2238,2239,2240'

export async function fetchNewsData() {
  try {
    const response = await fetch(CATEGORY_URL)
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const data = await response.json()
    return data.data || data
  } catch (error) {
    console.error('Error fetching news data:', error)
    return []
  }
}

export async function fetchCategories() {
  try {
    const response = await fetch(`${BASE_URL}/categories`)
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}
