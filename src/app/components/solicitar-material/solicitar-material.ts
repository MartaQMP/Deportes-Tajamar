import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, Params } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import Material from '../../models/material';
import MaterialesService from '../../services/materiales.service';
import PerfilService from '../../services/perfil.service';
import { ActividadesService } from '../../services/actividades.service';
import Swal from "sweetalert2";
import ActividadEvento from '../../models/actividades';


@Component({
  selector: 'app-solicitar-material',
  imports: [CommonModule],
  templateUrl: './solicitar-material.html',
  styleUrl: './solicitar-material.css',
  providers: [MaterialesService, PerfilService, ActividadesService]
})
export class SolicitarMaterial implements OnInit {

  public idEvento!: number;
  public actividadesEvento!: Array<ActividadEvento>;
  public materialesActividad!: Array<Material>;
  
  // Control de acordeones expandidos
  public actividadesExpandidas: { [key: number]: boolean } = {};

  constructor(
    private _service: MaterialesService,
    private _activateRoute: ActivatedRoute,
    private _perfilService: PerfilService,
    private _actividadesService: ActividadesService,
    private _router: Router
  ) { }

  ngOnInit(): void {
    this._activateRoute.params.subscribe((params: Params) => {
      this.idEvento = params["idEvento"];
    })

    this._actividadesService.buscarActividadesPorEventos(this.idEvento.toString()).subscribe((response)=>{
      this.actividadesEvento = response;
      // Inicializa el mapa de acordeones con el id de cada actividad
      this.actividadesExpandidas = {};
      this.actividadesEvento?.forEach(actividad => {
        this.actividadesExpandidas[actividad.idEventoActividad] = false;
      });
      // Carga materiales por actividad utilizando idEvento + idActividad
      this.cargarMaterialesDeActividades();
    })
  }

  // UTILIDADES: 
  // Toggle para expandir/contraer actividad
  toggleActividad(idEventoActividad: number): void {
    this.actividadesExpandidas[idEventoActividad] = !this.actividadesExpandidas[idEventoActividad];
  }

  // Obtener materiales filtrados por idEventoActividad
  getMaterialesPorActividad(idEventoActividad: number): Array<Material> {
    if (!this.materialesActividad) return [];
    return this.materialesActividad.filter(m => m.idEventoActividad === idEventoActividad);
  }

  // Contar materiales por actividad
  contarMaterialesPorActividad(idEventoActividad: number): number {
    return this.getMaterialesPorActividad(idEventoActividad).length;
  }

  // Contar pendientes por actividad
  contarPendientesPorActividad(idEventoActividad: number): number {
    return this.getMaterialesPorActividad(idEventoActividad).filter(m => m.pendiente).length;
  }

  // Contar materiales pendientes (total)
  contarPendientes(): number {
    if (!this.materialesActividad) return 0;
    return this.materialesActividad.filter(m => m.pendiente).length;
  }
  // Contar materiales completados (total)
  contarCompletados(): number {
    if (!this.materialesActividad) return 0;
    return this.materialesActividad.filter(m => !m.pendiente).length;
  }

  private cargarMaterialesDeActividades(): void {
    if (!this.actividadesEvento || this.actividadesEvento.length === 0) return;
    this.materialesActividad = [];

    this.actividadesEvento.forEach(actividad => {
      this._service.getidEventoActividad(this.idEvento, actividad.idActividad).subscribe((idEventoActividadResponse) => {
        const idEventoActividad = idEventoActividadResponse.idEventoActividad;

        this._service.getMaterialesActividad(idEventoActividad).subscribe((materiales) => {
          this.materialesActividad = [...this.materialesActividad, ...materiales];
        });
      });
    });
  }

