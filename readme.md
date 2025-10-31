# SmartNX Backend Test
Este repositório contém uma aplicação desenvolvida em JavaScript para o desafio de desenvolvedor Backend Júnior da SmartNX.

# Run
A melhor forma de executar este projeto é utilizando docker ou podman, porém é possível executar com node em instalação local.

### 1 - Clone o projeto
```shell
git clone https://github.com/JelsonRodrigues/SmartNX-Backend-Test.git
cd SmartNX-Backend-Test
```

### 2 - Criação e execução dos containers com docker-compose ou podman-compose

Você pode ajustar as configurações do banco de dados e da aplicação pelo arquivo `compose.yaml`, há duas forma de configurar, utilizando variáveis de ambiente na definição dos containers ou realizando o mapeamento de um arquivo `.env` com as variáveis para dentro do container no local `/app/.env`. 
Você pode utilizar o arquivo `.env.example` como base para criação do arquivo `.env`.

```
docker-compose -f compose.yaml up -d
```

Se tudo funcionou corretamente, a aplicação vai estar escutando na porta especificada pela variável `PORT` (padrão 3000)
