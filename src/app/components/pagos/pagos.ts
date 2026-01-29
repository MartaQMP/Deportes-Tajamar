import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';
import Pago, { CursoPagos } from '../../models/pago';
import { ResultadosService } from '../../services/resultados.service';
import Evento from '../../models/evento';
import Actividad from '../../models/actividad';
import ActividadesEvento from '../../models/actividadesevento';
import { FormsModule } from '@angular/forms';
import { DatePipe, CommonModule } from '@angular/common';
import PrecioActividad from '../../models/precioActividad';
import Curso from '../../models/curso';
import { PagoService } from '../../services/pagos.service';
import { forkJoin } from 'rxjs';
import CursosService from '../../services/cursos.service';

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [FormsModule, DatePipe, CommonModule],
  templateUrl: './pagos.html',
  styleUrl: './pagos.css',
})
export class Pagos implements OnInit {
  // ─── FORMULARIO CAMBIO ESTADO ───
  @ViewChild('formCambiarEstado') formCambiarEstado!: ElementRef;
  @ViewChild('wrapperCambiarEstado') wrapperCambiarEstado!: ElementRef;
  @ViewChild('cursoSpan') cursoSpan!: ElementRef;
  @ViewChild('actividadSpan') actividadSpan!: ElementRef;
  @ViewChild('cantidadSpan') cantidadSpan!: ElementRef;
  @ViewChild('estadoSelect') estadoSelect!: ElementRef;

  // ─── FORMULARIO CREAR PAGO ───
  @ViewChild('formNuevoPago') formNuevoPago!: ElementRef;
  @ViewChild('wrapperNuevoPago') wrapperNuevoPago!: ElementRef;
  @ViewChild('crearEventoSelect') crearEventoSelect!: ElementRef;
  @ViewChild('crearActividadSelect') crearActividadSelect!: ElementRef;
  @ViewChild('crearCursoSelect') crearCursoSelect!: ElementRef;
  @ViewChild('crearCantidadInput') crearCantidadInput!: ElementRef;

  public eventos!: Array<Evento>;
  public eventosConPagos!: Array<Evento>;
  public actividadesValidasModal!: Array<Actividad>;
  public cursos!: Array<Curso>;
  public cursosConPagos!: Array<CursoPagos>;
  public cursosFiltrados!: Array<Curso>;
  public pagosExistentesEvento!: Array<Pago>;
  public todasLasActividades!: Array<Actividad>;
  public tablaEventoActividades!: Array<ActividadesEvento>;
  public preciosActividad!: Array<PrecioActividad>;
  public precioMaximoActual: number = 0;
  public idEventoActividadFinal: number = 0;
  public idPrecioActividadFinal: number = 0;
  public idEventoSeleccionado: number = 0;
  public permisosUsuario: string | null = null;
  public token: string | null = null;

  constructor(
    private _serviceResultados: ResultadosService,
    private _servicePagos: PagoService,
    private _serviceCursos: CursosService,
  ) {}

  ngOnInit(): void {
    this.token = localStorage.getItem('token');
    this.permisosUsuario = localStorage.getItem('permisosUsuario');
    this.cargarDatosPrincipales();
  }

  cargarDatosPrincipales(): void {
    forkJoin({
      eventos: this._serviceResultados.getEventos(),
      actividades: this._serviceResultados.getActividades(),
      relaciones: this._serviceResultados.getEventoActividades(),
      precios: this._servicePagos.getPreciosActividad(),
      cursos: this._serviceCursos.getCursos(),
    }).subscribe((respuesta: any) => {
      this.eventos = respuesta.eventos;
      this.todasLasActividades = respuesta.actividades;
      this.tablaEventoActividades = respuesta.relaciones;
      this.preciosActividad = respuesta.precios;
      this.cursos = respuesta.cursos;

      // FILTRO LOS EVENTO CON AL MENOS UNA ACTIVIDAD CON PRECIO
      const idsEventoConPrecio: number[] = this.tablaEventoActividades
        .filter((relacion: ActividadesEvento) =>
          this.preciosActividad.some(
            (precio: PrecioActividad) => precio.idEventoActividad === relacion.idEventoActividad,
          ),
        )
        .map((relacion: ActividadesEvento) => relacion.idEvento);

      this.eventosConPagos = this.eventos.filter((evento: Evento) =>
        idsEventoConPrecio.includes(evento.idEvento),
      );

      if (this.eventos.length > 0) {
        this.idEventoSeleccionado = this.eventos[0].idEvento;
        this.cargarPagosDelEvento();
      }
    });
  }

