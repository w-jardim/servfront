import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit {
  currentYear: number = new Date().getFullYear();
  systemVersion: string = '1.0.0';
  buildNumber: string = '2025.01.001';
  uptime: string = '99.9%';
  lastUpdate: string = '';

  ngOnInit() {
    this.updateSystemInfo();
  }

  private updateSystemInfo() {
    // Atualizar última sincronização
    const now = new Date();
    this.lastUpdate = now.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
