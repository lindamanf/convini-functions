import { Product } from '../interface';
import { URI_CF_TOKYO } from '../const';
import { BaseApi } from './base_api';

class ProductApiClass extends BaseApi {
  public create(product: Product) {
    this.post(`${URI_CF_TOKYO}/product`, {
      ...product,
    });
  }
  public createTrunsaction(products: Product[]) {
    this.post(`${URI_CF_TOKYO}/products`, {
      ...products,
    });
  }
}

export const ProductApi = new ProductApiClass();