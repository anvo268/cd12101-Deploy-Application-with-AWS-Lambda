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

  const userId = getUserId(event)

  logger.info('User Id to query: ', {
    'userId': userId 
  })

  try {
    const result = await dynamoDbClient.query({
      TableName: todosTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false
    })
  
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
