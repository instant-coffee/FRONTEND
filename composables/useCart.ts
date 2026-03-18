import type { CartPayload, CartResponse } from '~/types/api'

export function useCart() {
  const { apiFetch } = useApi()
  const siteContext = useState<string>('siteContext')

  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastOrder = ref<CartResponse | null>(null)

  async function addToCart(payload: CartPayload): Promise<CartResponse | null> {
    loading.value = true
    error.value = null
    try {
      const result = await apiFetch<CartResponse>('/cart', {
        method: 'POST',
        body: {
          ...payload,
          siteId: siteContext.value,
        },
      })
      lastOrder.value = result
      return result
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to add to cart'
      error.value = msg
      return null
    } finally {
      loading.value = false
    }
  }

  return { addToCart, loading, error, lastOrder }
}
