import { FormsModule } from '@angular/forms';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ResultadosService } from '../../services/resultados.service';
import Actividad from '../../models/actividad';
import Evento from '../../models/evento';
import Resultado from '../../models/resultado';
import { CommonModule, DatePipe } from '@angular/common';
import { NombreEquipoPipe } from '../../pipes/nombre-equipo-pipe';
import { AlumnosEquipoPipe } from '../../pipes/alumnos-equipo-pipe';
import ActividadesEvento from '../../models/actividadesevento';
import Equipo from '../../models/equipo';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import PerfilService from '../../services/perfil.service';
import { EquiposService } from '../../services/equipos.service';

@Component({
  selector: 'app-resultados',
  imports: [FormsModule, DatePipe, NombreEquipoPipe, CommonModule, AlumnosEquipoPipe],
  templateUrl: './resultados.html',
  styleUrl: './resultados.css',
})
export class Resultados implements OnInit {
  // FORMULARIO CREAR RESULTADO
  @ViewChild('formCrearResultados') formCrearResultados!: ElementRef;
  @ViewChild('formNuevoResultado') formNuevoResultado!: ElementRef;
  @ViewChild('eventoResultados') eventoResultados!: ElementRef;
  @ViewChild('actividadResultados') actividadResultados!: ElementRef;
  @ViewChild('equipoLocal') equipoLocal!: ElementRef;
  @ViewChild('equipoVisitante') equipoVisitante!: ElementRef;
  @ViewChild('puntosLocal') puntosLocal!: ElementRef;
  @ViewChild('puntosVisitante') puntosVisitante!: ElementRef;
  public usuarioLogueado!: any;
  public esCapitanEnEvento: boolean = false;
  public idEventoActividadResultado: number = 0;
  public nombreActividadCapitan: string = '';
  public token: string | null = null;
  public equiposLocales: Array<Equipo> = [];
  public equiposVisitantes: Array<Equipo> = [];
  public permisosUsuario: string | null = null;
  public eventoResultado!: Array<Evento>;
  public actividadResultado!: Array<Actividad>;

  // PARA LOS RESULTADOS
  public actividades!: Array<Actividad>;
  public eventos!: Array<Evento>;
  public resultadosAMostrar!: Array<Resultado>;
  private tablaEventoActividad!: Array<ActividadesEvento>;
  private todosLosResultados!: Array<Resultado>;
  public idEventoSeleccionado: number = 0;
  public idActividadSeleccionada: number = 0;
  public equiposEventoActividad!: Array<Equipo>;

  // PARA EL ACORDEÓN PERSONALIZADO
  public expandedPartido: number | null = null;

  constructor(
    private _serviceResultados: ResultadosService,
    private _router: Router,
    private _servicePerfil: PerfilService,
    private _serviceEquipos: EquiposService,
  ) { }

  // TOGGLE PARA EXPANDIR/COLAPSAR ACORDEÓN
  togglePartido(idPartido: number): void {
    this.expandedPartido = this.expandedPartido === idPartido ? null : idPartido;
  }

  ngOnInit(): void {
    this.token = localStorage.getItem('token');
    this.permisosUsuario = localStorage.getItem('permisosUsuario');

    if (!this.token) {
      this._router.navigate(['/login']);
      return;
    }

    // USUARIO LOGUEADO
    this._servicePerfil.getDatosUsuario(this.token).subscribe((response) => {
      this.usuarioLogueado = response;
    });

    this.cargarDatosIniciales();
  }

  cargarDatosIniciales() {
    this._serviceResultados.getActividades().subscribe((res) => (this.actividades = res));
    this._serviceResultados.getEventos().subscribe((res) => (this.eventos = res));
    this._serviceResultados.getResultados().subscribe((res) => {
      this.resultadosAMostrar = res;
      this.todosLosResultados = res;
    });
    this._serviceResultados
      .getEventoActividades()
      .subscribe((res) => (this.tablaEventoActividad = res));
  }

  filtrarPorEvento(event: any) {
    this.idEventoSeleccionado = parseInt(event.target.value);
    this.idActividadSeleccionada = 0;
    this.aplicarFiltros('evento');
    this.comprobarCapitan(this.idEventoSeleccionado);
  }

  comprobarCapitan(idEvento: number) {
    this.esCapitanEnEvento = false;

    // BUSCO EN LA TABLA EVENTOACTIVIDAD LOS IdsEventoActividad DEL IdEvento PASADO
    const eventosActividad = this.tablaEventoActividad.filter((rel) => rel.idEvento === idEvento);

    // BUSCO POR CADA EVENTOACTIVIDAD EL CAPITAN PARA SABER SI ES EL USUARIO LOGUEADO
    eventosActividad.forEach((rel) => {
      this._serviceEquipos
        .getUsuarioCapitanEventoActividad(rel.idEventoActividad)
        .subscribe((capitan) => {
          if (capitan && capitan.idUsuario === this.usuarioLogueado.idUsuario) {
            this.esCapitanEnEvento = true;
            this.idEventoActividadResultado = rel.idEventoActividad;

            // COJO EL NOMBRE DE LA ACTIVIDAD
            const actividad = this.actividades.find((act) => act.idActividad === rel.idActividad);
            this.nombreActividadCapitan = actividad ? actividad.nombre : '';

            // CARGO LOS EQUIPOS DE ESE EVENTOACTIVIDAD
            this._serviceEquipos.getEquipos().subscribe((todosLosEquipos) => {
              this.equiposEventoActividad = todosLosEquipos.filter(
                (e) => e.idEventoActividad === rel.idEventoActividad,
              );
              this.equiposLocales = [...this.equiposEventoActividad];
              this.equiposVisitantes = [...this.equiposEventoActividad];
            });
          }
        });
    });
  }

