import * as functions from 'firebase-functions';
import * as firebase from 'firebase-admin';
import { Product } from './interface';
import { Seven } from './seven';
import { ProductApi } from './api/product_api';
import { ProductService } from './service/product_service';

firebase.initializeApp();
const firestore = firebase.firestore();

export const product = functions
  .region('asia-northeast1')
  .https.onRequest(async (req, res) => {
    switch(req.method) {
      case 'POST':
        return ProductService.create(firestore, req.body as Product)? res.send(201) : res.send(400);
      default:
        return res.status(405).send('Method not allowed.');
    }
  });

export const products = functions
  .region('asia-northeast1')
  .https.onRequest(async (req, res) => {
    switch(req.method) {
      case 'POST':
        return ProductService.createTransaction(firestore, req.body as Product[])? res.send(201) : res.send(400);
      default:
        return res.status(405).send('Method not allowed.');
    }
  });

export const crowlSeven = functions
    .region('asia-northeast1')
    .pubsub.schedule('0 10 * * 2')
    .timeZone('Asia/Tokyo')
    .onRun(async context => {
      const products = await Seven.fetchProducts();
      products.map(p => ProductApi.create(p));
      return;
    });

// // test: crowlSeven
// export const crowlSevenTest = functions
//   .region('asia-northeast1')
//   .https.onRequest(async (req, res) => {
//       const products = await Seven.fetchProducts();
//       products.map(p => ProductApi.create(p));
//       return res.send(200);
//   });