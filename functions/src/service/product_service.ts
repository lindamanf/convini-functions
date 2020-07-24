import { Product } from "../interface";
import { SlackLogger } from "../slack-logger";
import { db } from "..";

class ProductServiceClass {
  public async fetch(id: string): Promise<Product | null> {
    return (await (await db.collection<Product>({path: 'products'})).fetch(id)) ?? null;
  }

  public async set(product: Product): Promise<boolean> {
    try {
      await (await db.collection<Product>({ path: 'products' })).set(product);
    } catch(err) {
      SlackLogger.send(err);
      return false;
    }
    return true;
  }

  public async setTransaction(products: Product[]): Promise<boolean> {
    try{
      await db.runTransaction(async (_tx) => {
        await Promise.all(products.map(async p => {
          await db.collection<Product>({ path: 'products' }).set(p);
        }));
      });
      SlackLogger.send(`[SEVEN] Execute transaction.\n${JSON.stringify(products)}`);
    } catch(err) {
      SlackLogger.send(err);
      return false;
    }
    return true;
  }
}

export const ProductService = new ProductServiceClass();