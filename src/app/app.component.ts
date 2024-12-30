import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SharedMenuUnroutedComponent } from './component/shared/shared.menu.unrouted/shared.menu.unrouted.component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, SharedMenuUnroutedComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',

})
export class AppComponent {
  title = 'deckrift-frontend';
}
