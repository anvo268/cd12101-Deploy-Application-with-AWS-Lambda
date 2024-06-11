import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv4 } from 'uuid'
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

  const todoId = uuidv4()

  const newTodo = JSON.parse(event.body)

  const userId = getUserId(event)

  const uploadTodo = {
    todoId: todoId,
    userId: userId,
    done: false,
    createdAt: new Date().toISOString(),  // Gets the current time as a timestamp
    ...newTodo
  }

  logger.info('Todo to upload: ', {
    'uploadTodo': uploadTodo
  })

  await dynamoDbClient.put({
    TableName: todosTable,
    Item: uploadTodo
  })

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
