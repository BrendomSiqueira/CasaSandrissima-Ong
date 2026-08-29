# Casa Sandríssima 🏠

Sistema de gestão de alunos e voluntários desenvolvido para a ONG **Casa Sandríssima**, uma organização comunitária. O projeto centraliza o cadastro, acompanhamento e a gestão das atividades da ONG, substituindo processos manuais por uma plataforma web integrada.

🔗 **Deploy em produção:** [casa-sandrissima.vercel.app](https://casa-sandrissima.vercel.app/)

## 📋 Sobre o projeto

O sistema foi concebido a partir de um levantamento de requisitos junto à ONG, formalizado em um PRD (Product Requirements Document) contendo requisitos funcionais, jornadas de usuário e modelo de dados, além de diagramas UML de casos de uso para o fluxo de cadastro.

Principais objetivos do sistema:
- Gerenciar o cadastro de alunos atendidos pela ONG
- Gerenciar o cadastro de voluntários
- Organizar e acompanhar as atividades oferecidas
- Centralizar informações que antes eram controladas manualmente

## 🚀 Tecnologias utilizadas

- **TypeScript** — linguagem principal do projeto
- **React** — biblioteca para construção da interface
- **Vite** — build tool e servidor de desenvolvimento
- **CSS** — estilização
- **Firebase** — autenticação, banco de dados e regras de segurança (Firestore)
- **Vercel** — hospedagem e deploy contínuo

> ⚠️ Nota: o projeto está em processo de migração do Firebase para um banco de dados gerenciado, então esta seção pode mudar em breve.

## 🛠️ Como rodar o projeto localmente

```bash
# Clone o repositório
git clone [https://github.com/BrendomSiqueira/CasaSandrissima-Ong.git)

# Acesse a pasta do projeto
cd casa-sandrissima

# Instale as dependências
npm install

# Configure as variáveis de ambiente (veja seção abaixo)
cp .env.example .env

# Rode o projeto em ambiente de desenvolvimento
npm run dev
```

## 🔑 Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto (nunca commitado — veja o `.gitignore`) com as credenciais do Firebase:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## 📁 Estrutura do projeto

```
casa-sandrissima/
├── src/                        # Código-fonte da aplicação
├── .env.example                # Modelo das variáveis de ambiente
├── .gitignore
├── firebase-applet-config.json # Configuração do app Firebase
├── firebase-blueprint.json     # Blueprint do projeto Firebase
├── firestore.rules             # Regras de segurança do Firestore
├── index.html
├── metadata.json
├── package.json
├── package-lock.json
├── tsconfig.json
└── vite.config.ts
```

## 👥 Equipe

Projeto desenvolvido por um grupo de 6 estudantes de Análise e Desenvolvimento de Sistemas (FATEC Franca), como parte de um projeto acadêmico em parceria com a ONG Casa Sandríssima.

## 📄 Licença

Este projeto foi desenvolvido para fins acadêmicos e de apoio à ONG Casa Sandríssima.
