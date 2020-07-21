import { Product } from "../interface";
import { FirestoreSimple } from '@firestore-simple/admin'
import { SlackLogger } from "../slack-logger";

class ProductServiceClass {
  public async create(firestore: FirebaseFirestore.Firestore, product: Product): Promise<boolean> {
    if(!product.id) {
        console.log(`Product is invalid: ${JSON.stringify(product)}`);
        return false;
    }
    const store = new FirestoreSimple(firestore)
    const doc = store.collection<Product>({ path: 'products' });
    try {
      const id = await doc.set({
        id: product.id,
        name: product.name,
        price: product.price ?? -1,
        releasedAt: new Date(product.releasedAt),
        regions: product.regions ?? [],
        url: product.url ?? ''
      });
      SlackLogger.send(`[SEVEN] *${product.name}* is created. id=${id}`);
    } catch(err) {
      SlackLogger.send(err);
      return false;
    }
    return true;
  }

  public async createTransaction(firestore: FirebaseFirestore.Firestore, products: Product[]): Promise<boolean> {
    if(products.length === 0) return false;
    const store = new FirestoreSimple(firestore)
    const doc = store.collection<Product>({ path: 'products' });

    try{
      await store.runTransaction(async (_tx) => {
        await Promise.all(products.map(async p => {
          if(!p.id) return;
          await doc.set({          
            id: p.id,
            name: p.name,
            price: p.price ?? -1,
            releasedAt: new Date(p.releasedAt),
            regions: p.regions ?? [],
            url: p.url ?? ''
          });
        }));
      });
      SlackLogger.send(`[SEVEN] Execute transaction.\n${JSON.stringify(products)}`);
    } catch(err) {
      SlackLogger.send(err);
    }
      return true;
  }
}

export const ProductService = new ProductServiceClass();