import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Input() isCollapsed = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  submenuStates = {
    services: false,
    financial: false,
    reports: false
  };

  private lastToggleTime = 0;
  private debounceTime = 200; // 200ms debounce

  toggleCollapse() {
    this.toggleSidebar.emit();
  }

  toggleSubmenu(submenu: keyof typeof this.submenuStates, event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Debounce para evitar cliques múltiplos
    const now = Date.now();
    if (now - this.lastToggleTime < this.debounceTime) {
      return;
    }
    this.lastToggleTime = now;

    // Fechar outros submenus (comportamento accordion)
    Object.keys(this.submenuStates).forEach(key => {
      if (key !== submenu) {
        this.submenuStates[key as keyof typeof this.submenuStates] = false;
      }
    });

    // Toggle do submenu atual
    this.submenuStates[submenu] = !this.submenuStates[submenu];
  }
}
