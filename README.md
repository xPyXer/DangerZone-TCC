# Danger Zone

**Danger Zone** --- aplicativo mobile (iOS & Android) focado em
**identificação de zonas de risco criminal**. Usuários podem **reportar
crimes** ocorridos em uma região, **consultar áreas de risco** e
visualizar **tipos de crimes** em um mapa. Desenvolvido com **React
Native** e **TypeScript** (Expo).

------------------------------------------------------------------------
## Introdução

Danger Zone ajuda cidadãos a reportar incidentes criminais e consultar
visualmente zonas de maior incidência no mapa. O app prioriza
usabilidade: adicionar um reporte é rápido, há opção de anonimato, e as
informações podem ajudar a mapear padrões por tipo e local.

------------------------------------------------------------------------

## Tecnologias

-   **React Native** (Expo)
-   **TypeScript**
-   Gerenciador de pacotes: **npm** 
-   Biblioteca de mapas: Integração com Azure Maps

------------------------------------------------------------------------

## Funcionalidades

-   Login / Cadastro de usuário\
-   Exibição de perfil do usuário\
-   Registrar reporte de crime (com opção anônima)\
-   Escolha do tipo de incidente e horário do ocorrido\
-   Captura/seleção de localização\
-   Resumo/descritivo do incidente\
-   Mapa interativo exibindo áreas de risco

------------------------------------------------------------------------

## Telas (Descrição)

### 1. Tela de Login / Autenticação (Primeira tela para Autenticação)

Tela de login com entrada de e-mail e senha, opção de cadastro (Nome completo, Email e Senha)

### 2. Tela de Mapa / Busca (Principal)

Exibe mapa com marcador de localização, busca por endereço e
visualização dos heatmaps de incidentes.

### 3. Tela "Registrar Reporte" 

Permite registrar crime com anonimato, tipo de crime, horário, localização e
resumo. Como também é a tela na qual você poderá ser redirecionado para realizar o B.O (Após de realizar o reporte).

### 4. Tela de Perfil

Mostra Nome, e-mail e botão para editar perfil.

------------------------------------------------------------------------

## Instalação / Rodando o Projeto

1.  Clone o repositório:

``` bash
git clone https://github.com/xPyXer/DangerZone-TCC.git
cd nome-do-projeto
```

2.  Instale dependências:

``` bash
npm install
```

3.  Configure o arquivo `.env` com suas chaves.

4.  Rode o aplicativo:

``` bash
npx expo start
```

------------------------------------------------------------------------

## Configuração (`.env`)

    API_URL=https://api.seuprojeto.com
    MAPS_API_KEY=SUA_CHAVE

------------------------------------------------------------------------

## Troubleshooting

-   Erros no mapa → verifique chave do Google Maps
-   Erros no Expo → `npx expo start -c`
-   Permissão de localização → verificar AndroidManifest/Info.plist

------------------------------------------------------------------------
