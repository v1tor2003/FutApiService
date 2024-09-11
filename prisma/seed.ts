import prisma from './conn'
import axios, { AxiosInstance, isAxiosError } from "axios";
import dotenv from 'dotenv'
import { TeamsRangedQuery } from '../interfaces';
import { Team } from '@prisma/client';

dotenv.config()

/**
 * Pauses execution for a given number of milliseconds.
 * @param ms - The number of milliseconds to sleep.
 * @returns A promise that resolves after the specified delay.
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Creates an Axios instance with the configured base URL and headers.
 * @returns An Axios instance configured for the football API.
 */
function createApiClient (): AxiosInstance {
  return axios.create({
    baseURL: process.env.FOOTBALL_API_BASE_URL,
    headers: { 'X-Auth-Token': process.env.FOOTBALL_API_KEY }
  });
}

/**
 * Retries fetching team data if rate limiting occurs.
 * @param limit - The number of teams to fetch.
 * @param offset - The starting point for fetching teams.
 * @returns A promise that resolves to an array of teams after retrying.
 */
async function retryQueryTeams(limit: number, offset: number): Promise<Team[]> {
  const delay = 60_000 // 1 min in ms
  const interval = 1_000 // 1 sec in ms

  for (let remaining = delay / interval; remaining > 0; remaining--) {
    console.log(`[SEED]: Retrying in: ${remaining}s...`)
    await sleep(interval)
  }

  console.log('[SEED]: Retrying now...')
  return await queryTeams(limit, offset)
}

/**
 * Fetches team data from the API.
 * @param limit - The number of teams to fetch.
 * @param offset - The starting point for fetching teams.
 * @param api - The Axios instance to use for the API request.
 * @returns A promise that resolves to an array of teams.
 */
async function fetchTeamsFromApi(
  limit: number, offset: number = 0, api: ReturnType<typeof createApiClient>
): Promise<Team[]> {  
  try {
    console.log(`[SEED]: Requesting: ${api.getUri()}`)
    const res = await api.get<TeamsRangedQuery>(`/teams?limit=${limit}&offset=${offset}`)
    return res.data.teams
  } catch (error) {
    if(isAxiosError(error)){
      if(error.response?.status === 429) {
        console.error(`[SEED] [${new Date().toISOString()}]: Error 429 handled - Too many requests.`)  
        return await retryQueryTeams(limit, offset)
      } 
      console.error(`[SEED]: Error fetching team data (status: ${error.response?.status}):`, error.message)
    } else {
      console.error('[SEED]: Unexpected Error:', error)
    }
    
    return []
  }
}

/**
 * Queries teams from the football API with retry logic for rate limiting errors.
 * @param limit - The number of teams to fetch.
 * @param offset - The starting point for fetching teams (default is 0).
 * @returns A promise that resolves to an array of teams.
 */
async function queryTeams(limit: number, offset: number = 0): Promise<Team[]> {
  const api = createApiClient()
  return await fetchTeamsFromApi(limit, offset, api)
}

/**
 * Fetches a specified number of teams, filtering out teams with invalid crests.
 * @param amount - The total number of teams to fetch.
 * @param offset - The starting point for fetching teams (default is 0).
 * @returns A promise that resolves to an array of valid teams.
 */
async function getTeams(amount: number, offset: number = 0): Promise<Team[]>{
  if(amount === 0) return []

  const data: Team[] = await queryTeams(amount, offset)
  if(data.length === 0) return []

  const validTeams: Team[] = data.filter((team: Team) => team.crest !== null && team.crest !== '')                        
  data.length = 0 // frees data from memory
  const newOffset: number  = offset + data.length
  const addedTeams: number = validTeams.length
  const newAmount: number  = amount - addedTeams

  console.log(`[SEED]: ${addedTeams} fetched teams in current try.`)
  console.log(`[SEED]: ${newAmount} Remaining teams.`)

  const moreTeams: Team[] = await getTeams(newAmount, newOffset)
  
  return [...validTeams, ...moreTeams]
}

/**
 * Main function to clean up the database and seed it with new team data.
 * @returns A promise that resolves when the seeding process is complete.
 */
async function main(): Promise<void> {
  const amount: number = 1_000
  const offset: number = await prisma.team.count()
  console.log('[SEED]: Seeding db started.\n' + 
              `[SEED]: Existing teams in database: ${offset}.\n` +
              `[SEED]: Fetching more ${amount} teams.`)
  const newTeams: Omit<Team, 'id'>[] = (await getTeams(amount, offset)).map(({ id, ...rest }: Team) => rest)
  await prisma.team.createMany({ data: newTeams })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })