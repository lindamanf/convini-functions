export interface Product {
  id: string,
  name: string,
  brand: 'seven' | 'lawson' | 'famima',
  url: string | null,
  price: number | null,
  regions: string[],
  releasedAt: Date | null,
  image: 'string' | null,
}
