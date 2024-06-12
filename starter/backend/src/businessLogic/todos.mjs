import * as uuid from 'uuid'

import { createLogger } from '../utils/logger.mjs'
import { TodoAccess } from '../dataLayer/todosAccess.mjs'

const todoAccess = new TodoAccess()

const logger = createLogger('auth')


export async function createTodo(createTodoRequest, userId) {
    const todoId = uuid.v4()

    const todoStruct = {
        todoId: todoId,
        userId: userId,
        done: false, // Creates problems for some reason?
        createdAt: new Date().toISOString(),  // Gets the current time as a timestamp
        ...createTodoRequest
    }

    logger.info('Todo to upload: ', {
        'todoStruct': todoStruct
    })

    return await todoAccess.createTodo(todoStruct)
}

export async function deleteTodo(todoId, userId) {

    logger.info('Todo to delete: ', {
        'todoId': todoId,
        'userId': userId
    })

    return await todoAccess.deleteTodo(todoId, userId)
}

export async function generateUploadUrl(todoId, userId) {

    const imageId = uuid.v4()

    const url = await todoAccess.getUploadUrl(imageId)

    logger.info('Upload URL: ', {
        'url': url
    })

    logger.info('Query key: ', {
        'todoId': todoId,
        'userId': userId
    })

    await todoAccess.appendAttachmentUrl(todoId, userId, imageId)

    return url
}

export async function getTodos(userId) {

    logger.info('Getting todos for: ', {
        'userId': userId 
    })

    return await todoAccess.getTodos(userId)
}

export async function updateTodo(todoId, userId, updatedTodo) {

    logger.info('Updating Todo: ', {
        'todoId': todoId,
        'userId': userId ,
        'updatedTodoStruct': updatedTodo,
    })

    return await todoAccess.updateTodo(todoId, userId, updatedTodo)
}