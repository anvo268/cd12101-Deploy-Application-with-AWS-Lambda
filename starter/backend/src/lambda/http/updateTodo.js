import { getUserId } from '../utils.mjs'
import { createLogger } from '../../utils/logger.mjs'

import { updateTodo } from '../../businessLogic/todos.mjs'

const logger = createLogger('auth')

export async function handler(event) {
  logger.info('Processing event: ', {
    'event': event
  })

  const todoId = event.pathParameters.todoId
  const updatedTodo = JSON.parse(event.body)

  const userId = getUserId(event)

  try {
    
    const updated_result = await updateTodo(todoId, userId, updatedTodo)

    logger.info('Update Operation Successful: ', {
      'updated_result': updated_result
    })

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        items: updated_result
      })
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
