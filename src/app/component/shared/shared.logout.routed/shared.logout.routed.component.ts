import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { LoginService } from '../../../service/login.service';
import { SessionService } from '../../../service/session.service';

@Component({
  selector: 'app-login',
  templateUrl: './shared.logout.routed.component.html',
  styleUrls: ['./shared.logout.routed.component.css'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ]
})
export class SharedLogoutRoutedComponent implements OnInit {

  errorMessage: string | null = null;

  constructor(
    private http: HttpClient,
    private oLoginService: LoginService,
    private oSessionService: SessionService,
    private oRouter:Router
  ) { }

  ngOnInit(): void { }


  onLogout() {
    this.oSessionService.logout();
    this.oRouter.navigate(['/']);
  }

  onCancel() {
    this.oRouter.navigate(['/']);
  }

}
