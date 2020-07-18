import * as functions from 'firebase-functions';
import * as firebase from 'firebase-admin';
import * as punycode from 'punycode';
import { FirestoreSimple } from '@firestore-simple/admin'
import { Product } from './interface';
import { SlackLogger } from './slack-logger';

firebase.initializeApp();
const firestore = firebase.firestore();

export const product = functions.region('asia-northeast1').https.onRequest(async (req, res) => {
    if(req.method !== 'POST') {
        res.status(405).send('Method Not Allowed.');
        return;
    }
    const p: Product = req.body;
    if(!p.name) {
        console.log(`Product is invalid: ${p}`);
        return;
    }

    const store = new FirestoreSimple(firestore);
    const products = store.collection<Product>({ path: 'products' });
    try {
      const id = await products.set({
        id: punycode.encode(p.name),
        name: p.name,
        price: p.price || -1,
        releasedAt: new Date(p.releasedAt),
        regions: p.regions || [],
        url: p.url || ''
      });
      SlackLogger.send(`*${p.name}* is created. id=${id}`);
    } catch(err) {
      SlackLogger.send(err);
    }
    return res.send(200);
});
