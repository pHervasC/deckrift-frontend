import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GoogleLoginService {
  private scriptLoaded = false;

  constructor() {
    this.loadGoogleScript();
  }

  private loadGoogleScript(): void {
    const existingScript = document.getElementById('google-jssdk');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'google-jssdk';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.scriptLoaded = true;
      };
      document.body.appendChild(script);
    } else {
      this.scriptLoaded = true;
    }
  }

  initializeGoogleLogin(
    clientId: string,
    callback: (response: any) => void,
    buttonId: string
  ): void {
    const interval = setInterval(() => {
      if ((window as any).google && (window as any).google.accounts && this.scriptLoaded) {
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

        clearInterval(interval);
      }
    }, 100); // Intenta cada 100ms hasta que cargue
  }
}
