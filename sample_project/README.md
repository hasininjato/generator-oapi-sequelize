# A propos

C'est la partie backend pour le test technique de L3M Holding.


# Configuration
Pour exécuter le container, on exécute la commande `./commands/docker-exec.sh`, puis `cd backend`. On installe ensuite les dépendances `npm install`. Pour exécuter le serveur Express, on exécute la commande `npm run dev`.

Renommer .env.example en .env (même valeur que pour .env de Docker, en plus de JWT_SECRET et JWT_REFRESH_SECRET générés avec la commande `openssl rand -base64 64` depuis le container)

# Comment tester l'API

## On peut accéder à la documentation de l'API en allant vers http://localhost:8000/docs/ (Utilisant Swagger et OpenAPI, il se peut que les réponses décrites dans cette documentation soient encore incomplètes par manque de temps)

Voici les endpoints de cette API:
## Pour l'authentification et la gestion des utilisateurs

- Création d'un utilisateur  
`POST http://localhost:8000/api/users`  avec payload en JSON
```json
{
    "fullname": "fullname",
    "email": "email@test.com",
    "password": "password"
}
```
**&Retourne**
```json
{
    "id": 10,
    "fullname": "fullname",
    "email": "email@test.com",
    "password": "hashed-password",
    "updatedAt": "2025-03-13T09:42:02.583Z",
    "createdAt": "2025-03-13T09:42:02.583Z"
}
```
- Authentification d'un utilisateur  
`POST http://localhost:8000/api/auth/login`  avec payload en JSON
```json
{
    "email": "email@test.com",
    "password": "password"
}
```
**Retourne**
```json
{
    "id": 10,
    "fullname": "fullname",
    "email": "email@test.com",
    "access_token": "JWT access token",
    "refresh_token": "JWT refresh token"
}
```
- Récupération d'un utilisateur par son id
`GET http://localhost:8000/api/users/:id` avec Bearer token généré par le précédent endpoint (/login)
Header: `Authorization: Bearer TOKEN`  
**Retourne**
```json
{
    "id": 1,
    "fullname": "fullname",
    "email": "emain@test.com"
}
```
- Récupération de la liste de tous les utilisateurs
`GET http://localhost:8000/api/users` avec Bearer token généré par le précédent endpoint (/login)
Header: `Authorization: Bearer TOKEN`  
**Retourne**
```json
[
    {
        "id": 1,
        "fullname": "user1",
        "email": "user1@mail.com"
    },
    {
        "id": 2,
        "fullname": "user2",
        "email": "user2@mail.com"
    }
]
```
- Mise à jour d'un utilisateur
`PUT http://localhost:8000/api/users/:id` avec Bearer token généré par le précédent endpoint (/login)
Header: `Authorization: Bearer TOKEN`  
avec un payload JSON
```json
{
    "fullname": "fullname update"
}
```
**Retourne** No content 204  
- Suppression d'un utilisateur par son id
`DELETE http://localhost:8000/api/users` avec Bearer token généré par le précédent endpoint (/login)
Header: `Authorization: Bearer TOKEN`  
**Retourne** No content 204

## Pour la gestion des transactions

- Création d'une transaction
`POST http://localhost:8000/api/users/1/transactions` avec Bearer token généré par le précédent endpoint (/login)
Header: `Authorization: Bearer TOKEN`  
```json
{
    "description": "transaction 01",
    "amount": 20
}
```
**Retourne**
```json
{
    "date": "2025-03-13T10:01:45.572Z",
    "id": 3,
    "amount": "20",
    "description": "transaction 01",
    "userId": 1,
    "updatedAt": "2025-03-13T10:01:45.573Z",
    "createdAt": "2025-03-13T10:01:45.573Z"
}
```
- Récupération des transactions d'un utilisateur
`GET http://localhost:8000/api/users` avec Bearer token généré par le précédent endpoint (/login)
Header: `Authorization: Bearer TOKEN`  
**Retourne**
```json
{
    "fullname": "fullname",
    "email": "email@test.com",
    "Transactions": [
        {
            "id": 1,
            "amount": "94",
            "description": "transaction 01",
            "date": "2025-03-13T08:47:07.911Z",
            "createdAt": "2025-03-13T08:47:07.911Z",
            "updatedAt": "2025-03-13T08:47:07.911Z",
            "userId": 1
        },
        {
            "id": 2,
            "amount": "3",
            "description": "transaction 02",
            "date": "2025-03-13T08:47:13.571Z",
            "createdAt": "2025-03-13T08:47:13.571Z",
            "updatedAt": "2025-03-13T08:47:13.571Z",
            "userId": 1
        },
        {
            "id": 3,
            "amount": "20",
            "description": "transaction 01",
            "date": "2025-03-13T10:01:45.572Z",
            "createdAt": "2025-03-13T10:01:45.573Z",
            "updatedAt": "2025-03-13T10:01:45.573Z",
            "userId": 1
        }
    ]
}
```

N.B.: Pour les routes protégées, si aucun token n'est ajouté au header Authorization, la réponse retournée est  
``json
{
    "message": "No token provided."
}
```
Si le token est expiré, la réponse retournée est  
``json
{
    "message": "Unauthrorized"
}
```