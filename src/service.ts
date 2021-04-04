import { Database } from "./database"
import * as model from "./model"

/**
 * Custom exception to signal a database error
 */
export class DatabaseError extends Error {}

/**
 * A service to perform CRUD operations over a ToDoItem
 */
export class ToDoItemService {
    dao: model.ToDoItemDAO

    constructor(database: Database) {
        this.dao = new model.ToDoItemDAO(database)
    }

    /**
     * List the items
     * @returns a list of items
     */
    async list(): Promise<model.ToDoItem[]> {
        return await this.dao.listAll()
    }

    /**
     * Add a new item
     * @param json the JSON representation of the item to add
     */
    async add(json: any): Promise<void> {
        const status = await this.dao.insert(model.ToDoItem.fromJSON(json))

        if (!status) {
            throw new DatabaseError("Failed to insert item in the database")
        }
    }

    /**
     * TODO: implementar a edicao de um item
     */
    

    /**
     * TODO: implementar a remocao de um item pelo id
     */
    

    /**
     * TODO: implementar a recuperacao de um item pelo id
     */

}