import * as functions from 'firebase-functions';
import * as firebase from 'firebase-admin';
import { Product } from './interface';
import { Seven } from './crowler/seven';
import { ProductService } from './service/product_service';
import { SEVEN_REGIONS } from './const';
import { FirestoreSimple } from '@firestore-simple/admin';

firebase.initializeApp();
const store = firebase.firestore();
export const db = new FirestoreSimple(store)

export const product = functions
  .region('asia-northeast1')
  .https.onRequest(async (req, res) => {
    switch(req.method) {
      case 'POST':
        return ProductService.set(req.body as Product)? res.send(201) : res.send(400);
      default:
        return res.status(405).send('Method not allowed.');
    }
  });

export const products = functions
  .region('asia-northeast1')
  .https.onRequest(async (req, res) => {
    switch(req.method) {
      case 'POST':
        return ProductService.setTransaction(req.body as Product[])? res.send(201) : res.send(400);
      default:
        return res.status(405).send('Method not allowed.');
    }
  });

export const crowlSevenInNorthArea = functions
  .runWith({ timeoutSeconds: 540, memory: '1GB' })
  .region('asia-northeast1')
  .pubsub.schedule('0 10 * * mon')
  .timeZone('Asia/Tokyo')
  .onRun(async context => {
    await Seven.fetchProducts(SEVEN_REGIONS.hokkaido);
    await Seven.fetchProducts(SEVEN_REGIONS.tohoku);
  });

export const crowlSevenInSeaOfJP = functions
  .runWith({ timeoutSeconds: 540, memory: '1GB' })
  .region('asia-northeast1')
  .pubsub.schedule('0 10 * * tue')
  .timeZone('Asia/Tokyo')
  .onRun(async context => {
    await Seven.fetchProducts(SEVEN_REGIONS.hokuriku);
    await Seven.fetchProducts(SEVEN_REGIONS.koshinetsu);
});

export const crowlSevenInKanto = functions
  .runWith({ timeoutSeconds: 540, memory: '1GB' })
  .region('asia-northeast1')
  .pubsub.schedule('0 10 * * wed')
  .timeZone('Asia/Tokyo')
  .onRun(async context => await Seven.fetchProducts(SEVEN_REGIONS.kanto));

export const crowlSevenInTokai = functions
  .runWith({ timeoutSeconds: 540, memory: '1GB' })
  .region('asia-northeast1')
  .pubsub.schedule('0 10 * * thu')
  .timeZone('Asia/Tokyo')
  .onRun(async context => await Seven.fetchProducts(SEVEN_REGIONS.tokai));

export const crowlSevenInKinki = functions
  .runWith({ timeoutSeconds: 540, memory: '1GB' })
  .region('asia-northeast1')
  .pubsub.schedule('0 10 * * fri')
  .timeZone('Asia/Tokyo')
  .onRun(async context => await Seven.fetchProducts(SEVEN_REGIONS.kinki));

export const crowlSevenInSetouchi = functions
  .runWith({ timeoutSeconds: 540, memory: '1GB' })
  .region('asia-northeast1')
  .pubsub.schedule('0 10 * * sat')
  .timeZone('Asia/Tokyo')
  .onRun(async context => {
    await Seven.fetchProducts(SEVEN_REGIONS.chugoku);
    await Seven.fetchProducts(SEVEN_REGIONS.shikoku);
  });

export const crowlSevenInKyushu = functions
  .runWith({ timeoutSeconds: 540, memory: '1GB' })
  .region('asia-northeast1')
  .pubsub.schedule('0 10 * * sun')
  .timeZone('Asia/Tokyo')
  .onRun(async context => {
    await Seven.fetchProducts(SEVEN_REGIONS.kyushu);
    await Seven.fetchProducts(SEVEN_REGIONS.okinawa);
  });
