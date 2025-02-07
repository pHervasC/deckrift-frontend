import { Routes } from '@angular/router';

import { UsuarioAdminPlistRoutedComponent } from './component/usuario/usuario.admin.plist.routed/usuario.admin.plist.routed.component';
import { SharedHomeRoutedComponent } from './component/shared/shared.home.routed/shared.home.routed.component';
import { CartaAdminPlistRoutedComponent } from './component/carta/carta.admin.plist.routed/carta.admin.plist.routed.component';
import { UsuarioAdminColeccionRoutedComponent } from './component/usuario/usuario.admin.coleccion.routed/usuario.admin.coleccion.routed.component';
import { UsuarioCreateRoutedComponent } from './component/usuario/usuario.create.routed/usuario.create.routed.component';
import { UsuarioDeleteRoutedComponent } from './component/usuario/usuario.delete.routed/usuario.delete.routed.component';
import { UsuarioAdminEditRoutedComponent } from './component/usuario/usuario.admin.edit.routed/usuario.admin.edit.routed.component';
import { SharedLoginRoutedComponent } from './component/shared/shared.login.routed/shared.login.routed/shared.login.routed.component';
import { SharedByemailRoutedComponent } from './component/shared/shared.byemail.routed/shared.byemail.routed.component';
import { SharedLogoutRoutedComponent } from './component/shared/shared.logout.routed/shared.logout.routed.component';
import { SharedHomeRegisteredRoutedComponent } from './component/shared/shared.home.registered.routed/shared.home.registered.routed.component';
import { AdminGuard } from './guards/admin.guard';
import { AuditorGuard } from './guards/auditor.guard';
import { CartaPlistRoutedComponent } from './component/carta/carta.plist.routed/carta.plist.routed.component';
import { CartaAdminCreateRoutedComponent } from './component/carta/carta.admin.create.routed/carta.admin.create.routed.component';
import { UsuarioColeccionRoutedComponent } from './component/usuario/usuario.coleccion.routed/usuario.coleccion.routed.component';
import { CartaAdminDeleteRoutedComponent } from './component/carta/carta.admin.delete.routed/carta.admin.delete.routed.component';
import { CartaAdminEditRoutedComponent } from './component/carta/carta.admin.edit.routed/carta.admin.edit.routed.component';
import { UsuarioAdminCreateRoutedComponent } from './component/usuario/usuario.admin.create.routed/usuario.admin.create.routed.component';
import { SobreAbrirRoutedComponent } from './component/sobre/sobre.abrir.routed/sobre.abrir.routed.component';
import { UsuarioEditRoutedComponent } from './component/usuario/usuario.edit.routed/usuario.edit.routed.component';
export const routes: Routes = [

  //Shared
  { path: '', component: SharedHomeRoutedComponent },
  { path: 'home', component: SharedHomeRoutedComponent },
  { path: 'home/registered', component: SharedHomeRegisteredRoutedComponent },
  { path: 'login', component: SharedLoginRoutedComponent},
  { path: 'logout', component: SharedLogoutRoutedComponent},
  { path: 'byemail/:email', component: SharedByemailRoutedComponent, canActivate: [AuditorGuard] },

  // USUARIO
  { path: 'admin/usuario/plist', component: UsuarioAdminPlistRoutedComponent, canActivate: [AdminGuard] },
  { path: 'admin/usuario/coleccion/:id', component: UsuarioAdminColeccionRoutedComponent, canActivate: [AdminGuard] },
  { path: 'admin/usuario/createAdmin', component: UsuarioAdminCreateRoutedComponent, canActivate: [AdminGuard]},
  { path: 'usuario/admin/edit/:id', component: UsuarioAdminEditRoutedComponent, canActivate: [AuditorGuard] },
  { path: 'usuario/coleccion/:id', component: UsuarioColeccionRoutedComponent, canActivate: [AuditorGuard] },
  { path: 'usuario/edit/:id', component: UsuarioEditRoutedComponent, canActivate: [AuditorGuard]},
  { path: 'usuario/delete/:id', component: UsuarioDeleteRoutedComponent, canActivate: [AuditorGuard] },
  { path: 'usuario/create', component: UsuarioCreateRoutedComponent },

  // CARTA
  { path: 'admin/carta/plist', component: CartaAdminPlistRoutedComponent, canActivate: [AdminGuard] },
  { path: 'admin/carta/create', component: CartaAdminCreateRoutedComponent, canActivate: [AdminGuard] },
  { path: 'admin/carta/delete/:id', component: CartaAdminDeleteRoutedComponent, canActivate: [AdminGuard]},
  { path: 'admin/carta/edit/:id', component: CartaAdminEditRoutedComponent, canActivate: [AdminGuard]}, 
  { path: 'cartas/plist', component: CartaPlistRoutedComponent, canActivate: [AuditorGuard] },

  // SOBRE
  { path: 'sobre/abrir/:id', component:SobreAbrirRoutedComponent, canActivate: [AuditorGuard]},



];
