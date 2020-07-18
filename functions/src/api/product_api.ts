import { Product } from '../interface';
import { URI_CF_TOKYO } from '../const';
import * as request from 'request';
import { SlackLogger } from '../slack-logger';

class ProductApiClass {
  public create(product: Product) {
    const options = {
      url: `${URI_CF_TOKYO}/product`,
      headers: { 'Content-type': 'application/json' },
      form: product
  }
  request.post(options, (err) => {
      if(err) {
        SlackLogger.send(err);
      }
  }); 
  }
}
export const ProductApi = new ProductApiClass();