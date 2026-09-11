import { Buffer } from 'node:buffer'
import { getFile, putFile } from './_lib/github.js'
import { readJsonBody, requireMethod, sendJson } from './_lib/request.js'
import { QUESTIONS } from '../src/lib/afterhack/questions.js'
import { TEAMS } from '../src/lib/afterhack/teams.js'

const DATA_PATH = 'src/data/answers.json'
const VALID_QUESTION_IDS = QUESTIONS.map((q) => q.id)
const VALID_TEAM_NAMES = TEAMS.map((t) => t.name)
const MAX_TEXT_LENGTH = 1000
const MAX_RETRIES = 4

async function readAnswers() {
  const file = await getFile(DATA_PATH)
  if (!file) return { answers: [], sha: undefined }
  let answers = []
  try {
    answers = JSON.parse(file.content)
  } catch {
    answers = []
  }
  if (!Array.isArray(answers)) answers = []
  return { answers, sha: file.sha }
}

async function appendAnswer({ questionId, team, text }) {
  const record = {
    id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    questionId,
    team,
    text,
    createdAt: new Date().toISOString(),
  }

  for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
    const { answers, sha } = await readAnswers()
    try {
      await putFile(
        DATA_PATH,
        Buffer.from(`${JSON.stringify([...answers, record], null, 2)}\n`),
        `chore(answers): add answer for question ${questionId}`,
        sha,
      )
      return record
    } catch (err) {
      const conflict = /\(409\)/.test(err.message)
      if (conflict && attempt < MAX_RETRIES - 1) continue
      throw err
    }
  }
  throw new Error('저장 중 충돌이 반복되어 실패했습니다.')
}

async function handleGet(request, response) {
  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`)
  const questionId = Number(url.searchParams.get('questionId'))

  if (!VALID_QUESTION_IDS.includes(questionId)) {
    return sendJson(response, 400, { error: 'invalid questionId' })
  }

  try {
    const { answers } = await readAnswers()
    const filtered = answers
      .filter((a) => a.questionId === questionId)
      .map((a) => ({ id: a.id, team: a.team, text: a.text }))
    return sendJson(response, 200, { answers: filtered })
  } catch (err) {
    console.error(err)
    return sendJson(response, 500, { error: 'server error' })
  }
}

async function handlePost(request, response) {
  let body
  try {
    body = await readJsonBody(request)
  } catch {
    return sendJson(response, 400, { error: 'invalid json' })
  }

  const questionId = Number(body.questionId)
  const team = typeof body.team === 'string' ? body.team.trim() : ''
  const text = typeof body.text === 'string' ? body.text.trim() : ''

  if (!VALID_QUESTION_IDS.includes(questionId)) {
    return sendJson(response, 400, { error: 'invalid questionId' })
  }
  if (!VALID_TEAM_NAMES.includes(team)) {
    return sendJson(response, 400, { error: 'invalid team' })
  }
  if (!text) {
    return sendJson(response, 400, { error: 'text is required' })
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return sendJson(response, 400, { error: 'text too long' })
  }

  try {
    const record = await appendAnswer({ questionId, team, text })
    return sendJson(response, 201, { id: record.id })
  } catch (err) {
    console.error(err)
    return sendJson(response, 500, { error: 'server error' })
  }
}

export default async function handler(request, response) {
  if (!requireMethod(request, response, ['GET', 'POST'])) return
  if (request.method === 'GET') return handleGet(request, response)
  return handlePost(request, response)
}