  cargarPagosDelEvento(): void {
    if (this.idEventoSeleccionado === 0) return;
    this._servicePagos
      .getPagosPorEvento(this.idEventoSeleccionado)
      .subscribe((listaPagos: Array<Pago>) => {
        this.agruparPagosPorCurso(listaPagos);
      });
  }

  agruparPagosPorCurso(listaPagos: Array<Pago>): void {
    const mapaGrupos: Map<number, CursoPagos> = new Map<number, CursoPagos>();
    listaPagos.forEach((pagoIndividual: Pago) => {
      if (!mapaGrupos.has(pagoIndividual.idCurso)) {
        mapaGrupos.set(pagoIndividual.idCurso, {
          nombreCurso: pagoIndividual.curso,
          idCurso: pagoIndividual.idCurso,
          pagos: [],
        });
      }
      mapaGrupos.get(pagoIndividual.idCurso)!.pagos.push(pagoIndividual);
    });
    this.cursosConPagos = Array.from(mapaGrupos.values());
  }

  cambiarEstado(pago: Pago): void {
    this.cursoSpan.nativeElement.innerText = pago.curso;
    this.actividadSpan.nativeElement.innerText = pago.actividad;
    this.cantidadSpan.nativeElement.innerText = pago.cantidadPagada + '€';
    this.estadoSelect.nativeElement.value = pago.estado;

    Swal.fire({
      title: 'Cambiar estado del pago',
      html: this.formCambiarEstado.nativeElement,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      confirmButtonColor: '#f2212f',
      didClose: () => {
        this.wrapperCambiarEstado.nativeElement.appendChild(this.formCambiarEstado.nativeElement);
      },
      preConfirm: () => {
        return { nuevoEstado: this.estadoSelect.nativeElement.value };
      },
    }).then((resultadoPopup: any) => {
      if (resultadoPopup.isConfirmed && this.token) {
        this._servicePagos
          .putPago(this.token, pago.idPago, pago.cantidadPagada, resultadoPopup.value.nuevoEstado)
          .subscribe({
            next: () => {
              pago.estado = resultadoPopup.value.nuevoEstado;
              Swal.fire({
                title: 'Guardado',
                text: 'Estado Actualizado',
                icon: 'success',
                confirmButtonColor: '#f2212f',
              });
            },
            error: () =>
              Swal.fire({
                title: 'Error',
                text: 'Fallo al cambiar el estado',
                icon: 'error',
                confirmButtonColor: '#f2212f',
              }),
          });
      }
    });
  }

  // PARA CREAR PAGO
  cargarActividadesDeEvento(): void {
    const idEventoActual: number = Number(this.crearEventoSelect.nativeElement.value);

    this._servicePagos.getPagosPorEvento(idEventoActual).subscribe((listaPagos: Array<Pago>) => {
      this.pagosExistentesEvento = listaPagos;

      // FILTRO ACTIVIDADES QUE TIENEN PRECIO
      const relacionesValidas: Array<ActividadesEvento> = this.tablaEventoActividades.filter(
        (relacion: ActividadesEvento) =>
          relacion.idEvento === idEventoActual &&
          this.preciosActividad.some(
            (precio: PrecioActividad) => precio.idEventoActividad === relacion.idEventoActividad,
          ),
      );

      const idsActividadesValidas: Array<number> = relacionesValidas.map(
        (relacion: ActividadesEvento) => relacion.idActividad,
      );

      this.actividadesValidasModal = this.todasLasActividades.filter((actividad: Actividad) =>
        idsActividadesValidas.includes(actividad.idActividad),
      );

      this.crearActividadSelect.nativeElement.value = '';
      this.precioMaximoActual = 0;
      this.cursosFiltrados = [];
    });
  }