  actualizarFiltroEquipos(tipo: 'local' | 'visitante') {
    // MIRO SI SE HA ELEGIDO UN EQUIPO PARA QUE NO APAREZCA EN EL OTRO SELECT
    if (tipo === 'local') {
      const localVal = parseInt(this.equipoLocal.nativeElement.value);
      this.equiposVisitantes = this.equiposEventoActividad.filter(
        (equipo) => equipo.idEquipo !== localVal,
      );
    } else {
      const visitanteVal = parseInt(this.equipoVisitante.nativeElement.value);
      this.equiposLocales = this.equiposEventoActividad.filter(
        (equipo) => equipo.idEquipo !== visitanteVal,
      );
    }
  }

  filtrarPorActividad(event: any) {
    this.idActividadSeleccionada = parseInt(event.target.value);
    this.idEventoSeleccionado = 0;
    this.aplicarFiltros('actividad');
  }

  aplicarFiltros(tipo: 'evento' | 'actividad') {
    // MIRO SI FILTRO POR ACTIVIDAD O EVENTO
    const idBusca = tipo === 'evento' ? this.idEventoSeleccionado : this.idActividadSeleccionada;

    if (!idBusca) {
      this.resultadosAMostrar = [...this.todosLosResultados];
      return;
    }

    this.resultadosAMostrar = this.todosLosResultados.filter((response) => {
      const relacion = this.tablaEventoActividad.find(
        (rel) => rel.idEventoActividad === response.idEventoActividad,
      );
      if (!relacion) return false;

      return tipo === 'evento' ? relacion.idEvento === idBusca : relacion.idActividad === idBusca;
    });
  }

  limpiarFiltros(): void {
    // PARA VOLVER A MOSTRAR TODOS LOS RESULTADOS
    this.idEventoSeleccionado = 0;
    this.idActividadSeleccionada = 0;
    this.resultadosAMostrar = [...this.todosLosResultados];
  }

  formularioCrearResultado() {
    // ME MUESTRA EL FORMULARIO PARA CREAR UN RESULTADO
    this.equipoLocal.nativeElement.value = '';
    this.equipoVisitante.nativeElement.value = '';
    this.puntosLocal.nativeElement.value = '';
    this.puntosVisitante.nativeElement.value = '';

    Swal.fire({
      title: 'Añadir Resultado de ' + this.nombreActividadCapitan,
      html: this.formNuevoResultado.nativeElement,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Añadir Resultado',
      confirmButtonColor: '#f2212f',
      cancelButtonText: 'Cancelar',
      didClose: () => {
        if (this.formCrearResultados && this.formNuevoResultado) {
          this.formCrearResultados.nativeElement.appendChild(this.formNuevoResultado.nativeElement);
        }
      },
      preConfirm: () => {
        let idEquipoLocal: number = this.equipoLocal.nativeElement.value;
        let idEquipoVisitante: number = this.equipoVisitante.nativeElement.value;
        let puntosLocalCantidad: number = this.puntosLocal.nativeElement.value;
        let puntosVisitanteCantidad: number = this.puntosVisitante.nativeElement.value;

        if (
          !idEquipoLocal ||
          !idEquipoVisitante ||
          !puntosLocalCantidad ||
          !puntosVisitanteCantidad
        ) {
          Swal.showValidationMessage('Por favor, rellena todos los campos');
          return false;
        }

        return {
          idEquipoLocal: idEquipoLocal,
          idEquipoVisitante: idEquipoVisitante,
          puntosLocalCantidad: puntosLocalCantidad,
          puntosVisitanteCantidad: puntosVisitanteCantidad,
        };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.crearResultado(result.value);
      }
    });
  }

  crearResultado(result: {
    idEquipoLocal: number;
    idEquipoVisitante: number;
    puntosLocalCantidad: number;
    puntosVisitanteCantidad: number;
  }) {
    if (this.token) {
      let resultado: Resultado = {
        idPartidoResultado: 0,
        idEventoActividad: this.idEventoActividadResultado,
        idEquipoLocal: result.idEquipoLocal,
        idEquipoVisitante: result.idEquipoVisitante,
        puntosLocal: result.puntosLocalCantidad,
        puntosVisitante: result.puntosVisitanteCantidad,
      };

      this._serviceResultados.postResultado(this.token, resultado).subscribe({
        next: () => {
          Swal.fire({
            title: 'Añadido',
            text: 'Resultado añadido correctamente',
            icon: 'success',
            confirmButtonColor: '#f2212f',
          });
          this.cargarDatosIniciales();
        },
        error: (err) => {
          console.log(err);
          Swal.fire({
            title: 'Error',
            text: 'Ha ocurrido un error',
            icon: 'error',
            confirmButtonColor: '#f2212f',
          });
        },
      });
    }
  }
}
