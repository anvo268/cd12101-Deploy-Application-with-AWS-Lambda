import { getUserId } from '../utils.mjs'
import { createLogger } from '../../utils/logger.mjs'

import { generateUploadUrl } from '../../businessLogic/todos.mjs'

const logger = createLogger('auth')

export async function handler(event) {
  logger.info('Processing event: ', {
    'event': event
  })

  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)

  const url = await generateUploadUrl(todoId, userId)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: url
  }
}

