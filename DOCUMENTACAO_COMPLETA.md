# ServFront - Sistema de Controle de Serviços PMSC

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura e Tecnologias](#arquitetura-e-tecnologias)
3. [Estrutura do Projeto](#estrutura-do-projeto)
4. [Funcionalidades Principais](#funcionalidades-principais)
5. [Módulos do Sistema](#módulos-do-sistema)
6. [Capturas de Tela](#capturas-de-tela)
7. [Instalação e Configuração](#instalação-e-configuração)
8. [Guia de Uso](#guia-de-uso)
9. [Estrutura de Dados](#estrutura-de-dados)
10. [Configurações do Sistema](#configurações-do-sistema)

---

## 🎯 Visão Geral

O **ServFront** é um sistema web moderno desenvolvido para a **Polícia Militar de Santa Catarina (PMSC)** que oferece controle integrado de serviços policiais e gestão financeira. O sistema permite o gerenciamento eficiente de escalas, serviços extraordinários (RAS), trocas de serviços e acompanhamento financeiro detalhado.

### Objetivos Principais

- **Controle de Serviços**: Gerenciamento de escalas ordinárias, RAS voluntário/compulsório e trocas
- **Gestão Financeira**: Acompanhamento de valores, metas e pagamentos
- **Visualização Integrada**: Dashboard com calendário interativo e resumos executivos
- **Automação**: Preenchimento automático e cálculos baseados em tabelas de valores

---

## 🏗️ Arquitetura e Tecnologias

### Stack Tecnológico

| Categoria | Tecnologia | Versão |
|-----------|------------|--------|
| **Frontend** | Angular | 20.1.0 |
| **Linguagem** | TypeScript | ~5.8.2 |
| **Estilização** | SCSS | - |
| **Build Tool** | Angular CLI | ^20.1.1 |
| **Package Manager** | npm | - |
| **Testes** | Jasmine + Karma | ~5.8.0 / ~6.4.0 |

### Padrões Arquiteturais

- **Standalone Components**: Componentes independentes sem NgModules
- **Reactive Programming**: Uso extensivo de RxJS e Observables
- **Service-Oriented Architecture**: Separação clara de responsabilidades
- **Component-Based Design**: Interface modular e reutilizável

---

## 📁 Estrutura do Projeto

```
servfront/
├── 📁 src/
│   ├── 📁 app/
│   │   ├── 📁 dashboard/                    # Dashboard principal
│   │   ├── 📁 financeiro/                   # Módulo financeiro
│   │   │   ├── 📁 metas-financeiras.component/
│   │   │   ├── 📁 ordinario-financeiro.component/
│   │   │   ├── 📁 ras-compulsorio-financeiro.component/
│   │   │   ├── 📁 ras-voluntario-financeiro.component/
│   │   │   └── 📁 visao-geral-financeira.component/
│   │   ├── 📁 formulario/                   # Formulários de cadastro
│   │   │   ├── 📁 cadastro-ordinario.component/
│   │   │   ├── 📁 cadastro-ras.component/
│   │   │   ├── 📁 cadastro-servicos.component/
│   │   │   └── 📁 cadastro-troca.component/
│   │   ├── 📁 home.component/               # Layout principal
│   │   │   └── 📁 layout/                   # Componentes de layout
│   │   │       ├── 📁 footer.component/
│   │   │       ├── 📁 header.component/
│   │   │       └── 📁 sidebar.component/
│   │   ├── 📁 servicos.component/           # Controle de serviços
│   │   │   ├── 📁 ordinario.component/
│   │   │   ├── 📁 ras.component/
│   │   │   └── 📁 trocas.component/
│   │   └── 📁 shared/                       # Componentes compartilhados
│   │       ├── 📁 cronograma-unificado/
│   │       └── 📁 services/                 # Serviços de dados
│   ├── 📄 index.html
│   ├── 📄 main.ts
│   └── 📄 styles.scss
├── 📄 angular.json                          # Configuração do Angular
├── 📄 package.json                          # Dependências do projeto
├── 📄 tsconfig.json                         # Configuração TypeScript
└── 📄 README.md                             # Documentação básica
```

---

## ⚡ Funcionalidades Principais

### 1. **Dashboard Integrado**
- 📊 Visão geral de todos os serviços
- 📅 Calendário interativo com código de cores
- 👤 Gerenciamento de perfil do usuário
- ⚙️ Configurações de auto-preenchimento
- 💰 Resumo financeiro mensal

### 2. **Controle de Serviços**
- 🕒 **Serviços Ordinários**: Escalas regulares 12x36
- 🚔 **RAS Voluntário**: Regime Adicional Voluntário (R$ 65-85/h)
- ⚠️ **RAS Compulsório**: Regime Adicional Obrigatório (R$ 40-45/h)
- 🔄 **Trocas**: Permutação entre policiais
- ⚡ **Detecção de Conflitos**: Identificação automática de sobreposições

### 3. **Gestão Financeira**
- 💵 Acompanhamento de valores e pagamentos
- 🎯 Sistema de metas pessoais
- 📈 Análise de distribuição por tipo de serviço
- 📋 Relatórios detalhados
- 💳 Status de pagamentos (Pago/Pendente/Processando)

### 4. **Sistema de Configurações**
- 🖊️ Auto-preenchimento de formulários
- 🎨 Personalização visual (cores alternativas)
- 📋 Aplicação automática de tabelas de valores
- 🧮 Cálculos automáticos baseados no posto/graduação

---

## 🎬 Capturas de Tela

### Dashboard Principal
![Dashboard](https://github.com/user-attachments/assets/c64b4c0f-0080-43b7-b629-f55c7194cf5c)

**Características do Dashboard:**
- **Perfil do Usuário**: Gestão completa de dados pessoais e avatar
- **Calendário de Serviços**: Visualização mensal com cores por tipo de serviço
- **Resumo Financeiro**: Cards com totais de RAS, trocas e ordinários
- **Configurações**: Auto-preenchimento e preferências visuais
- **Legenda de Cores**: Identificação visual dos tipos de serviços

### Controle de Serviços
![Controle de Serviços](https://github.com/user-attachments/assets/c0fba5d3-f917-4dae-96cc-609a4503acaf)

**Funcionalidades do Controle:**
- **Estatísticas Gerais**: 24 serviços ativos, 18 ordinários, 4 RAS voluntário, 2 RAS compulsório
- **Acesso Rápido**: Cards para navegação direta aos módulos
- **Indicadores**: Taxa de ocupação (94%), serviços pendentes, disponibilidade
- **Resumo do Mês**: Distribuição percentual por tipo de serviço

### Visão Geral Financeira
![Visão Financeira](https://github.com/user-attachments/assets/c61aeec9-e6b4-4a73-9930-046cf231a78a)

**Componentes Financeiros:**
- **Totais Mensais**: R$ 3.702,00 total, R$ 1.150,00 pagos, R$ 2.012,00 pendentes
- **Distribuição por Tipo**: RAS Compulsório (56.7%), RAS Voluntário (28.9%), Ordinário (14.4%)
- **Metas em Destaque**: Acompanhamento de objetivos pessoais
- **Serviços Recentes**: Tabela detalhada com status de pagamento

---

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js (versão 18+)
- npm ou yarn
- Angular CLI

### Passos de Instalação

1. **Clone o repositório:**
```bash
git clone https://github.com/w-jardim/servfront.git
cd servfront
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Execute o servidor de desenvolvimento:**
```bash
npm start
# ou
ng serve
```

4. **Acesse a aplicação:**
```
http://localhost:4200
```

### Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm start` | Inicia servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm test` | Executa testes unitários |
| `npm run watch` | Build em modo watch |

---

## 📚 Guia de Uso

### 1. **Configuração Inicial**

**Primeiro Acesso:**
1. Configure seu perfil no Dashboard
2. Defina posto/graduação para cálculos automáticos
3. Configure auto-preenchimento conforme preferência
4. Estabeleça salário base (opcional)

**Configurações Recomendadas:**
- ✅ Auto-preenchimento de nome e unidade
- ✅ Aplicação de tabela de valores por posto
- ✅ Cálculos automáticos habilitados

### 2. **Gerenciamento de Serviços**

**Criação de Serviços:**
1. Acesse o módulo específico (Ordinário/RAS/Trocas)
2. Preencha formulários com validação automática
3. Sistema detecta conflitos de horários
4. Valores calculados automaticamente

**Tipos de Serviço:**
- **Ordinário**: Escala regular com salário mensal
- **RAS Voluntário**: R$ 65/h (Batalhão) ou R$ 85/h (Projetos)
- **RAS Compulsório**: R$ 45/h (Padrão) ou R$ 40/h (Troca)
- **Trocas**: Negociação entre policiais

### 3. **Acompanhamento Financeiro**

**Dashboard Financeiro:**
- Visualize totais mensais consolidados
- Acompanhe status de pagamentos
- Monitore progresso de metas pessoais
- Analise distribuição por tipo de serviço

**Gestão de Metas:**
- Defina objetivos financeiros específicos
- Acompanhe progresso automaticamente
- Visualize prazos e valores restantes

---

## 🗃️ Estrutura de Dados

### Interfaces Principais

**Perfil do Usuário:**
```typescript
interface PerfilUsuario {
  id: string;
  nomeCompleto: string;
  nomeEscala?: string;
  posto: string;
  unidade: string;
  salarioBase?: number;
  avatar?: string;
  configuracoes: ConfiguracoesPerfil;
}
```

**Serviço RAS:**
```typescript
interface ServicoRAS {
  id: string;
  tipo: 'voluntario' | 'compulsorio';
  modalidade: 'titular' | 'reserva';
  projeto: 'PMSC' | 'CPROEIS';
  data: string;
  horaInicio: string;
  horaFim: string;
  duracao: number;
  valorHora: number;
  valorTotal: number;
  status: 'agendado' | 'em-andamento' | 'concluido' | 'cancelado';
}
```

**Troca de Serviço:**
```typescript
interface TrocaServico {
  id: string;
  tipo: 'ordinario' | 'ras-compulsorio';
  policialOriginal: string;
  policialSubstituto: string;
  valorAcordado: number;
  status: 'pendente' | 'confirmada' | 'cancelada';
}
```

### Tabelas de Valores

**RAS por Posto/Graduação:**
- **Soldado/Cabo**: R$ 40-65/h
- **Sargento**: R$ 45-70/h  
- **Subtenente**: R$ 50-75/h
- **Oficiais**: R$ 55-85/h

---

## ⚙️ Configurações do Sistema

### Configurações de Auto-preenchimento

| Configuração | Descrição | Padrão |
|--------------|-----------|--------|
| **Auto-preencher Nome** | Preenche automaticamente o nome nos formulários | ✅ Ativo |
| **Auto-preencher Unidade** | Usa unidade do perfil como padrão | ✅ Ativo |
| **Tabela de Valores** | Aplica valores por posto/graduação | ✅ Ativo |
| **Cálculos Automáticos** | Calcula totais e horas automaticamente | ✅ Ativo |

### Configurações Visuais

| Configuração | Descrição | Opções |
|--------------|-----------|--------|
| **Cores Alternativas** | Padrão listrado para múltiplos serviços | Normal/Alternativo |
| **Valor Ordinário** | Exibe valor individual do serviço ordinário | Oculto/Visível |
| **Tema do Calendário** | Esquema de cores do calendário | Padrão/Suave |

### Sistema de Cores

**Códigos de Cores por Tipo:**
- 🔵 **Ordinário**: #4A90E2 (Azul)
- 🟢 **RAS Voluntário**: #7ED321 (Verde)
- 🟠 **RAS Compulsório**: #F5A623 (Laranja)
- 🟣 **Troca Ordinário**: #9013FE (Roxo)
- 🟡 **Troca RAS**: #BD10E0 (Magenta)
- 🔴 **Conflito**: #D0021B (Vermelho)

---

## 🏢 Informações Técnicas

### Serviços Principais

1. **ServicosDataService**: Gerenciamento de dados de serviços
2. **DashboardIntegrationService**: Integração de dados do dashboard
3. **ConflictValidationService**: Validação de conflitos de horários
4. **FinanceiroDataService**: Dados financeiros e metas

### Componentes Responsivos

- Layout adaptativo para desktop e mobile
- Sidebar colapsável
- Tabelas responsivas
- Cards flexíveis

### Performance

- Lazy loading de componentes
- Observables para atualizações reativas
- Build otimizado para produção
- Cache de dados locais (localStorage)

---

## 📞 Suporte e Contato

**Polícia Militar de Santa Catarina**
- 📧 Email: suporte@pm.sc.gov.br
- 📱 Telefone: (48) 3665-7000
- 🌐 Website: [pm.sc.gov.br](http://pm.sc.gov.br)

**Informações do Sistema**
- 📋 Versão: 1.0.0
- 🔧 Build: #2025.01.001
- ⏱️ Uptime: 99.9%
- 🗄️ Base de Dados: Operacional

---

## 📄 Licença

© 2025 Polícia Militar de Santa Catarina. Todos os direitos reservados.

Sistema desenvolvido para uso interno da PMSC com foco em eficiência operacional e transparência administrativa.