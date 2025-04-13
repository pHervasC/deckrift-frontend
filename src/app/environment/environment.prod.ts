import { HttpHeaders } from "@angular/common/http";

export const environment = {
  production: true,
  StripePublickey: 'pk_test_51QtYPzRVeVmpDkxqd9DfRfNblKCUzcpu1L7K5qvvaBj1L4bdbs3tSftWAyPGbIwhtF29PRTkxhe5CvxoVuVA0Jfe00UKmYi2B8',
  googleClientId: '941844746843-3pucjd42q35mvia1e55i3da0udkv13i6.apps.googleusercontent.com'
};

export const serverURL: string = 'https://deckrift-backend.onrender.com';

export const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json; charset=utf-8',
  }),
};
