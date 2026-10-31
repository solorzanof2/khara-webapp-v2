import { Component, OnInit } from '@angular/core';
import { MegaMenuItem } from 'primeng/api';


@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss'],
  standalone: false,
})
export class ConfigComponent implements OnInit {

  items: MegaMenuItem[] = [
    {
      label: 'Datos Básicos',
      icon: 'fas fa-handshake',
      routerLink: '/admin/licitacion-primaria',
    },
    {
      label: 'Datos de Usuario',
      icon: 'fas fa-plus',
      routerLink: '/admin/licitacion-primaria/nueva-licitacion-primaria',
    },
  ];

  constructor() { }

  ngOnInit(): void { }

}

