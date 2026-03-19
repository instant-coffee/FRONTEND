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

  /**
   * Fetch a product family by tag — assembles FW + RW + Wheelset into a single
   * WheelConfigurator-compatible response. The tag must match exactly what is
   * set in Odoo (e.g. "family:sr38-hope-pro5").
   */
  async function fetchProductFamily(tag: string): Promise<Product> {
    return apiFetch<Product>(`/products/family/${encodeURIComponent(tag)}`)
  }

  return { fetchProducts, fetchProduct, fetchProductFamily }
}
