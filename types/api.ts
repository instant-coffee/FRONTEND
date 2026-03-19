// ─── Shared ───────────────────────────────────────────────────────────────────

export interface PriceDto {
  amount:    number
  currency:  'CAD' | 'USD'
  formatted: string   // e.g. "$3,069 CAD"
}

// ─── Product list (GET /products) ─────────────────────────────────────────────
// Returns a plain array — no wrapper object.

export interface ProductListItem {
  id:         number
  name:       string
  brand:      string
  currency:   'CAD' | 'USD'
  familyTag?: string   // set when product belongs to a family (e.g. "family:sr38-hope-pro5")
}

// ─── Product detail (GET /products/:id) ───────────────────────────────────────

export interface ProductVariant {
  id:         number
  sku:        string
  position:   string              // "Complete Wheelset" | "Front Wheel" | "Rear Wheel"
  rimSize:    string              // '29"' | '27.5"'
  attributes: Record<string, string>
  price:      PriceDto
  available:  boolean
}

export interface AttributeValueDto {
  id:          number     // PTAV ID — needed for cart noVariantValueIds
  label:       string
  priceExtra?: PriceDto   // surcharge added on top of the variant price; only present when > 0
}

export interface WheelOption {
  type:       string               // "freehub" | "brakeInterface"
  label:      string               // Display label e.g. "Freehub Type"
  required:   boolean
  visibleFor: string[]             // position values where this option shows
  values:     AttributeValueDto[]  // selectable values with PTAV IDs
}

export interface AddOn {
  id:         number   // product.product ID
  templateId: number
  name:       string
  sku:        string
  price:      PriceDto
  category:   string   // "Upgrade" | "Accessory" | "Consumable"
}

export interface Product {
  id:          number
  name:        string
  brand:       string
  description: string
  currency:    'CAD' | 'USD'
  variants:    ProductVariant[]
  options:     WheelOption[]
  addOns:      AddOn[]          // capital O — matches API response
}

// ─── Cart (POST /cart) ────────────────────────────────────────────────────────

export interface CartLinePayload {
  variantId:          number
  quantity:           number
  noVariantValueIds?: number[]   // PTAV IDs for freehub, brake, etc.
}

export interface CartPayload {
  lines:   CartLinePayload[]
  siteId?: string
}

export interface CartResponseLine {
  id:            number
  variantId:     number
  productName:   string
  quantity:      number
  priceUnit:     number
  priceSubtotal: number
}

export interface CartResponse {
  orderId:   number
  orderName: string
  lines:     CartResponseLine[]
}