  // Mostrar formulario para solicitar material
  solicitarMaterial(): void {
    const fechaActual = new Date().toISOString().split('T')[0];

    Swal.fire({
      title: '<span class="swal-title"><i class="bi bi-plus-circle-fill"></i> Solicitar Material</span>',
      html: `
      <div class="swal-form-container">
        <div class="swal-form-row">
          <div class="swal-form-group">
            <label for="actividadSelect" class="swal-label">
              <i class="bi bi-dribbble"></i> Actividad
            </label>
            <select id="actividadSelect" class="swal-input-custom">
              <option value="">Seleccione una actividad...</option>
              ${this.actividadesEvento?.map(a => `<option value="${a.idActividad}">${a.nombreActividad}</option>`).join('') || ''}
            </select>
          </div>
          
          <div class="swal-form-group">
            <label for="fechaSolicitud" class="swal-label">
              <i class="bi bi-calendar3"></i> Fecha de Solicitud
            </label>
            <input id="fechaSolicitud" class="swal-input-custom" type="date" value="${fechaActual}" disabled>
          </div>
        </div>
        
        <div class="swal-form-group">
          <label for="nombreMaterial" class="swal-label">
            <i class="bi bi-box-seam"></i> Nombre del Material
          </label>
          <input id="nombreMaterial" class="swal-input-custom" type="text" placeholder="Debe indicar un nombre">
        </div>
        
        <div class="swal-info-box">
          <span>El material será marcado como <strong>pendiente</strong> hasta que sea aportado.</span>
        </div>
        
        <div id="errorMensajeSolicitar" class="swal-info-box-delete" style="display: none; margin-top: 1rem;">
          <span><strong>Error:</strong> <span id="errorTexto">Debe completar todos los campos.</span></span>
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: '<i class="bi bi-check-circle"></i> Solicitar',
      cancelButtonText: '<i class="bi bi-x-circle"></i> Cancelar',
      preConfirm: () => {
        const actividadId = (document.getElementById('actividadSelect') as HTMLSelectElement).value;
        const nombreMaterial = (document.getElementById('nombreMaterial') as HTMLInputElement).value.trim();
        const errorDiv = document.getElementById('errorMensajeSolicitar');
        const errorTexto = document.getElementById('errorTexto');
        
        if (!actividadId || actividadId === '') {
          if (errorTexto) errorTexto.textContent = 'Debe seleccionar una actividad.';
          if (errorDiv) errorDiv.style.display = 'flex';
          return false;
        }
        
        if (nombreMaterial.length === 0) {
          if (errorTexto) errorTexto.textContent = 'Debe indicar un nombre para el material.';
          if (errorDiv) errorDiv.style.display = 'flex';
          return false;
        }
        
        if (errorDiv) errorDiv.style.display = 'none';
        return true;
      },
      customClass: {
        popup: 'swal-material-popup',
        title: 'swal-material-title',
        htmlContainer: 'swal-material-html',
        confirmButton: 'swal-material-confirm',
        cancelButton: 'swal-material-cancel'
      },
      buttonsStyling: false,
      focusConfirm: false,
      didOpen: () => {
        const inputNombre = document.getElementById('nombreMaterial') as HTMLInputElement;
        const selectActividad = document.getElementById('actividadSelect') as HTMLSelectElement;
        const errorDiv = document.getElementById('errorMensajeSolicitar');
        
        // Ocultar error al escribir en el input
        inputNombre?.addEventListener('input', () => {
          if (errorDiv && errorDiv.style.display !== 'none') {
            errorDiv.style.display = 'none';
          }
        });
        
        // Ocultar error al seleccionar actividad
        selectActividad?.addEventListener('change', () => {
          if (errorDiv && errorDiv.style.display !== 'none') {
            errorDiv.style.display = 'none';
          }
        });
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const actividadId = (document.getElementById('actividadSelect') as HTMLSelectElement).value;
        const nombreMaterial = (document.getElementById('nombreMaterial') as HTMLInputElement).value.trim();
        const token = localStorage.getItem("token");

        if (token != null) {
          this._perfilService.getDatosUsuario(token).subscribe((usuario) => {
            // Primero obtener el idEventoActividad usando el servicio
            this._service.getidEventoActividad(this.idEvento, parseInt(actividadId)).subscribe((response) => {
              const idEventoActividad = response.idEventoActividad;
              
              const nuevoMaterial = new Material(
                0,
                idEventoActividad,
                usuario.idUsuario,
                nombreMaterial,
                true,
                new Date(),
                0
              );

              this._service.crearMaterial(nuevoMaterial).subscribe((result) => {
                this.cargarMaterialesDeActividades();
              });
            });
          });
        }
      }
    });
  }

  ActualizarMaterial(){
    const fechaActual = new Date().toISOString().split('T')[0];

    Swal.fire({
      title: '<span class="swal-title-update"><i class="bi bi-hand-thumbs-up-fill"></i> Gestiona Tu Material</span>',
      html: `
      <div class="swal-form-container">
        <div class="swal-form-row">
          <div class="swal-form-group">
            <label for="actividadSelectUpdate" class="swal-label">
              <i class="bi bi-dribbble"></i> Actividad
            </label>
            <select id="actividadSelectUpdate" class="swal-input-custom">
              <option value="">Seleccione una actividad...</option>
              ${this.actividadesEvento?.map(a => `<option value="${a.idEventoActividad}">${a.nombreActividad}</option>`).join('') || ''}
            </select>
          </div>
          
          <div class="swal-form-group">
            <label for="materialSelect" class="swal-label">
              <i class="bi bi-box-seam"></i> Material a Gestionar
            </label>
            <select id="materialSelect" class="swal-input-custom" disabled>
              <option value="">Primero seleccione una actividad...</option>
            </select>
          </div>
        </div>
        
        <div class="swal-form-group">
          <label for="estadoMaterial" class="swal-label">
            <i class="bi bi-toggle-on"></i> Estado del Material
          </label>
          <select id="estadoMaterial" class="swal-input-custom">
            <option value="pendiente">Pendiente</option>
            <option value="recibido">Aportar</option>
          </select>
        </div>
        
        <div class="swal-info-box-update">
          <span>Actualiza el estado del material para reflejar si ya ha sido <strong>recibido</strong> o sigue <strong>pendiente</strong>.</span>
        </div>
        
        <div id="errorMensajeAportar" class="swal-info-box-delete" style="display: none; margin-top: 1rem;">
          <span><strong>Error:</strong> <span id="errorTextoAportar">Debe completar todos los campos.</span></span>
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: '<i class="bi bi-check-circle"></i> Gestionar',
      cancelButtonText: '<i class="bi bi-x-circle"></i> Cancelar',
      preConfirm: () => {
        const actividadId = (document.getElementById('actividadSelectUpdate') as HTMLSelectElement).value;
        const materialId = (document.getElementById('materialSelect') as HTMLSelectElement).value;
        const errorDiv = document.getElementById('errorMensajeAportar');
        const errorTexto = document.getElementById('errorTextoAportar');
        
        if (!actividadId || actividadId === '') {
          if (errorTexto) errorTexto.textContent = 'Debe seleccionar una actividad.';
          if (errorDiv) errorDiv.style.display = 'flex';
          return false;
        }
        
        if (!materialId || materialId === '') {
          if (errorTexto) errorTexto.textContent = 'Debe seleccionar un material.';
          if (errorDiv) errorDiv.style.display = 'flex';
          return false;
        }
        
        if (errorDiv) errorDiv.style.display = 'none';
        return true;
      },
      customClass: {
        popup: 'swal-update-popup',
        title: 'swal-update-title',
        htmlContainer: 'swal-update-html',
        confirmButton: 'swal-update-confirm',
        cancelButton: 'swal-update-cancel'
      },
      buttonsStyling: false,
      focusConfirm: false,
      didOpen: () => {
        const actividadSelect = document.getElementById('actividadSelectUpdate') as HTMLSelectElement;
        const materialSelect = document.getElementById('materialSelect') as HTMLSelectElement;
        const errorDiv = document.getElementById('errorMensajeAportar');
        
        // Cuando se selecciona una actividad, cargar sus materiales
        actividadSelect?.addEventListener('change', () => {
          if (errorDiv && errorDiv.style.display !== 'none') {
            errorDiv.style.display = 'none';
          }
          
          const idEventoActividad = parseInt(actividadSelect.value);
          
          if (idEventoActividad) {
            // Filtrar materiales por actividad
            const materialesFiltrados = this.getMaterialesPorActividad(idEventoActividad);
            
            materialSelect.disabled = false;
            materialSelect.innerHTML = '<option value="">Seleccione un material...</option>';
            
            if (materialesFiltrados.length > 0) {
              materialesFiltrados.forEach(m => {
                const option = document.createElement('option');
                option.value = m.idMaterial.toString();
                option.textContent = `${m.nombreMaterial} ${m.pendiente ? '(Pendiente)' : '(Recibido)'}`;
                materialSelect.appendChild(option);
              });
            } else {
              materialSelect.innerHTML = '<option value="">No hay materiales en esta actividad</option>';
            }
          } else {
            materialSelect.disabled = true;
            materialSelect.innerHTML = '<option value="">Primero seleccione una actividad...</option>';
          }
        });
        
        materialSelect?.addEventListener('change', () => {
          if (errorDiv && errorDiv.style.display !== 'none') {
            errorDiv.style.display = 'none';
          }
        });
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const materialId = (document.getElementById('materialSelect') as HTMLSelectElement).value;
        const estadoMaterial = (document.getElementById('estadoMaterial') as HTMLSelectElement).value;
        const token = localStorage.getItem("token");
      
        const materialSeleccionado = this.materialesActividad.find(m => m.idMaterial === parseInt(materialId));
        
        if (token && materialSeleccionado) {
          this._perfilService.getDatosUsuario(token).subscribe((usuario) => {
            const esPendiente = estadoMaterial === 'pendiente';
            
            const materialActualizado = new Material(
              materialSeleccionado.idMaterial,
              materialSeleccionado.idEventoActividad,
              materialSeleccionado.idUsuario,
              materialSeleccionado.nombreMaterial,
              esPendiente,
              new Date(),
              esPendiente ? 0 : usuario.idUsuario
            );
            
            this._service.actualizarMaterial(materialActualizado).subscribe((response) => {
              // Recargar la lista de materiales
              this.cargarMaterialesDeActividades();
            });
          });
        }
      }
    });
  }

