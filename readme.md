# SmartNX Backend Test

Este repositório contém uma aplicação desenvolvida em JavaScript para o desafio de desenvolvedor Backend Júnior da SmartNX.

# Desafio

Criar uma api restfull para gerenciamento de usuários, posts e comentários.

A api deve ser capaz de Criar, listar, atualizar e deletar usuários, posts e comentários.

A api deve ser segura, utilizando autenticação JWT para proteger as rotas de criação, atualização e deleção.

# Tecnologias Utilizadas

- Node.js
- Express.js
- PostgreSQL
- Sequelize
- JWT
- Docker / Podman
- Git

# Run

A melhor forma de executar este projeto é utilizando docker ou podman utilizando o arquivo de configuração `docker-compose.yaml` ou `compose-using-env.yaml`.

Ou pode testar a aplicação pelo seguinte URL público: https://smartnx-backend-test.jelson.dev.br/

### 1 - Clone o projeto

```shell
git clone https://github.com/JelsonRodrigues/SmartNX-Backend-Test.git
cd SmartNX-Backend-Test
```

### 2 - Criação e execução dos containers com docker-compose ou podman-compose

Há dois arquivos de configuração para o docker-compose, o `compose.yaml` e o `compose-using-env.yaml`.
O arquivo `compose.yaml` realiza a configuração das variáveis de ambiente diretamente na definição dos containers, já o arquivo `compose-using-env.yaml` realiza o mapeamento de um arquivo `.env` para dentro do container.

Crie a pasta postgres para armazenar os dados do banco de dados:

```shell
mkdir -p postgres
```

```shell
docker-compose -f compose.yaml up -d
```

Se tudo funcionou corretamente, a aplicação vai estar escutando na porta especificada pela variável `PORT` (padrão 3000)
