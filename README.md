# FIFA-backend

## Contents

- [Installation](#installation)
- [Endpoints](#endpoints)
  - [All players](#all-players)
  - [Single player](#single-player)
  - [Players by team](#players-by-team)
  - [Players by nationality](#players-by-nationality)
  - [Rankings](#rankings)
  - [Login](#login)
  - [Register](#register)
  - [Change user password](#change-password)
  - [Delete user](#delete-user)

## Installation

- Clone the project to your machine
- Navigate to the project folder and run `yarn install` from the terminal
- Run `yarn start` to start the server on localhost:8000

## Endpoints

- All api requests require an Authorization header with a signed jwt

### All Players

- Send `GET` request to `/api/players`
- Response will contain an array of objects containing:
  - `id` - Unique identifier for each player.
  - `name` - Player's name.
  - `position` - Player's position.

### Single Player

- Send `GET` request to `/api/players/:id`.
- Response will contain an object containing all stats for the player indicated by the id.

### Players by Team

- Send `GET` request to `/api/team` with team name in request body as `team`.
- Response will contain an array of objects containing the following information for all players on the team:
  - `id` - Unique identifier for each player.
  - `name` - Player's name.
  - `position` - Player's position.

### Players by Nationality

- Send `GET` request to `/api/nation` with team name in request body as `nation`.
- Response will contain an array of objects containing the following information for all players from the nation:
  - `id` - Unique identifier for each player.
  - `name` - Player's name.
  - `position` - Player's position.

### Rankings

- Send `GET` request to `/api/ranking` with `position` abbreviation in the request body. Position is not case sensitive.
- Response will contain an array of objects containing `id`, `score`, `rank`, and `name`. Response is sorted by rank.

### Login

- Send `POST` request to `/api/login` with `username` and `password` in the request body.
- Response will contain a `token` with the signed jwt and a `username`

### Register

- Send `POST` request to `/api/register` with `username` and `password` in the request body.
  `username` should be at least 3 characters, `password` should be at least 8 characters.
- Response will contain `id`, `token` with the signed jwt, and `username`

### Change User Password

- Send `PUT` request to `/api/passchange` with `username`, `oldPassword`, and `newPassword` in the request body. The new password should be at least 8 characters long.
- Response will contain `message` with "Password updated" on successful update

### Delete User

- Send `DELETE` request to `/api/userdel` with `username` and `password` in the request body.
- Response will contain `message` with "User deleted" on successful deletion.
