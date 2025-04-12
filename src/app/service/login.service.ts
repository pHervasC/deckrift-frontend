import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { httpOptions, serverURL } from '../environment/environment';

@Injectable({
  providedIn: 'root'
})

export class LoginService {

  serverURL: string = serverURL + '/api/auth';

  constructor(private oHttp: HttpClient) { }

  login(email: string, password: string): Observable<string> {
    const loginData = { correo: email, password: password };
    return this.oHttp.post<string>('https://deckrift-backend.onrender.com/api/auth/login', loginData, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

}
