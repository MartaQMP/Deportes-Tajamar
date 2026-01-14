import { Routes } from '@angular/router';
import { InicioSesion } from './components/inicio-sesion/inicio-sesion';
import { Home } from './components/home/home';
import { Menu } from './components/menu/menu';
import { Perfil } from './components/perfil/perfil';

export const routes: Routes = [
  // { path: '', component: InicioSesion },
  {path: '', component :InicioSesion},
  {
    path: 'principal',
    component: Menu,
    /*CUANDO SE HAGAN LAS PAGINAS DE HOME Y DEMAS DEBEN SER HIJOS DE
    LA PRINCIPAL QUE ES DONDE ESTARA LA LLAMADA AL MENU Y ROUTER-OUTLET*/

    children: [
      {path: 'home', component: Home },
      {path: 'perfil', component: Perfil},
    ],
  },
  //Pongo las las rutas de menu y perfil para irlas viendo mientras las diseño
  //Ya el miercoles organizamos el router.
  { path: '**', redirectTo: '' },
];
