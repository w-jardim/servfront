# ServFront - Sistema de Controle de Serviços PMSC

<p align="center">
  <img src="https://github.com/user-attachments/assets/c64b4c0f-0080-43b7-b629-f55c7194cf5c" alt="Dashboard ServFront" width="600"/>
</p>

## 🚔 Sobre o Projeto

O **ServFront** é um sistema web moderno desenvolvido para a **Polícia Militar de Santa Catarina (PMSC)** que oferece controle integrado de serviços policiais e gestão financeira. 

### ✨ Principais Funcionalidades

- 📊 **Dashboard Integrado** - Visão geral completa de serviços e finanças
- 🕒 **Controle de Serviços** - Gerenciamento de escalas ordinárias e RAS
- 💰 **Gestão Financeira** - Acompanhamento de valores, metas e pagamentos
- 📅 **Calendário Interativo** - Visualização mensal com código de cores
- ⚡ **Detecção de Conflitos** - Identificação automática de sobreposições
- 🎯 **Sistema de Metas** - Definição e acompanhamento de objetivos financeiros

## 🏗️ Tecnologias Utilizadas

- **Frontend**: Angular 20.1.0
- **Linguagem**: TypeScript 5.8.2
- **Estilização**: SCSS
- **Arquitetura**: Standalone Components
- **Padrões**: Reactive Programming com RxJS

## 🚀 Instalação Rápida

```bash
# Clone o repositório
git clone https://github.com/w-jardim/servfront.git
cd servfront

# Instale as dependências
npm install

# Execute o servidor de desenvolvimento
npm start
```

A aplicação estará disponível em `http://localhost:4200`

## 📱 Capturas de Tela

### Dashboard Principal
![Dashboard](https://github.com/user-attachments/assets/c64b4c0f-0080-43b7-b629-f55c7194cf5c)

### Controle de Serviços
![Serviços](https://github.com/user-attachments/assets/c0fba5d3-f917-4dae-96cc-609a4503acaf)

### Visão Financeira
![Financeiro](https://github.com/user-attachments/assets/c61aeec9-e6b4-4a73-9930-046cf231a78a)

## 📚 Documentação Completa

Para informações detalhadas sobre funcionalidades, arquitetura e guia de uso, consulte:

**[📖 DOCUMENTAÇÃO_COMPLETA.md](./DOCUMENTACAO_COMPLETA.md)**

A documentação completa inclui:
- Arquitetura detalhada do sistema
- Guia completo de funcionalidades
- Estrutura de dados e interfaces
- Configurações e personalização
- Screenshots detalhados de todas as telas

## 🔧 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm start` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm test` | Testes unitários |
| `npm run watch` | Build em modo watch |

## 🎯 Módulos do Sistema

### 1. **Dashboard**
- Perfil do usuário com avatar
- Calendário de serviços interativo
- Resumo financeiro mensal
- Configurações personalizáveis

### 2. **Controle de Serviços**
- **Ordinários**: Escalas regulares 12x36
- **RAS Voluntário**: R$ 65-85/h
- **RAS Compulsório**: R$ 40-45/h
- **Trocas**: Permutação entre policiais

### 3. **Gestão Financeira**
- Acompanhamento de valores
- Sistema de metas pessoais
- Status de pagamentos
- Relatórios detalhados

## 🎨 Sistema de Cores

- 🔵 **Ordinário**: Azul
- 🟢 **RAS Voluntário**: Verde
- 🟠 **RAS Compulsório**: Laranja
- 🟣 **Troca Ordinário**: Roxo
- 🟡 **Troca RAS**: Magenta
- 🔴 **Conflito**: Vermelho

## 📞 Suporte

**Polícia Militar de Santa Catarina**
- 📧 suporte@pm.sc.gov.br
- 📱 (48) 3665-7000

## 📄 Licença

© 2025 Polícia Militar de Santa Catarina. Todos os direitos reservados.

---

> **Nota**: Para desenvolvimento com Angular CLI, consulte a [documentação oficial](https://angular.dev/tools/cli).
