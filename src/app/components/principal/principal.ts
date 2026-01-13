import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Menu } from '../menu/menu';
import { Home } from '../home/home';

@Component({
  selector: 'app-principal',
  imports: [RouterOutlet, Menu, Home],
  templateUrl: './principal.html',
  styleUrl: './principal.css',
})
export class Principal {}
