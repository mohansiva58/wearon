export interface SearchableProduct {
  id: number
  name: string
  price: number
  category: string
  colors: string[]
}

export function searchProducts(products: SearchableProduct[], query: string): SearchableProduct[] {
  if (!query.trim()) return products

  const lowerQuery = query.toLowerCase()
  return products.filter((product) => {
    const nameMatch = product.name.toLowerCase().includes(lowerQuery)
    const categoryMatch = product.category.toLowerCase().includes(lowerQuery)
    const colorMatch = product.colors.some((color) => color.toLowerCase().includes(lowerQuery))

    return nameMatch || categoryMatch || colorMatch
  })
}
