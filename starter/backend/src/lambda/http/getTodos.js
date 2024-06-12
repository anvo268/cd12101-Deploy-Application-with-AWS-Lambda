import { getUserId } from '../utils.mjs'
import { createLogger } from '../../utils/logger.mjs'
import { getTodos } from '../../businessLogic/todos.mjs'

const logger = createLogger('auth')

export async function handler(event) {
  logger.info('Processing event: ', {
    'event': event
  })

  const userId = getUserId(event)

  try {
    const result = await getTodos(userId)
  
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        items: result.Items
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
