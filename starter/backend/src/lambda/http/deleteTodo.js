import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { getUserId } from '../utils.mjs'
import { createLogger } from '../../utils/logger.mjs'
import AWSXRay from 'aws-xray-sdk-core'

const logger = createLogger('auth')

const dynamoDbXRay = AWSXRay.captureAWSv3Client(new DynamoDB())
const dynamoDbClient = DynamoDBDocument.from(dynamoDbXRay)

const todosTable = process.env.TODOS_TABLE

export async function handler(event) {
  logger.info('Processing event: ', {
    'event': event
  })

  const todoId = event.pathParameters.todoId

  // TODO: Remove a TODO item by id
  const userId = getUserId(event)

  logger.info('Deletion key: ', {
    'userId': userId,
    'todoId': todoId
  })

  try {
    await dynamoDbClient.delete({
      TableName: todosTable,
      Key: {
        todoId: todoId,
        userId: userId
      }
    })

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      // body: JSON.stringify({})
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

