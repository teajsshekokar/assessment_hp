#!/bin/bash

docker build -t helloprint:latest .

source environment_file

helm repo add bitnami https://charts.bitnami.com/bitnami

# Deploy DB
helm upgrade --install postgres ./helm/postgres    

# Deploy Redis Cache
helm upgrade --install redis bitnami/redis \
    --set architecture=standalone \
    --set auth.enabled=false

helm upgrade --install node-app helm/node-app

# Trried to install using public helmchart but the authentication somehow not working
# helm upgrade --install postgres bitnami/postgresql \
#     --set global.postgresql.auth.postgresPassword=$POSTGRES_PASSWORD \
#     --set global.postgresql.auth.username=$POSTGRES_USER \
#     --set global.postgresql.auth.database=$POSTGRES_DB \
#     --set global.postgresql.auth.password=$POSTGRES_PASSWORD

# helm uninstall node-app
# helm uninstall postgres
# helm uninstall redis