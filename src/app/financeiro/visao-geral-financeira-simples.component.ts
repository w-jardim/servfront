import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-visao-geral-financeira',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h1>Visão Geral Financeira</h1>
      <p>Página em desenvolvimento...</p>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    .main-content {
      display: flex;
      flex: 1;
    }
    .content-area {
      flex: 1;
      padding: 20px;
    }
  `]
})
export class VisaoGeralFinanceiraComponent {
}
