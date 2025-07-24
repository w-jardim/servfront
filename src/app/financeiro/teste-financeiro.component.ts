import { Component } from '@angular/core';

@Component({
  selector: 'app-teste-financeiro',
  standalone: true,
  template: `
    <div>
      <h1>Teste Financeiro</h1>
      <p>Este é um componente de teste simples.</p>
    </div>
  `,
  styles: [`
    div {
      padding: 20px;
    }
  `]
})
export class TesteFinanceiroComponent {
}
