import * as uuid from 'uuid'

import { createLogger } from '../../utils/logger.mjs'
import { TodoAccess } from '../dataLayer/todosAccess.mjs'

const todoAccess = new TodoAccess()

const logger = createLogger('auth')


// export async function getAllGroups() {
//   return groupAccess.getAllGroups()
// }

export async function createTodo(createTodoRequest, userId) {
    const todoId = uuid.v4()

    const todoStruct = {
        todoId: todoId,
        userId: userId,
        done: false,
        createdAt: new Date().toISOString(),  // Gets the current time as a timestamp
        name: createTodoRequest.name,
        dueDate: createTodoRequest.description
    }

    logger.info('Todo to upload: ', {
        'todoStruct': todoStruct
    })

    return await todoAccess.createTodo(todoStruct)
}