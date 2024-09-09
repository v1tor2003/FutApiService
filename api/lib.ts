import axios, { isAxiosError } from "axios";
import dotenv from 'dotenv'
import { Team, TeamsRangedQuery } from "./types";

dotenv.config()

const api = axios.create({
  baseURL: process.env.FOOTBALL_API_BASE_URL,
  headers: { 'X-Auth-Token' : process.env.FOOTBALL_API_KEY}
})

async function queryTeams(limit: number, offset: number = 0): Promise<Team[]> {
  try {
    const res = await api.get<TeamsRangedQuery>(`/teams?limit=${limit}&offset=${offset}`)
    return res.data.teams
  } catch (error) {
    if(isAxiosError(error) && error.response?.status !== 429)
      console.error('Error fetching team data:', error);
    return []
  }
}

async function saveTeams(ref: Map<number,Team>, amount: number, offset: number = 0): Promise<void>{
  if(amount === 0) return

  let controlledIndex: number = ref.size + 1
  const data: Team[] = await queryTeams(amount, offset)

  if(data.length === 0) return

  const newOffset = offset + data.length
  
  const addedTeams: number = data
    .filter((team: Team) => team.crest !== null && team.crest !== '')
    .map((team: Team) => {
      ref.set(controlledIndex, team)
      controlledIndex++
      return team
    }).length 

  const newAmount = amount - addedTeams
  return await saveTeams(ref, newAmount, newOffset)
}

export async function loadTeams(ref: Map<number, Team>, amount: number = 0): Promise<void> {
  console.log('Querying teams...')
  await saveTeams(ref, amount)
}
