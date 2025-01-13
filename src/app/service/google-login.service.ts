import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GoogleLoginService {
  constructor() {
    this.loadGoogleScript();
  }

  private loadGoogleScript(): void {
    const existingScript = document.getElementById('google-jssdk');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'google-jssdk';
      script.src = 'https://accounts.google.com/gsi/client';
      document.body.appendChild(script);
    }
  }
}
