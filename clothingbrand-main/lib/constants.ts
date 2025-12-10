// Shared constants

export const CATEGORIES = [
  { name: "Shirt", slug: "shirts" },
  { name: "Trouser", slug: "trouser" },
  { name: "Jeans", slug: "jeans" },
  { name: "Sweatshirt", slug: "sweatshirt" },
  { name: "Polo", slug: "polo" },
  { name: "Jacket", slug: "jackets" },
  { name: "T-Shirt", slug: "tshirts" },
  { name: "Sale", slug: "shop?category=All&sort=discount" },
] as const

export const ROUTES = {
  home: "/",
  shop: "/shop",
  cart: "/cart",
  wishlist: "/wishlist",
  checkout: "/checkout",
  profile: "/profile",
  myOrders: "/my-orders",
  collections: (slug: string) => `/collections/${slug}`,
  product: (id: string | number) => `/product/${id}`,
} as const
