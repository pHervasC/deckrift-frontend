import { HttpHeaders } from "@angular/common/http";

export const environment = {
  production: false,
};

export const serverURL: string = 'http://localhost:8085';

export const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json; charset=utf-8',
  }),
};
