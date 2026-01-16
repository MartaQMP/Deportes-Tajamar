import { Routes } from '@angular/router';
import { InicioSesion } from './components/inicio-sesion/inicio-sesion';
import { Home } from './components/home/home';
import { Menu } from './components/menu/menu';
import { Perfil } from './components/perfil/perfil';
import { Cursos } from './components/cursos/cursos';
import { Resultados } from './components/resultados/resultados';

export const routes: Routes = [
  { path: '', component: InicioSesion },
  {
    path: 'deportes',
    component: Menu,
    children: [
      { path: '', component: Home },
      { path: 'perfil', component: Perfil },
      {path: 'cursos', component: Cursos},
      { path: 'resultados', component: Resultados },
      { path: '**', redirectTo: '' },
    ],
  },
  { path: '**', redirectTo: '' },
];
