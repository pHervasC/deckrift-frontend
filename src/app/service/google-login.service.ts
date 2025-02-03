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

  initializeGoogleLogin(
    clientId: string,
    callback: (response: any) => void,
    buttonId: string
  ): void {
    (window as any).google.accounts.id.initialize({
      client_id: clientId,
      callback,
    });

    (window as any).google.accounts.id.renderButton(
      document.getElementById(buttonId),
      {
        theme: 'outline',
        size: 'large',
      }
    );
  }
}
