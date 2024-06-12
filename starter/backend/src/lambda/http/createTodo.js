import { getUserId } from '../utils.mjs'
import { createLogger } from '../../utils/logger.mjs'
import { createTodo } from '../../businessLogic/todos.mjs'

const logger = createLogger('auth')

export async function handler(event) {
  logger.info('Processing event: ', {
    'event': event
  })

  const newTodo = JSON.parse(event.body)
  const userId = getUserId(event)

  const uploadTodo = await createTodo(newTodo, userId)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      uploadTodo
    })
  }
}
