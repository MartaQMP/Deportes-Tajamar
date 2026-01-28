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
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [FormsModule, DatePipe, CommonModule],
  templateUrl: './pagos.html',
  styleUrl: './pagos.css',
})
export class Pagos implements OnInit {
  // ─── REFERENCIAS DOM (CAMBIO ESTADO) ───
  @ViewChild('formCambiarEstado') formCambiarEstado!: ElementRef;
  @ViewChild('wrapperCambiarEstado') wrapperCambiarEstado!: ElementRef;
  @ViewChild('cursoSpan') cursoSpan!: ElementRef;
  @ViewChild('actividadSpan') actividadSpan!: ElementRef;
  @ViewChild('cantidadSpan') cantidadSpan!: ElementRef;
  @ViewChild('estadoSelect') estadoSelect!: ElementRef;

  // ─── REFERENCIAS DOM (CREAR PAGO) ───
  @ViewChild('formNuevoPago') formNuevoPago!: ElementRef;
  @ViewChild('wrapperNuevoPago') wrapperNuevoPago!: ElementRef;
  @ViewChild('crearEventoSelect') crearEventoSelect!: ElementRef;
  @ViewChild('crearActividadSelect') crearActividadSelect!: ElementRef;
  @ViewChild('crearCursoSelect') crearCursoSelect!: ElementRef;
  @ViewChild('crearCantidadInput') crearCantidadInput!: ElementRef;

  // ─── PROPIEDADES DE DATOS ───
  public eventos!: Array<Evento>;
  public eventosConPagos!: Array<Evento>;
  public actividadesValidasModal!: Array<Actividad>;
  public cursos!: Array<Curso>;
  public cursosConPagos!: Array<CursoPagos>;
  public cursosFiltradosModal!: Array<Curso>;
  private pagosExistentesEventoModal!: Array<Pago>;
  private todasLasActividades!: Array<Actividad>;
  private tablaRelacion!: Array<ActividadesEvento>;
  private preciosActividad!: Array<PrecioActividad>;

