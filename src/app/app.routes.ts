import { Routes } from '@angular/router';

import { UsuarioAdminPlistRoutedComponent } from './component/usuario/usuario.admin.plist.routed/usuario.admin.plist.routed.component';
import { SharedHomeRoutedComponent } from './component/shared/shared.home.routed/shared.home.routed.component';
import { CartaAdminPlistRoutedComponent } from './component/carta/carta.admin.plist.routed/carta.admin.plist.routed.component';
import { UsuarioAdminColeccionRoutedComponent } from './component/usuario/usuario.admin.coleccion.routed/usuario.admin.coleccion.routed.component';
import { UsuarioAdminCreateRoutedComponent } from './component/usuario/usuario.admin.create.routed/usuario.admin.create.routed.component';
import { UsuarioDeleteRoutedComponent } from './component/usuario/usuario.delete.routed/usuario.delete.routed.component';
import { UsuarioEditRoutedComponent } from './component/usuario/usuario.edit.routed/usuario.edit.routed.component';

export const routes: Routes = [

  { path: '', component: SharedHomeRoutedComponent },
  { path: 'home', component: SharedHomeRoutedComponent },


  // USUARIO
  { path: 'admin/usuario/plist', component: UsuarioAdminPlistRoutedComponent },
  { path: 'admin/usuario/coleccion/:id', component: UsuarioAdminColeccionRoutedComponent },
  { path: 'usuario/create', component: UsuarioAdminCreateRoutedComponent },
  { path: 'usuario/delete/:id', component: UsuarioDeleteRoutedComponent },
  { path: 'usuario/edit/:id', component: UsuarioEditRoutedComponent },
  // CARTA
  { path: 'carta/plist', component: CartaAdminPlistRoutedComponent },



];
