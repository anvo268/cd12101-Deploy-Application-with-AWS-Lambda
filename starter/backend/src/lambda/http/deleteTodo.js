import { getUserId } from '../utils.mjs'
import { createLogger } from '../../utils/logger.mjs'
import { deleteTodo } from '../../businessLogic/todos.mjs'

const logger = createLogger('auth')

export async function handler(event) {
  logger.info('Processing event: ', {
    'event': event
  })

  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)


  try {
    await deleteTodo(todoId, userId)

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: `${todoId} Item deleted!`
    }
  }
  catch (error) {
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: error.message
      })
    }
  }
}