  // ─── ESTADO ───
  public precioMaximoActual: number = 0;
  private idEventoActividadFinal: number = 0;
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
    this.cargarDatosMaestros();
  }

  /**
   * Carga todos los datos necesarios para los filtros de creación
   */
  cargarDatosMaestros(): void {
    forkJoin({
      eventos: this._serviceResultados.getEventos(),
      actividades: this._serviceResultados.getActividades(),
      relaciones: this._serviceResultados.getEventoActividades(),
      precios: this._servicePagos.getPreciosActividad(),
      cursos: this._serviceCursos.getCursos(),
    }).subscribe((res) => {
      this.eventos = res.eventos;
      this.todasLasActividades = res.actividades;
      this.tablaRelacion = res.relaciones;
      this.preciosActividad = res.precios;
      this.cursos = res.cursos;

      // Filtrar eventos que tienen al menos una relación con precio
      const idsEventoConPrecio = this.tablaRelacion
        .filter((rel) =>
          this.preciosActividad.some((p) => p.idEventoActividad === rel.idEventoActividad),
        )
        .map((rel) => rel.idEvento);

      this.eventosConPagos = this.eventos.filter((e) => idsEventoConPrecio.includes(e.idEvento));

      if (this.eventos.length > 0) {
        this.idEventoSeleccionado = this.eventos[0].idEvento;
        this.cargarPagosDelEvento();
      }
    });
  }

  cargarPagosDelEvento(): void {
    if (this.idEventoSeleccionado === 0) return;
    this._servicePagos.getPagosPorEvento(this.idEventoSeleccionado).subscribe((datos) => {
      this.agruparPagosPorCurso(datos);
    });
  }

  agruparPagosPorCurso(datos: Array<Pago>): void {
    const mapaGrupos = new Map<number, CursoPagos>();
    datos.forEach((pago) => {
      if (!mapaGrupos.has(pago.idCurso)) {
        mapaGrupos.set(pago.idCurso, { nombreCurso: pago.curso, idCurso: pago.idCurso, pagos: [] });
      }
      mapaGrupos.get(pago.idCurso)!.pagos.push(pago);
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
    }).then((result) => {
      if (result.isConfirmed && this.token) {
        this._servicePagos
          .putPago(this.token, pago.idPago, pago.cantidadPagada, result.value.nuevoEstado)
          .subscribe({
            next: () => {
              pago.estado = result.value.nuevoEstado;
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

  // ─── ACCIÓN: CREAR PAGO (LÓGICA CASCADA) ───

  actualizarActividadesModal() {
    const idEv = Number(this.crearEventoSelect.nativeElement.value);

    // 1. Cargamos los pagos realizados en este evento para validar duplicados y precios
    this._servicePagos.getPagosPorEvento(idEv).subscribe((pagos) => {
      this.pagosExistentesEventoModal = pagos;

      // 2. Filtramos las actividades que tienen precio definido
      const relacionesValidas = this.tablaRelacion.filter(
        (rel) =>
          rel.idEvento === idEv &&
          this.preciosActividad.some((p) => p.idEventoActividad === rel.idEventoActividad),
      );
      const ids = relacionesValidas.map((r) => r.idActividad);
      this.actividadesValidasModal = this.todasLasActividades.filter((a) =>
        ids.includes(a.idActividad),
      );

      // Reset de campos dependientes
      this.crearActividadSelect.nativeElement.value = '';
      this.precioMaximoActual = 0;
      this.cursosFiltradosModal = [];
    });
  }

  /**
   * Se ejecuta al cambiar la Actividad en el Modal.
   * Calcula el precio restante y oculta cursos con pagos previos.
   */
  actualizarPrecioMaximo() {
    const idEv = Number(this.crearEventoSelect.nativeElement.value);
    const idAct = Number(this.crearActividadSelect.nativeElement.value);
    const rel = this.tablaRelacion.find((r) => r.idEvento === idEv && r.idActividad === idAct);

    if (rel) {
      this.idEventoActividadFinal = rel.idEventoActividad;
      const precioObj = this.preciosActividad.find(
        (p) => p.idEventoActividad === rel.idEventoActividad,
      );
      const precioTotalActividad = precioObj ? precioObj.precioTotal : 0;

      // 1. FILTRADO DE CURSOS: Ocultamos los que ya han pagado en esta Actividad/Evento
      const idsCursosQueYaPagaron = this.pagosExistentesEventoModal
        .filter((p) => p.idEventoActividad === rel.idEventoActividad)
        .map((p) => p.idCurso);

      this.cursosFiltradosModal = this.cursos.filter(
        (c) => !idsCursosQueYaPagaron.includes(c.idCurso),
      );

      // 2. CÁLCULO DE PRECIO MÁXIMO: Restamos lo que ya han pagado otros cursos
      const sumaPagosRealizados = this.pagosExistentesEventoModal
        .filter((p) => p.idEventoActividad === rel.idEventoActividad)
        .reduce((acc, curr) => acc + curr.cantidadPagada, 0);

      this.precioMaximoActual = Math.max(0, precioTotalActividad - sumaPagosRealizados);

      // Reset del select de curso
      this.crearCursoSelect.nativeElement.value = '';
    }
  }

  formularioNuevoPago() {
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
        const cantidad = Number(this.crearCantidadInput.nativeElement.value);
        const curso = this.crearCursoSelect.nativeElement.value;
        if (!curso || !this.idEventoActividadFinal) {
          Swal.showValidationMessage('Rellena todos los campos');
          return false;
        }
        if (cantidad > this.precioMaximoActual) {
          Swal.showValidationMessage('Máximo permitido: ' + this.precioMaximoActual + '€');
          return false;
        }
        return { idEventoActividad: this.idEventoActividadFinal, idCurso: Number(curso), cantidad };
      },
    }).then((result) => {
      if (result.isConfirmed) this.ejecutarFlujoCreacion(result.value);
    });
  }

  ejecutarFlujoCreacion(datos: any) {
    if (!this.token) return;
    this._servicePagos
      .postPago(this.token, datos.idEventoActividad, datos.idCurso, datos.cantidad)
      .subscribe({
        next: (pagoCreado: any) => {
          const nuevoEstado = datos.cantidad === 0 ? 'Exento' : 'No Pagado';
          this._servicePagos
            .putPago(this.token!, pagoCreado.idPago, datos.cantidad, nuevoEstado)
            .subscribe({
              next: () => {
                Swal.fire({
                  title: '¡Éxito!',
                  text: 'Pago creado como ' + nuevoEstado,
                  icon: 'success',
                  confirmButtonColor: '#f2212f',
                });
                this.cargarPagosDelEvento();
              },
            });
        },
      });
  }
}
