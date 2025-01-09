import { Routes } from '@angular/router';

import { UsuarioAdminPlistRoutedComponent } from './component/usuario/usuario.admin.plist.routed/usuario.admin.plist.routed.component';
import { SharedHomeRoutedComponent } from './component/shared/shared.home.routed/shared.home.routed.component';
import { CartaAdminPlistRoutedComponent } from './component/carta/carta.admin.plist.routed/carta.admin.plist.routed.component';
import { UsuarioAdminColeccionRoutedComponent } from './component/usuario/usuario.admin.coleccion.routed/usuario.admin.coleccion.routed.component';
import { UsuarioAdminCreateRoutedComponent } from './component/usuario/usuario.admin.create.routed/usuario.admin.create.routed.component';


export const routes: Routes = [

  { path: '', component: SharedHomeRoutedComponent },
  { path: 'home', component: SharedHomeRoutedComponent },


  // USUARIO
  { path: 'admin/usuario/plist', component: UsuarioAdminPlistRoutedComponent },
  { path: 'admin/usuario/coleccion/:id', component: UsuarioAdminColeccionRoutedComponent },
  { path: 'admin/usuario/create', component: UsuarioAdminCreateRoutedComponent },
  // CARTA
  { path: 'admin/carta/plist', component: CartaAdminPlistRoutedComponent },



];
