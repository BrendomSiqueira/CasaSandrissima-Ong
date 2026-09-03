<div align="center">

# 🏠 Casa Sandríssima

**Sistema de gestão de alunos e voluntários para a ONG Casa Sandríssima**

[![Deploy](https://img.shields.io/badge/deploy-vercel-000000?logo=vercel&logoColor=white)](https://casa-sandrissima.vercel.app/)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Auth%20%7C%20Firestore-FFCA28?logo=firebase&logoColor=black)
![License](https://img.shields.io/badge/uso-acadêmico-lightgrey)

[Acessar demo](https://casa-sandrissima.vercel.app/) · [Reportar problema](https://github.com/BrendomSiqueira/CasaSandrissima-Ong/issues) · [Equipe](#-equipe)

</div>

---

## 📋 Sumário

- [Sobre o projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias utilizadas](#-tecnologias-utilizadas)
- [Como rodar o projeto localmente](#️-como-rodar-o-projeto-localmente)
- [Variáveis de ambiente](#-variáveis-de-ambiente)
- [Estrutura do projeto](#-estrutura-do-projeto)
- [Equipe](#-equipe)
- [Licença](#-licença)

---

## 📖 Sobre o projeto

O **Casa Sandríssima** é um sistema web desenvolvido para a ONG de mesmo nome, uma organização comunitária que oferece atividades educacionais e sociais para a comunidade. O projeto nasceu a partir de um levantamento de requisitos junto à ONG — formalizado em um **PRD** (Product Requirements Document) com requisitos funcionais, jornadas de usuário e modelo de dados, além de **diagramas UML** de casos de uso para o fluxo de cadastro.

O objetivo é substituir o controle manual (planilhas e anotações em papel) por uma plataforma centralizada, reduzindo retrabalho e facilitando o dia a dia de quem administra a ONG.

🔗 **Deploy em produção:** [casa-sandrissima.vercel.app](https://casa-sandrissima.vercel.app/)

> ⚠️ **Nota:** o projeto está em processo de migração do Firebase para um banco de dados gerenciado. As seções de tecnologias e variáveis de ambiente devem mudar em breve.

## ✨ Funcionalidades

- 🧑‍🎓 **Cadastro de alunos** atendidos pela ONG
- 🤝 **Cadastro de voluntários**
- 🗂️ **Organização e acompanhamento das atividades** oferecidas (turmas, horários, vagas)
- 📊 **Centralização das informações** que antes eram controladas manualmente
- 🔐 **Autenticação de usuários** via Firebase Auth

## 🚀 Tecnologias utilizadas

| Camada | Tecnologia |
|---|---|
| Linguagem | [TypeScript](https://www.typescriptlang.org/) |
| Interface | [React](https://react.dev/) |
| Build tool | [Vite](https://vitejs.dev/) |
| Estilização | CSS |
| Backend/Dados | [Firebase](https://firebase.google.com/) (Auth + Firestore) |
| Hospedagem | [Vercel](https://vercel.com/) (deploy contínuo) |

## 🛠️ Como rodar o projeto localmente

Pré-requisitos: [Node.js](https://nodejs.org/) 18+ e npm instalados.

```bash
# Clone o repositório
git clone https://github.com/BrendomSiqueira/CasaSandrissima-Ong.git

# Acesse a pasta do projeto
cd CasaSandrissima-Ong

# Instale as dependências
npm install

# Configure as variáveis de ambiente (veja a seção abaixo)
cp .env.example .env

# Rode o projeto em ambiente de desenvolvimento
npm run dev
```

O projeto ficará disponível em `http://localhost:5173` (porta padrão do Vite).

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

As credenciais podem ser obtidas no [console do Firebase](https://console.firebase.google.com/), na seção de configurações do projeto.

## 📁 Estrutura do projeto

```
CasaSandrissima-Ong/
├── src/                         # Código-fonte da aplicação
├── .env.example                 # Modelo das variáveis de ambiente
├── .gitignore
├── firebase-applet-config.json  # Configuração do app Firebase
├── firebase-blueprint.json      # Blueprint do projeto Firebase
├── firestore.rules              # Regras de segurança do Firestore
├── index.html
├── metadata.json
├── package.json
├── package-lock.json
├── tsconfig.json
└── vite.config.ts
```

## 👥 Equipe

Projeto desenvolvido por um grupo de 6 estudantes de **Análise e Desenvolvimento de Sistemas** (FATEC Franca — Dr. Thomaz Novelino), como parte de um projeto acadêmico em parceria com a ONG Casa Sandríssima.

## 📄 Licença

Este projeto foi desenvolvido para fins acadêmicos e de apoio à ONG Casa Sandríssima. Uso e distribuição sujeitos a autorização dos autores.

---

<div align="center">

Feito com 💚 para a Casa Sandríssima

</div>
