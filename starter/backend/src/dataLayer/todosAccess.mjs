import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import AWSXRay from 'aws-xray-sdk-core'
import { createLogger } from '../../utils/logger.mjs'

// Should I put the logger in the constructor instead?
const logger = createLogger('auth')

export class TodoAccess {
    constructor(
        documentClient = AWSXRay.captureAWSv3Client(new DynamoDB()),
        todosTable = process.env.TODOS_TABLE
    ) {
        this.documentClient = documentClient
        this.todosTable = todosTable
        this.dynamoDbClient = DynamoDBDocument.from(this.documentClient)
    }

    async createTodo(todo) {
        logger.info('Creating todo:', {
            'todo struct': todo
        }
        )

        await this.dynamoDbClient.put({
            TableName: this.todosTable,
            Item: group
        })

        return todo
    }
}