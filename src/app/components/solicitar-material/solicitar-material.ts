import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, Params } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import Material from '../../models/material';
import MaterialesService from '../../services/materiales.service';
import PerfilService from '../../services/perfil.service';
import Swal from "sweetalert2";


@Component({
  selector: 'app-solicitar-material',
  imports: [CommonModule],
  templateUrl: './solicitar-material.html',
  styleUrl: './solicitar-material.css',
  providers: [MaterialesService, PerfilService]
})
export class SolicitarMaterial implements OnInit {

  public idEvento!: number;
  public materialesEvento!: Array<Material>;

constructor(
  private _service: MaterialesService, 
  private _activateRoute: ActivatedRoute,
  private _perfilService: PerfilService
){}

ngOnInit(): void {
  this._activateRoute.params.subscribe((params: Params)=>{
      this.idEvento = params["idEvento"];
  })

  this._service.getMaterialesActividad(this.idEvento).subscribe((response)=>{
    this.materialesEvento = response;
    console.log(this.materialesEvento);
  })

}


// UTILIDADES: 
// Contar materiales pendientes
contarPendientes(): number {
  if (!this.materialesEvento) return 0;
  return this.materialesEvento.filter(m => m.pendiente).length;
}
// Contar materiales completados
contarCompletados(): number {
  if (!this.materialesEvento) return 0;
  return this.materialesEvento.filter(m => !m.pendiente).length;
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
            <label for="nombreMaterial" class="swal-label">
              <i class="bi bi-box-seam"></i> Nombre del Material
            </label>
            <input id="nombreMaterial" class="swal-input-custom" type="text" placeholder="Ej: Balones de fútbol, Conos, Redes...">
          </div>
          
          <div class="swal-form-group">
            <label for="fechaSolicitud" class="swal-label">
              <i class="bi bi-calendar3"></i> Fecha de Solicitud
            </label>
            <input id="fechaSolicitud" class="swal-input-custom" type="date" value="${fechaActual}" disabled>
          </div>
        </div>
        
        <div class="swal-info-box">
          <i class="bi bi-info-circle"></i>
          <span>El material será marcado como <strong>pendiente</strong> hasta que sea aportado.</span>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: '<i class="bi bi-check-circle"></i> Solicitar',
    cancelButtonText: '<i class="bi bi-x-circle"></i> Cancelar',
    customClass: {
      popup: 'swal-material-popup',
      title: 'swal-material-title',
      htmlContainer: 'swal-material-html',
      confirmButton: 'swal-material-confirm',
      cancelButton: 'swal-material-cancel'
    },
    buttonsStyling: false,
    focusConfirm: false,
    preConfirm: () => {
      const nombreMaterial = (document.getElementById('nombreMaterial') as HTMLInputElement).value.trim();      
      if (!nombreMaterial) {
        Swal.showValidationMessage('<i class="bi bi-exclamation-triangle"></i> Por favor, ingrese el nombre del material');
        return false;
      }
      return {
        nombreMaterial: nombreMaterial
      };
    }
  }).then((result) => {
    if (result.isConfirmed) {
      // Obtener token del localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        Swal.fire({
          icon: 'error',
          title: 'Error de autenticación',
          html: '<p>No se encontró el token de sesión. Por favor, inicie sesión nuevamente.</p>',
          confirmButtonText: 'Entendido',
          customClass: {
            popup: 'swal-material-popup',
            confirmButton: 'swal-material-confirm'
          },
          buttonsStyling: false
        });
        return;
      }
      
      // Obtener datos del usuario para crear el material
      this._perfilService.getDatosUsuario(token).subscribe({
        next: (usuario) => {
          // Crear el objeto Material
          const nuevoMaterial = new Material(
            0, // idMaterial: autoincremental en el backend
            this.idEvento, // idEventoActividad: del componente
            usuario.idUsuario, // idUsuario: del perfil
            result.value.nombreMaterial, // nombreMaterial: del formulario
            true, // pendiente: siempre true al crear
            new Date(), // fechaSolicitud: fecha actual
            usuario.idUsuario // idUsuarioAportacion: mismo usuario que solicita
          );
          
          console.log('Material creado:', nuevoMaterial);
          
          // Mostrar confirmación
          Swal.fire({
            icon: 'success',
            title: '¡Material Solicitado!',
            html: `<p>El material <strong>${result.value.nombreMaterial}</strong> ha sido agregado correctamente.</p>`,
            confirmButtonText: 'Entendido',
            customClass: {
              popup: 'swal-material-popup',
              confirmButton: 'swal-material-confirm'
            },
            buttonsStyling: false
          });
        },
        error: (error) => {
          console.error('Error al obtener datos del usuario:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            html: '<p>No se pudo obtener la información del usuario. Intente nuevamente.</p>',
            confirmButtonText: 'Entendido',
            customClass: {
              popup: 'swal-material-popup',
              confirmButton: 'swal-material-confirm'
            },
            buttonsStyling: false
          });
        }
      });
    }
  });
}

}
