const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const app = express()

const dbPath = path.join(__dirname, 'cricketTeam.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()
//api1
app.get('/players/', async (request, response) => {
  const getPlayersList = `
    SELECT
      *
    FROM
      cricket_team
    `
  let playersList = await db.all(getPlayersList)
  let result = player => {
    return {
      playerId: player.player_id,
      playerName: player.player_name,
      jerseyNumber: player.jersey_number,
      role: player.role,
    }
  }
  response.send(playersList.map(player => result(player)))
})
//api3.
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const player = `
    SELECT
      *
    FROM
      cricket_team
    WHERE
      player_id = ${playerId};`
  let result = player => {
    return {
      playerId: player.player_id,
      playerName: player.player_name,
      jerseyNumber: player.jersey_number,
      role: player.role,
    }
  }
  response.send(result(await db.get(player)))
})

//api2
app.post('/players/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const addPlayer = `
  insert into
    cricket_team(player_name,jersey_number,role)
  values (
    "${playerName}","${jerseyNumber}","${role}"
  )`
  const dbresponse = await db.run(addPlayer)
  const playerId = dbResponse.lastID
  response.send({playerId: playerId})
  response.send('Player Added to Team')
})

//api4
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerdetail = request.body
  const {playerName, jerseyNumber, role} = playerdetail
  const updateplayerquery = `
    UPDATE
      cricket_team
    SET
      player_id='${playerId}',
      player_name='${playerName}',
      jersey_number="${jerseyNumber}",
      role="${role}",
    WHERE
      player_id = ${playerId};`
  await db.run(updateplayerquery)
  response.send('player Details Updated')
})

app.delete(`/players/:playerId/`, async (request, response) => {
  const {playerId} = request.params
  const deletePlayerQuery = `
    DELETE FROM cricket_team
    WHERE
      player_id = ${playerId};`
  await db.run(deletePlayerQuery)
  response.send('Player Removed')
})

module.exports = app
