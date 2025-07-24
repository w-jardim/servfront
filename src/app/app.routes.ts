import { Routes } from '@angular/router';
import { HomeComponent } from './home.component/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ServicosComponent } from './servicos.component/servicos.component';
import { OrdinarioComponent } from './servicos.component/ordinario.component/ordinario.component';
import { RasComponent } from './servicos.component/ras.component/ras.component';
import { TrocasComponent } from './servicos.component/trocas.component/trocas.component';
import { CadastroServicosComponent } from './formulario/cadastro-servicos.component/cadastro-servicos.component';
import { VisaoGeralFinanceiraComponent } from './financeiro/visao-geral-financeira/visao-geral-financeira.component';
import { MetasFinanceirasComponent } from './financeiro/metas-financeiras.component/metas-financeiras.component';
import { RasVoluntarioFinanceiroComponent } from './financeiro/ras-voluntario-financeiro.component/ras-voluntario-financeiro.component';
import { RasCompulsorioFinanceiroComponent } from './financeiro/ras-compulsorio-financeiro.component/ras-compulsorio-financeiro.component';
import { OrdinarioFinanceiroComponent } from './financeiro/ordinario-financeiro.component/ordinario-financeiro.component';

export const routes: Routes = [
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'home', component: HomeComponent },
    { path: 'servicos', component: ServicosComponent },
    { path: 'servicos/ordinarios', component: OrdinarioComponent },
    { path: 'servicos/ras', component: RasComponent },
    { path: 'servicos/trocas', component: TrocasComponent },
    { path: 'servicos/cadastrar', component: CadastroServicosComponent },
    { path: 'financeiro', component: VisaoGeralFinanceiraComponent },
    { path: 'financeiro/metas', component: MetasFinanceirasComponent },
    { path: 'financeiro/ras-voluntario', component: RasVoluntarioFinanceiroComponent },
    { path: 'financeiro/ras-compulsorio', component: RasCompulsorioFinanceiroComponent },
    { path: 'financeiro/ordinario', component: OrdinarioFinanceiroComponent },
    { path: '**', redirectTo: '/dashboard' } // Wildcard route para páginas não encontradas
];
