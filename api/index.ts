import express from 'express'
import { Request, Response } from 'express-serve-static-core'
import dotenv from 'dotenv'
import cors from 'cors'
import { TeamRequestParams, Team } from './types'
import { loadTeams } from './lib'

dotenv.config()

const app = express()
app.use(cors())

const PORT = process.env.PORT || 3000
const API_PREFIX = '/api/v1'
let teams: Map<number, Team> = new Map()

app.get(`${API_PREFIX}/team/:id`, async (req: Request<TeamRequestParams>, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10)
    res.status(200).json(teams.get(id))
  } catch (error) {
    console.error('Error fetching team data:', error);
    res.status(500).json({ error: 'Failed to fetch team data' });
  }
})

app.get(`${API_PREFIX}/available-teams`, async (req: Request, res: Response) => {
  try {
    res.status(200).json({ count: teams.size })
  } catch (error) {
    console.error('Error getting server data:', error);
    res.status(500).json({ error: 'Failed to get available teams.' });
  }
})

app.listen(PORT, async () => {
  console.log('Starting server, loading resources...')
  await loadTeams(teams, 1000)
  console.log('Server up and running on port: ' + PORT)
})
