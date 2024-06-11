import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { getUserId } from '../utils.mjs'
import { v4 as uuidv4 } from 'uuid'
import { createLogger } from '../../utils/logger.mjs'
import AWSXRay from 'aws-xray-sdk-core'

const logger = createLogger('auth')

const dynamoDbXRay = AWSXRay.captureAWSv3Client(new DynamoDB())
const dynamoDbClient = DynamoDBDocument.from(dynamoDbXRay)

const s3Client = new S3Client()
const s3ClientXRay = AWSXRay.captureAWSClient(s3Client)

const todosTable = process.env.TODOS_TABLE
const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION)

export async function handler(event) {
  logger.info('Processing event: ', {
    'event': event
  })

  const todoId = event.pathParameters.todoId

  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
  const imageId = uuidv4()
  const userId = getUserId(event)

  const url = await getUploadUrl(imageId)

  logger.info('Upload URL: ', {
    'url': url
  })

  logger.info('Query key: ', {
    'todoId': todoId,
    'userId': userId
  })

  await dynamoDbClient.update({
    TableName: todosTable,
    Key: {
      todoId: todoId,
      userId: userId 
    },
    // Add the new field attachmentUrl and set it's value to `url`
    UpdateExpression: 'set #attachmentUrl = :attachmentUrl',
    ExpressionAttributeNames: {
      '#attachmentUrl': 'attachmentUrl'
    },
    ExpressionAttributeValues: {
      ':attachmentUrl': `https://${bucketName}.s3.amazonaws.com/${imageId}`
    },
    ReturnValues: 'UPDATED_NEW'
  })

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: url
  }
}


async function getUploadUrl(imageId) {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: imageId
  })
  const url = await getSignedUrl(s3ClientXRay, command, {
    expiresIn: urlExpiration
  })
  return url
}
