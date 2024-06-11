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
  const updatedTodo = JSON.parse(event.body)

  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object

  const userId = getUserId(event)

  logger.info('User Id to query: ', {
    'userId': userId 
  })

  // Dynamically creates the attributes to update from `updatedTodo`
  const keys = Object.keys(updatedTodo);
  const updateExpression = 'set ' + keys.map((key, index) => `#${key} = :${key}`).join(', ');
  const expressionAttributeNames = keys.reduce((result, key) => ({ ...result, [`#${key}`]: key }), {});
  const expressionAttributeValues = keys.reduce((result, key) => ({ ...result, [`:${key}`]: updatedTodo[key] }), {});

  try {
    const updated_result = await dynamoDbClient.update({
      TableName: todosTable,
      Key: {
        todoId: todoId,
        userId: userId 
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'UPDATED_NEW'
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
