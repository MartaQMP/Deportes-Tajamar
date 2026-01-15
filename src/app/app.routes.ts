import { Routes } from '@angular/router';
import { InicioSesion } from './components/inicio-sesion/inicio-sesion';
import { Home } from './components/home/home';
import { Menu } from './components/menu/menu';
import { Perfil } from './components/perfil/perfil';
import { FormularioEvento } from './components/formulario-evento/formulario-evento';


export const routes: Routes = [
  { path: '', component: InicioSesion },
  {
    path: 'deportes',
    component: Menu,
    children: [
      { path: '', component: Home },
      { path: 'perfil', component: Perfil },
      { path: 'crear-evento', component: FormularioEvento },
      
      { path: '**', redirectTo: '' },
    ],
  },
  { path: '**', redirectTo: '' },
];
