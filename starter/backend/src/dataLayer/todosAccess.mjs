import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import AWSXRay from 'aws-xray-sdk-core'
import { createLogger } from '../utils/logger.mjs'

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Should I put the logger in the constructor instead?
const logger = createLogger('auth')

export class TodoAccess {
    constructor(
        documentClient = AWSXRay.captureAWSv3Client(new DynamoDB()),
        todosTable = process.env.TODOS_TABLE,
        bucketName = process.env.IMAGES_S3_BUCKET,
        urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION),
        S3ClientXRay = AWSXRay.captureAWSv3Client(new S3Client())
    ) {
        this.documentClient = documentClient
        this.todosTable = todosTable
        this.bucketName = bucketName
        this.urlExpiration = urlExpiration
        this.dynamoDbClient = DynamoDBDocument.from(this.documentClient)
        this.s3ClientXRay = S3ClientXRay
    }

    async createTodo(todo) {
        logger.info('Creating todo:', {
            'todo struct': todo
        }
        )

        await this.dynamoDbClient.put({
            TableName: this.todosTable,
            Item: todo
        })

        return todo
    }

    async deleteTodo(todoId, userId) {

        await this.dynamoDbClient.delete({
            TableName: this.todosTable,
            Key: {
                todoId: todoId,
                userId: userId
            }
        })

        // Method returns nothing
    }

    async appendAttachmentUrl(todoId, userId, imageId) {

        await this.dynamoDbClient.update({
            TableName: this.todosTable,
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
                ':attachmentUrl': `https://${this.bucketName}.s3.amazonaws.com/${imageId}`
            },
            ReturnValues: 'UPDATED_NEW'
        })
    }

    async getUploadUrl(imageId) {
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: imageId
        })
        const url = await getSignedUrl(this.s3ClientXRay, command, {
            expiresIn: this.urlExpiration
        })
        return url
    }

    async getTodos(userId) {
        const result = await this.dynamoDbClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            },
            ScanIndexForward: false
        })

        return result
    }

    async updateTodo(todoId, userId, updatedTodo) {

        // Dynamically creates the attributes to update from `updatedTodo`
        const keys = Object.keys(updatedTodo);
        const updateExpression = 'set ' + keys.map((key, index) => `#${key} = :${key}`).join(', ');
        const expressionAttributeNames = keys.reduce((result, key) => ({ ...result, [`#${key}`]: key }), {});
        const expressionAttributeValues = keys.reduce((result, key) => ({ ...result, [`:${key}`]: updatedTodo[key] }), {});

        console.log('Please please please log to the console')

        logger.info('Update Expression: ', {
            'keys': keys,
            'updateExpression': updateExpression,
            'expressionAttributeNames': expressionAttributeNames ,
            'expressionAttributeValues': expressionAttributeValues,
        })

        console.log('WTF, why is this not running?')

        // For debugging
        try {

            console.log('Entered the try block')

            const itemToUpdate = await this.dynamoDbClient.get({
                TableName: this.todosTable,
                Key: {
                    todoId: todoId,
                    userId: userId
                }
            })

            console.log('Make it past the get call')

            logger.info('Item to Update: ', {
                'itemToUpdate': itemToUpdate,
            })
        }
        catch (error) {
            console.log('Entered the catch')

            logger.info('Error while fetching item: ', {
                'error message': error.message
            })
        }

        const updated_result = await this.dynamoDbClient.update({
            TableName: this.todosTable,
            Key: {
                todoId: todoId,
                userId: userId
            },
            UpdateExpression: updateExpression,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'UPDATED_NEW'
        })

        return updated_result
    }

}