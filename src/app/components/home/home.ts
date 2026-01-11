import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { 
  CalendarEvent, 
  CalendarView, 
  CalendarModule // <--- Solo deja este, borra los tachados
} from 'angular-calendar';
import { startOfDay, endOfDay } from 'date-fns';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,   // Necesario para el ngSwitch del HTML
    CalendarModule  // Este trae los componentes <mwl-calendar-month-view>, etc.
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  // ... (El resto de tu código se queda igual)
  public nombre: string = "Alberto";
  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();

  events: CalendarEvent[] = [{
    start: startOfDay(new Date()),
    end: endOfDay(new Date()),
    title: 'Evento importante',
    color: { primary: "#ad2121", secondary: "#FAE3E3" },
    draggable: false,
    resizable: { beforeStart: false, afterEnd: false }
  }];

  setView(view: CalendarView) {
    this.view = view;
  }

  handleEvent(action: string, event: CalendarEvent): void {
    console.log(action, event);
  }
}