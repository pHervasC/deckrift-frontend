import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shared-menu-unrouted',
  templateUrl: './shared.menu.unrouted.component.html',
  styleUrls: ['./shared.menu.unrouted.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class SharedMenuUnroutedComponent implements OnInit {

  strRuta: string = '';

  constructor(private oRouter: Router) {
    this.oRouter.events.subscribe((oEvent) => {
      if (oEvent instanceof NavigationEnd) {
        this.strRuta = oEvent.url;
      }
    });
  }

  shouldShowNavbar(): boolean {
    return !this.oRouter.url.includes('/usuario/edit');
  }

  ngOnInit() {}
}
