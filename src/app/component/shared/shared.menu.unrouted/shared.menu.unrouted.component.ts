import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SessionService } from '../../../service/session.service';

@Component({
  selector: 'app-shared-menu-unrouted',
  templateUrl: './shared.menu.unrouted.component.html',
  styleUrls: ['./shared.menu.unrouted.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class SharedMenuUnroutedComponent implements OnInit {

  strRuta: string = '';
  activeSession: boolean = false;
  userEmail: string = '';

  constructor(
    private oRouter: Router,
    private oSessionService: SessionService
  ) {
    this.oRouter.events.subscribe((oEvent) => {
      if (oEvent instanceof NavigationEnd) {
        this.strRuta = oEvent.url;
      }
    });
    this.activeSession = this.oSessionService.isSessionActive();
    if (this.activeSession) {
      this.userEmail = this.oSessionService.getSessionEmail();
    }
  }

  ngOnInit() {
    this.oSessionService.onLogin().subscribe({
      next: () => {
        this.activeSession = true;
        this.userEmail = this.oSessionService.getSessionEmail();
      },
    });
    this.oSessionService.onLogout().subscribe({
      next: () => {
        this.activeSession = false;
        this.userEmail = '';
      },
    });

  }
}
