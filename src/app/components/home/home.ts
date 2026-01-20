import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  CalendarEvent,
  CalendarView,
  CalendarModule
} from 'angular-calendar';
import { startOfDay, endOfDay } from 'date-fns';
import PerfilService from '../../services/perfil.service';
import { Router, RouterModule } from '@angular/router';
import usuarioLogeado from '../../models/usuarioLogeado';
import { EventosService } from '../../services/eventos.service';
import Evento from '../../models/evento';
import { Subject, map } from 'rxjs'; 
import ActividadEvento from '../../models/actividades';
import { ActividadesService } from '../../services/actividades.service';
import { InscripcionService } from '../../services/inscripcion.service';
import Inscripciones from '../../models/inscripciones';
import { FormsModule } from '@angular/forms';
import UsuarioActividad from '../../models/usuarioActividad';
import Swal from 'sweetalert2';
import Actividad from '../../models/actividad';
import PrecioActividad from '../../models/precioActividad';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CalendarModule,
    RouterModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {

  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  
  refresh: Subject<void> = new Subject<void>(); 

  events: CalendarEvent[] = []; 

  public usuario!: usuarioLogeado;
  public usuarioLogeado: boolean = false;
  public eventos: Evento[] = [];
  public actividades: ActividadEvento[]=[];
  public personasInscritas: number[]=[];
  public contador: number=0;
  public capitan:boolean=false;
  public idEventoSeleccionado!:number;
  public validarBoton:boolean=true;
  public eventoSeleccionado:boolean = false;
  public usuarioActividades:UsuarioActividad[]=[];
  public actividadesGet:Actividad[]=[]
  public precioActividad: PrecioActividad[]=[];
  public precioTotalActividad!:PrecioActividad | undefined;

  constructor(
    private _perfil: PerfilService, 
    private _eventos: EventosService, 
    private _actividades: ActividadesService,
    private _router: Router,
    private _inscripciones: InscripcionService
  ) { }

  setView(view: CalendarView) {
    this.view = view;
  }

  handleEvent(action: string, event: CalendarEvent): void {
    console.log(action, event);
  }

  ngOnInit(): void {

    //Login con el token para recoger el nombre de usuario

    const token = localStorage.getItem("token");

    if (!token) {
      this._router.navigate(['/login']);
      return; 
    }

    this._perfil.getDatosUsuario(token).subscribe((response) => {
      this.usuarioLogeado = true;
      this.usuario = response;
    });

    //Llamada al api eventos para recoger los eventos abiertos e incluirlos en el calendario

    this._eventos.buscarEventosAbiertos().subscribe({
      next: (response) => {
        this.eventos = response;

        const nuevosEventos: CalendarEvent[] = this.eventos.map(eventoApi => {
          return {
            start: new Date(eventoApi.fechaEvento),
            title: 'Evento #'+eventoApi.idEvento, 
            color: { primary: '#ad2121', secondary: '#FAE3E3' },
            meta: eventoApi 
          };
        });

        this.events = nuevosEventos;

        this.refresh.next(); 

       
      },
      error: (err) => {
        console.error("Error cargando eventos", err);
      }
    });

    
  }
  
  //Llamada al api Actividades por evento para recoger las actividades disponibles por cada evento
  MostrarActividades(e:Evento){
    console.log(e);
    this.eventoSeleccionado=true;
    this.idEventoSeleccionado = e.idEvento;
    this._actividades.buscarActividadesPorEventos(e.idEvento.toString()).subscribe((response)=>{
      this.actividades = response;
      //Ver las inscripciones a esa actividad en ese evento
      this.actividades.forEach((a, index) =>{
        this._inscripciones.verInscripciones(e.idEvento, a.idActividad).subscribe(response=>{
          this.personasInscritas[index] = response.length;
        })
        this.personasInscritas.reverse()
      })
      
      //ver si el usuario esta inscrito ya en alguna actividad de ese evento
      this.verInscripciones()
      this.verPrecioActividad()

    })
  }
  verInscripciones(){
    this._actividades.verUsuarioApuntado().subscribe(response=>{
      this.usuarioActividades=response;
      console.log(this.usuarioActividades)
    })
  } 

  yaEstaInscrito(idEvento: number): boolean {
  
    return this.usuarioActividades.some(actividad => actividad.idEvento === idEvento);
  }


  abrirModalActividad() {

//Llamada al api para recoger los deportes disponibles

  this._actividades.getActividades().subscribe(response => {
    const actividadesHTML = response.map((a: { idActividad: any; nombre: any; }) => 
      `<option value="${a.idActividad}">${a.nombre}</option>`
    ).join('');

    Swal.fire({
      title: 'Añadir a Evento #'+this.idEventoSeleccionado,
      html: `
        <div style="text-align: left; margin-bottom: 5px; color: #555;">Deporte:</div>
        <select id="swal-deporte" class="input-date-discreto" style="margin: 0 !important;">
          <option value="" disabled selected>Selecciona una actividad...</option>
          ${actividadesHTML}
        </select>
        
      `,
      showCancelButton: true,
      confirmButtonText: 'Crear',
      cancelButtonText: 'Cancelar',
      buttonsStyling: false,
      customClass: {
        popup: 'swal-popup-discreto',
        confirmButton: 'btn-confirm-discreto',
        cancelButton: 'btn-cancel-discreto',
        title: 'swal-title-discreto'
      },
      preConfirm: () => {
        return {
          idActividad: (document.getElementById('swal-deporte') as HTMLSelectElement).value
        };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        console.log('Datos seleccionados:', result.value);
        this._eventos.crearActividad(this.idEventoSeleccionado, result.value.idActividad).subscribe(response=>{
          console.log(response);
          
        }, error =>{
          Swal.fire('Error', 'No se inserto la actividad', 'error');
        });
      }
    });

  }, error => {
    console.error('Error al cargar actividades', error);
    Swal.fire('Error', 'No se pudieron cargar las actividades', 'error');
  });

}
    



  abrirModalFecha() {
  Swal.fire({
    title: 'Crear evento',
    text: 'Selecciona la fecha del evento:',
    input: 'date', 
    inputAttributes: {
      autocapitalize: 'off'
    },
    showCancelButton: true,
    confirmButtonText: 'Crear',
    cancelButtonText: 'Cancelar',
    customClass: {
        popup: 'swal-popup-discreto',      
        confirmButton: 'btn-confirm-discreto', 
        cancelButton: 'btn-cancel-discreto',   
        input: 'input-date-discreto',       
        title: 'swal-title-discreto'          
      }
  }).then((result) => {

if(result.isConfirmed)
    this._eventos.crearEvento(result.value).subscribe({
      next: response =>{
        const fechaSeleccionada = result.value;
        if (fechaSeleccionada) {
          console.log('Fecha seleccionada:', fechaSeleccionada);
          Swal.fire('¡Listo!', `Evento creado para el ${fechaSeleccionada}`, 'success');
        }
      },
      error : (error)=>{
          Swal.fire('Error', 'Debes seleccionar una fecha', 'error');
      }
    })
    
  });
}

    Inscribirse(e:ActividadEvento){
      this._inscripciones.inscribirActividadEvento(this.usuario.idUsuario, e.idEventoActividad, this.capitan).subscribe(
        (response=>{
          console.log(response);
          this.verInscripciones();
          this.actividades.forEach((a, index) =>{
          this._inscripciones.verInscripciones(e.idEvento, a.idActividad).subscribe(response=>{
            this.personasInscritas[index] = response.length;
          })
          this.personasInscritas.reverse()
        })
        })
      )
    }



    anadirPrecio(a:ActividadEvento) {
    Swal.fire({
      title: 'Añadir Precio',
      html: `
        <div style="text-align: left; margin-bottom: 5px; color: #555;">
          Indica el coste de la actividad:
        </div>
        
        <input 
          id="swal-input-precio" 
          type="number" 
          class="input-date-discreto"
          placeholder="0.00" 
          min="0" 
          step="0.01" 
          style="margin: 0 !important; width: 100%; box-sizing: border-box;"
        >
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar Precio',
      cancelButtonText: 'Cancelar',
      buttonsStyling: false,
      customClass: {
        popup: 'swal-popup-discreto',
        confirmButton: 'btn-confirm-discreto',
        cancelButton: 'btn-cancel-discreto',
        title: 'swal-title-discreto'
      },
      didOpen: () => {
        // Opcional: Pone el foco en el input automáticamente al abrir
        const input = Swal.getPopup()?.querySelector('#swal-input-precio') as HTMLInputElement;
        if(input) input.focus();
      },
    preConfirm: () => {
      const precioInput = document.getElementById('swal-input-precio') as HTMLInputElement;
      const precioValor = precioInput.value;

      if (!precioValor) {
        Swal.showValidationMessage('Por favor, escribe un precio válido');
        return false;
      }
      return parseFloat(precioValor);
    }
    }).then((result) => {
      if (result.isConfirmed) {
        const precioFinal = result.value;
        console.log('Precio guardado:', precioFinal);
        
       this._actividades.insertarPrecioActividad(a.idEventoActividad, precioFinal).subscribe(response =>{
        console.log(response);
       }, error =>{
           Swal.fire('Error', 'No se ha podido insertar el precio', 'error');
       })
      }
    });
  }

  verPrecioActividad(){
    console.log(this.actividades)
    this._actividades.getPrecioActividadPorEvento().subscribe(response=>{
      this.precioActividad = response
      .filter((precio: { idEventoActividad: number; }) => {
        return this.actividades.some(act => act.idEventoActividad === precio.idEventoActividad);
      }).map((precio: { idEventoActividad: number; }) => {
        this.actividades.find(
          act => act.idEventoActividad === precio.idEventoActividad
        );

        return {
          ...precio,             // Datos del precio
        };
      });

    console.log('Listado filtrado y combinado:', this.precioActividad);
  });
  }

  obtenerPrecioActividad(idEventoActividad: number): number {
  
  const encontrado = this.precioActividad.find(p => p.idEventoActividad === idEventoActividad);
  this.precioTotalActividad = encontrado || undefined;
  return encontrado ? encontrado.precioTotal : 0;
}

  eliminarActividadEvento(a:ActividadEvento){
    
    
    // this._actividades.deleteActividadEvento(a.idEventoActividad).subscribe(response=>{
    //   console.log(response);
    // })
  }
}