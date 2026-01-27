import { Equipos } from './components/equipos/equipos';
import { Routes } from '@angular/router';
import { InicioSesion } from './components/inicio-sesion/inicio-sesion';
import { Home } from './components/home/home';
import { Menu } from './components/menu/menu';
import { Perfil } from './components/perfil/perfil';
import { Cursos } from './components/cursos/cursos';
import { Resultados } from './components/resultados/resultados';
import { SolicitarMaterial } from './components/solicitar-material/solicitar-material';

export const routes: Routes = [
  { path: '', component: InicioSesion },
  {
    path: 'deportes',
    component: Menu,
    children: [
      { path: '', component: Home },
      { path: 'perfil', component: Perfil },
      { path: 'cursos', component: Cursos },
      { path: 'resultados', component: Resultados },
      { path: 'equipos', component: Equipos },
      { path: 'solicitar-material/:idEvento', component: SolicitarMaterial },
      { path: '**', redirectTo: '' },
    ],
  },
  { path: '**', redirectTo: '' },
];
