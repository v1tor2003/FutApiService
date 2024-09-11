import express from 'express'
import { Request, Response } from 'express-serve-static-core'
import dotenv from 'dotenv'
import cors from 'cors'
import { TeamRequestParams } from './types'
import prisma from '../prisma/conn'
import { setupSwagger } from './swagger'

dotenv.config()

const PORT = process.env.PORT || 3000

const app = express()

// Configures cors to allow only trusted hosts
app.use(cors({
  origin: process.env.NODE_END === 'dev' ? '*' :  process.env.ORIGINS?.split(',') || [],
  methods: ['GET']
}))

// Swagger config and setup
setupSwagger(app)

/**
 * Checks if the provided team ID is valid.
 * @param id - The ID of the team to validate.
 * @returns A boolean indicating whether the team ID is valid.
 */
const isTeamIdValid = async (id: number) => id > 0

/**
 * Redirects requests from the root URL ("/") to the API documentation ("/api-docs").
 * @param _   - The request object (not used).
 * @param res - The response object used to redirect.
 * @returns None
 */
app.get('/', (_, res: Response) => res.redirect('/api-docs'))

/**
 * Retrieves a team by its ID.
 * @param req - The request object containing the team ID in the URL parameters.
 * @param res - The response object used to send the response back to the client.
 * @returns A JSON response with the team data if valid, or an error message if invalid or an exception occurs.
 */
app.get(`/api/v1/teams/:id`, async (req: Request<TeamRequestParams>, res: Response) => {
  try {
    const teamId = parseInt(req.params.id, 10)
    
    if (!(await isTeamIdValid(teamId))) 
      return res.status(400).json({ error: 'Invalid team ID.' })

    const team = await prisma.team.findUnique({
      where: {
        id: teamId
      }
    })

    if(!team) return res.status(404).json({ error: `Team of id :${teamId} does not exists.` })

    res.status(200).json(team)
  } catch (error) {
    console.error('[LOG]: Error retrieving team data from database:', error);
    res.status(500).json({ error: 'Failed to retrive team.' });
  }
})

/**
 * Handles requests to unknown routes.
 * @param _ - The request object (not used).
 * @param res - The response object used to send a 404 status with an error message.
 * @returns A JSON response indicating that the resource was not found.
 */
app.use((_, res: Response) => res.status(404).json({ error: 'Resource Not Found.' }))

/**
 * Starts the Express server.
 * @param PORT - The port on which the server will listen.
 * @returns None
 */
app.listen(PORT, async () => {
  console.log('[LOG]: Starting server...\n' +
              '[LOG]: Server up and running on port: ' + PORT)
})

export default app
