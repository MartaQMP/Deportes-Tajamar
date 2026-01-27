import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import Pago, { CursoPagos } from '../../models/pago';
import { ResultadosService } from '../../services/resultados.service';
import Evento from '../../models/evento';
import Actividad from '../../models/actividad';
import ActividadesEvento from '../../models/actividadesevento';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import CursosService from '../../services/cursos.service';
import PrecioActividad from '../../models/precioActividad';
import Curso from '../../models/curso';
import { PagoService } from '../../services/pagos.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-pagos',
  imports: [FormsModule, DatePipe],
  templateUrl: './pagos.html',
  styleUrl: './pagos.css',
})
export class Pagos implements OnInit {
  public eventos!: Array<Evento>;
  public cursosConPagos!: Array<CursoPagos>;
  public idEventoSeleccionado!: number;
  public permisosUsuario: string | null = null;
  public token: string | null = null;

  constructor(
    private _serviceResultados: ResultadosService,
    private _servicePagos: PagoService,
  ) {}

  ngOnInit(): void {
    this.token = localStorage.getItem('token');
    this.permisosUsuario = localStorage.getItem('permisosUsuario');
    this.cargarEventos();
  }

  cargarEventos(): void {
    // Carga inicial solo de eventos para el select
    this._serviceResultados.getEventos().subscribe((response) => {
      this.eventos = response;
      // Opcional: Seleccionar el primero por defecto
      if (this.eventos.length > 0) {
        this.idEventoSeleccionado = this.eventos[0].idEvento;
        this.cargarPagosDelEvento();
      }
    });
  }

  // ─── LÓGICA PRINCIPAL ───

  cargarPagosDelEvento(): void {
    if (this.idEventoSeleccionado === 0) {
      this.cursosConPagos = [];
      return;
    }

    // Llamada a la NUEVA API: /pagos/{idEvento}
    // Asumo que el servicio tiene un método getPagosCompletosPorEvento(id)
    this._servicePagos
      .getPagosPorEvento(this.idEventoSeleccionado)
      .subscribe((datos: Array<Pago>) => {
        this.agruparPagosPorCurso(datos);
      });
  }

  /**
   * Transforma la lista plana de la API en una estructura agrupada por curso.
   */
  agruparPagosPorCurso(datos: Array<Pago>): void {
    const mapaGrupos = new Map<number, CursoPagos>();

    datos.forEach((pago) => {
      // Si el curso no está en el mapa, lo inicializamos
      if (!mapaGrupos.has(pago.idCurso)) {
        mapaGrupos.set(pago.idCurso, {
          nombreCurso: pago.curso,
          idCurso: pago.idCurso,
          pagos: [],
        });
      }
      // Añadimos el pago a la lista de ese curso
      mapaGrupos.get(pago.idCurso)!.pagos.push(pago);
    });

    // Convertimos los valores del mapa de nuevo a un array para el HTML
    this.cursosConPagos = Array.from(mapaGrupos.values());
  }

  // ─── ACCIONES (Adaptadas al nuevo modelo) ───

  formularioNuevoPago(): void {
    // NOTA: Ahora para crear un pago necesitas los IDs de Curso y Actividad.
    // Deberías tener listas cargadas de esto o pedirlos de otra forma.
    Swal.fire('Info', 'Funcionalidad pendiente de adaptar a la nueva estructura de datos', 'info');
  }

  confirmarPago(pago: Pago): void {
    Swal.fire({
      title: '¿Confirmar pago?',
      text: `Curso: ${pago.curso} - Actividad: ${pago.actividad}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      confirmButtonText: 'Sí, marcar PAGADO',
    }).then((result) => {
      if (result.isConfirmed && this.token) {
        // Llamada a la API (putPago)
        this._servicePagos
          .putPago(this.token, pago.idPago, pago.cantidadPagada, pago.estado)
          .subscribe({
            next: () => {
              pago.estado = 'Pagado'; // Actualizamos la vista
              Swal.fire('¡Hecho!', 'Pago registrado.', 'success');
            },
            error: () => Swal.fire('Error', 'No se pudo actualizar', 'error'),
          });
      }
    });
  }

  editarPago(pago: Pago): void {
    Swal.fire({
      title: `Editar Pago`,
      html: `
        <div class="text-start">
          <p class="mb-1"><strong>Curso:</strong> ${pago.curso}</p>
          <p class="mb-3"><strong>Actividad:</strong> ${pago.actividad}</p>
          <label class="form-label">Cantidad a pagar (€)</label>
          <input id="swal-monto" type="number" class="form-control mb-3" value="${pago.cantidadPagada}">
          <label class="form-label">Estado</label>
          <select id="swal-estado" class="form-select">
            <option value="Pendiente" ${pago.estado === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
            <option value="Pagado" ${pago.estado === 'Pagado' ? 'selected' : ''}>Pagado</option>
            <option value="Exento" ${pago.estado === 'Exento' ? 'selected' : ''}>Exento</option>
          </select>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      confirmButtonColor: '#f2212f',
      preConfirm: () => {
        return {
          monto: Number((document.getElementById('swal-monto') as HTMLInputElement).value),
          estado: (document.getElementById('swal-estado') as HTMLSelectElement).value,
        };
      },
    }).then((result) => {
      if (result.isConfirmed && this.token) {
        // Llamada API
        this._servicePagos
          .putPago(this.token, pago.idPago, result.value.monto, result.value.estado)
          .subscribe({
            next: () => {
              // Actualizamos vista
              pago.cantidadPagada = result.value.monto;
              pago.estado = result.value.estado;
              Swal.fire('Guardado', 'Datos actualizados', 'success');
            },
            error: () => Swal.fire('Error', 'Falló la edición', 'error'),
          });
      }
    });
  }
}
