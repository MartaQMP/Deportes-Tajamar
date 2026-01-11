import { Routes } from '@angular/router';
import { Principal } from './components/principal/principal';
import { InicioSesion } from './components/inicio-sesion/inicio-sesion';
import { Home } from './components/home/home';

export const routes: Routes = [
  // { path: '', component: InicioSesion },
  {path: '', component :Home},
  {
    path: 'principal',
    component: Principal,
    /*CUANDO SE HAGAN LAS PAGINAS DE HOME Y DEMAS DEBEN SER HIJOS DE
    LA PRINCIPAL QUE ES DONDE ESTARA LA LLAMADA AL MENU Y ROUTER-OUTLET*/

    children: [
      { path: 'home', component: Home },
    ],
  },
  { path: '**', redirectTo: '' },
];