  actualizarPrecioMaximo(): void {
    const idEventoActual: number = Number(this.crearEventoSelect.nativeElement.value);
    const idActividadActual: number = Number(this.crearActividadSelect.nativeElement.value);

    const relacionEncontrada: ActividadesEvento | undefined = this.tablaEventoActividades.find(
      (relacion: ActividadesEvento) =>
        relacion.idEvento === idEventoActual && relacion.idActividad === idActividadActual,
    );

    if (relacionEncontrada) {
      const precioDefinido: PrecioActividad | undefined = this.preciosActividad.find(
        (precio: PrecioActividad) =>
          precio.idEventoActividad === relacionEncontrada.idEventoActividad,
      );

      if (precioDefinido) {
        this.idPrecioActividadFinal = precioDefinido.idPrecioActividad;

        const sumaPagosRealizados: number = this.pagosExistentesEvento
          .filter((pago: Pago) => pago.idEventoActividad === relacionEncontrada.idEventoActividad)
          .reduce((acumulado: number, actual: Pago) => acumulado + actual.cantidadPagada, 0);

        this.precioMaximoActual = Math.max(0, precioDefinido.precioTotal - sumaPagosRealizados);
      }

      const idsCursosConPagoExistente: Array<number> = this.pagosExistentesEvento
        .filter((pago: Pago) => pago.idEventoActividad === relacionEncontrada.idEventoActividad)
        .map((pago: Pago) => pago.idCurso);

      this.cursosFiltrados = this.cursos.filter(
        (curso: Curso) => !idsCursosConPagoExistente.includes(curso.idCurso),
      );

      this.crearCursoSelect.nativeElement.value = '';
    }
  }

  formularioNuevoPago(): void {
    this.precioMaximoActual = 0;
    this.actividadesValidasModal = [];
    this.crearEventoSelect.nativeElement.value = '';
    this.crearCantidadInput.nativeElement.value = '';

    Swal.fire({
      title: 'Crear Nuevo Pago',
      html: this.formNuevoPago.nativeElement,
      showCancelButton: true,
      confirmButtonText: 'Crear Pago',
      confirmButtonColor: '#f2212f',
      didClose: () => {
        this.wrapperNuevoPago.nativeElement.appendChild(this.formNuevoPago.nativeElement);
      },
      preConfirm: () => {
        const cantidadIngresada: number = Number(this.crearCantidadInput.nativeElement.value);
        const idCursoSeleccionado: number = Number(this.crearCursoSelect.nativeElement.value);

        if (!idCursoSeleccionado || !this.idPrecioActividadFinal) {
          Swal.showValidationMessage('Rellena todos los campos');
          return false;
        }
        if (cantidadIngresada > this.precioMaximoActual) {
          Swal.showValidationMessage('Máximo permitido: ' + this.precioMaximoActual + '€');
          return false;
        }
        return {
          idPago: 0,
          idCurso: idCursoSeleccionado,
          idPrecioActividad: this.idPrecioActividadFinal,
          cantidad: cantidadIngresada,
          estado: cantidadIngresada === 0 ? 'Exento' : 'Pendiente',
        };
      },
    }).then((resultadoPopup: any) => {
      if (resultadoPopup.isConfirmed && this.token) {
        this._servicePagos.postPago(this.token, resultadoPopup.value).subscribe({
          next: () => {
            Swal.fire({
              title: '¡Éxito!',
              text: 'Pago creado',
              icon: 'success',
              confirmButtonColor: '#f2212f',
            });
            this.cargarPagosDelEvento();
          },
          error: () => {
            Swal.fire({
              title: 'Error',
              text: 'No se pudo crear el pago en la base de datos',
              icon: 'error',
              confirmButtonColor: '#f2212f',
            });
          },
        });
      }
    });
  }
}
