import { HttpHeaders } from "@angular/common/http";

export const environment = {
  production: false,
  StripePublickey: 'pk_test_51QtYPzRVeVmpDkxqd9DfRfNblKCUzcpu1L7K5qvvaBj1L4bdbs3tSftWAyPGbIwhtF29PRTkxhe5CvxoVuVA0Jfe00UKmYi2B8'
};

export const serverURL: string = 'https://deckrift-backend.onrender.com';

export const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json; charset=utf-8',
  }),
};
