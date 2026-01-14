import { Routes } from '@angular/router';
import { InicioSesion } from './components/inicio-sesion/inicio-sesion';
import { Home } from './components/home/home';
import { Menu } from './components/menu/menu';
import { Perfil } from './components/perfil/perfil';

export const routes: Routes = [
  { path: '', component: InicioSesion },
  {
    path: 'deportes',
    component: Menu,
    children: [
      { path: '', component: Home },
      { path: 'perfil', component: Perfil },
      { path: '**', redirectTo: '' },
    ],
  },
  { path: '**', redirectTo: '' },
];
