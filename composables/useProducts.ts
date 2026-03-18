import type { Product, ProductListItem } from '~/types/api'

export function useProducts() {
  const { apiFetch } = useApi()

  // Returns a plain array — not wrapped in a {count, products} object
  async function fetchProducts(): Promise<ProductListItem[]> {
    return apiFetch<ProductListItem[]>('/products')
  }

  async function fetchProduct(id: number | string): Promise<Product> {
    return apiFetch<Product>(`/products/${id}`)
  }

  return { fetchProducts, fetchProduct }
}
