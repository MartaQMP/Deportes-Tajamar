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

  //Mostrar fechas con formato
  const fechaEvento = this.eventos.map(e => {

  const fechaObj = new Date(e.fechaEvento);
  let fechaFormateada = fechaObj.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'  
  });
  fechaFormateada = fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);
  })

//Llamada al api para recoger los deportes disponibles


  // 1. Llamada a la API
  this._actividades.getActividades().subscribe(response => {

    // --- TODO ESTO SE EJECUTA SOLO CUANDO LLEGAN LOS DATOS ---

    // 2. Creamos el HTML de las opciones usando la 'response' directa
    const actividadesHTML = response.map((a: { idActividad: any; nombre: any; }) => 
      `<option value="${a.idActividad}">${a.nombre}</option>`
    ).join('');

    // (Asumo que 'fechaEvento' ya lo tienes calculado de antes, si no, calcúlalo aquí también)
    // const fechaEvento = ... 

    // 3. Lanzamos el SweetAlert AQUÍ DENTRO
    Swal.fire({
      title: 'Crear evento',
      html: `
        <div style="text-align: left; margin-bottom: 5px; color: #555;">Evento:</div>
        <select id="swal-fecha" class="input-date-discreto" style="margin: 0 0 15px 0 !important;">
          ${fechaEvento} 
        </select>

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
        // Recuperamos los valores por sus IDs únicos
        return {
          idEvento: (document.getElementById('swal-fecha') as HTMLSelectElement).value,
          idActividad: (document.getElementById('swal-deporte') as HTMLSelectElement).value
        };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        console.log('Datos seleccionados:', result.value);
        // Aquí llamas a la función para guardar en BBDD
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
        popup: 'swal-popup-discreto',       // Fondo y bordes del modal
        confirmButton: 'btn-confirm-discreto', // Botón confirmar
        cancelButton: 'btn-cancel-discreto',   // Botón cancelar
        input: 'input-date-discreto',          // El input de fecha
        title: 'swal-title-discreto'           // Título (opcional)
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
}