  EliminarMaterial(){
    Swal.fire({
      title: '<span class="swal-title-delete"><i class="bi bi-trash3-fill"></i> Eliminar Material</span>',
      html: `
      <div class="swal-form-container">
        <div class="swal-form-row">
          <div class="swal-form-group">
            <label for="actividadSelectDelete" class="swal-label">
              <i class="bi bi-dribbble"></i> Actividad
            </label>
            <select id="actividadSelectDelete" class="swal-input-custom">
              <option value="">Seleccione una actividad...</option>
              ${this.actividadesEvento?.map(a => `<option value="${a.idEventoActividad}">${a.nombreActividad}</option>`).join('') || ''}
            </select>
          </div>
          
          <div class="swal-form-group">
            <label for="materialDeleteSelect" class="swal-label">
              <i class="bi bi-box-seam"></i> Material a Eliminar
            </label>
            <select id="materialDeleteSelect" class="swal-input-custom" disabled>
              <option value="">Primero seleccione una actividad...</option>
            </select>
          </div>
        </div>
        
        <div class="swal-info-box-delete">
          <span>Esta acción es <strong>irreversible</strong>. El material será eliminado permanentemente.</span>
        </div>
        
        <div id="errorMensajeEliminar" class="swal-info-box-delete" style="display: none; margin-top: 1rem; background: rgba(220, 53, 69, 0.12); border-color: rgba(220, 53, 69, 0.3);">
          <span><strong>Error:</strong> <span id="errorTextoEliminar">Debe completar todos los campos.</span></span>
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: '<i class="bi bi-trash3"></i> Eliminar',
      cancelButtonText: '<i class="bi bi-x-circle"></i> Cancelar',
      preConfirm: () => {
        const actividadId = (document.getElementById('actividadSelectDelete') as HTMLSelectElement).value;
        const materialId = (document.getElementById('materialDeleteSelect') as HTMLSelectElement).value;
        const errorDiv = document.getElementById('errorMensajeEliminar');
        const errorTexto = document.getElementById('errorTextoEliminar');
        
        if (!actividadId || actividadId === '') {
          if (errorTexto) errorTexto.textContent = 'Debe seleccionar una actividad.';
          if (errorDiv) errorDiv.style.display = 'flex';
          return false;
        }
        
        if (!materialId || materialId === '') {
          if (errorTexto) errorTexto.textContent = 'Debe seleccionar un material.';
          if (errorDiv) errorDiv.style.display = 'flex';
          return false;
        }
        
        if (errorDiv) errorDiv.style.display = 'none';
        return true;
      },
      customClass: {
        popup: 'swal-delete-popup',
        title: 'swal-delete-title',
        htmlContainer: 'swal-delete-html',
        confirmButton: 'swal-delete-confirm',
        cancelButton: 'swal-delete-cancel'
      },
      buttonsStyling: false,
      focusConfirm: false,
      didOpen: () => {
        const actividadSelect = document.getElementById('actividadSelectDelete') as HTMLSelectElement;
        const materialSelect = document.getElementById('materialDeleteSelect') as HTMLSelectElement;
        const errorDiv = document.getElementById('errorMensajeEliminar');
        
        // Cuando se selecciona una actividad, cargar sus materiales
        actividadSelect?.addEventListener('change', () => {
          if (errorDiv && errorDiv.style.display !== 'none') {
            errorDiv.style.display = 'none';
          }
          
          const idEventoActividad = parseInt(actividadSelect.value);
          
          if (idEventoActividad) {
            // Filtrar materiales por actividad
            const materialesFiltrados = this.getMaterialesPorActividad(idEventoActividad);
            
            materialSelect.disabled = false;
            materialSelect.innerHTML = '<option value="">Seleccione un material...</option>';
            
            if (materialesFiltrados.length > 0) {
              materialesFiltrados.forEach(m => {
                const option = document.createElement('option');
                option.value = m.idMaterial.toString();
                option.textContent = m.nombreMaterial;
                materialSelect.appendChild(option);
              });
            } else {
              materialSelect.innerHTML = '<option value="">No hay materiales en esta actividad</option>';
            }
          } else {
            materialSelect.disabled = true;
            materialSelect.innerHTML = '<option value="">Primero seleccione una actividad...</option>';
          }
        });
        
        materialSelect?.addEventListener('change', () => {
          if (errorDiv && errorDiv.style.display !== 'none') {
            errorDiv.style.display = 'none';
          }
        });
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const materialId = (document.getElementById('materialDeleteSelect') as HTMLSelectElement).value;
        const materialSeleccionado = this.materialesActividad.find(m => m.idMaterial === parseInt(materialId));
        
        if (materialSeleccionado) {
          this._service.eliminarMaterial(materialSeleccionado.idMaterial).subscribe(() => {
            this.cargarMaterialesDeActividades();
          });
        }
      }
    });
  }

}
