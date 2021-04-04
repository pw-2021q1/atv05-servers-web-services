import {config} from "../conf/config"
import * as dbConnect from "./database"

/**
 * Custom exception to signal a validation error
 */
 export class ValidationError extends Error {}

/**
 * Entity
 */
export class ToDoItem {
    id: number
    description: string
    tags: string[]
    deadline: string

    constructor(description: string) {
        this.id = 0
        this.description = description
        this.tags = []
        this.deadline = ""
    }
    
    /**
     * Validates the item
     * @returns true if the item is valid, false otherwise
     */
    isValid = () => this.description.length > 0

    /**
     * Check equality between two items
     * @param item the other item to compare
     * @returns true, if items are equal, false otherwise
     */
    isEqual = (item: ToDoItem) => {
        const compareDeadlines = (dateStrA: string, dateStrB: string) => {
            const dateA = Date.parse(dateStrA)
            const dateB = Date.parse(dateStrB)

            if (isNaN(dateA) && isNaN(dateB)) {
                return true
            }
            else if (isNaN(dateA) || isNaN(dateB)) {
                return false
            } else if (dateA == dateB) {
                return true
            }
            
            return false
        }
            
        return this.id == item.id
            && this.description == item.description
            && compareDeadlines(this.deadline, item.deadline)
            && JSON.stringify(this.tags) == JSON.stringify(item.tags)
    }
    
    /**
     * Converts a JSON representation to a ToDoItem instance, if possible
     * @param json the JSON representation of an item
     * @returns a ToDoItem instance
     */
    static fromJSON(json: any): ToDoItem {
        if (!("description" in json)) {
            throw new ValidationError("Missing description field")
        }
    
        const item = new ToDoItem(json.description)
        
        if ("id" in json && !isNaN(json.id)) {
            item.id = json.id
        }
        if ("tags" in json && Array.isArray(json.tags)) {
            item.tags = (json.tags as string[]).map(value => value.trim())
                .filter(value => value.length > 0)
        }
        if ("deadline" in json && !isNaN(Date.parse(json.deadline))) {
            item.deadline = new Date(Date.parse(json.deadline))
                .toUTCString()
        }
    
        return item
    }
}

/**
 * DAO
 */
 export class ToDoItemDAO {
     private database: dbConnect.Database
     
     constructor(database: dbConnect.Database) {
         this.database = database
     }

     /**
      * Retrieves a reference to the entity collection
      * @returns the collection
      */
     private getCollection() {
         return this.database.getDb().collection(config.db.collections.todoItems)
     }

     /**
      * Generates a new entity id
      * @returns a new unique id value
      */
     private async newId(): Promise<number> {
         try {
            const seqColl = this.database.getDb()
                .collection(config.db.collections.sequences)
            const result = await seqColl.findOneAndUpdate(
                {name: "todo-item-id"}, 
                {$inc: {value: 1}})
            if (result.ok) {
                return result.value.value as number
            } 
            throw new Error("Invalid result during id generation")
         } catch (error) {
             console.log("Failed to generate id")
             throw error
         }
     }

     /**
      * Insert a new item
      * @param toDoItem 
      * @returns the id of the inserted item
      */
     async insert(item: ToDoItem): Promise<number> {
        try {
            item.id = await this.newId()

            const response = await this.getCollection().insertOne(item)

            if (!response || response.insertedCount < 1) {
               throw new Error("Invalid result while inserting item")
            }

            return item.id
        } catch (error) {
            console.log("Failed to insert item")
            throw error
        }
     }

     /**
      * List all items
      * @returns the list of items
      */
     async listAll(): Promise<ToDoItem[]> {
         try {
             return await this.getCollection().find(
                 {}, 
                 {projection: {_id: 0}}).toArray() || []
         } catch (error) {
             console.error("Failed to list items")
             throw error
         }
     }

     /**
      * Find an item using its id
      * @param id the item id
      */
     async findById(id: number): Promise<ToDoItem> {
         try {
             const response = await this.getCollection().findOne(
                 {id: id}, 
                 {projection: {_id: 0}})
            
             if (response) {
                 return response as ToDoItem
             }
             throw new Error("Failed to find item with the given id")
         } catch (error) {
             console.error("Failed to find item by id")
             throw error
         }
     }

     /**
      * Update an item
      * @param toDoItem the item to update
      * @returns true if the item was updated, false otherwise
      */
     async update(toDoItem: ToDoItem): Promise<boolean> {
         try {
             const response = await this.getCollection().replaceOne(
                 {id: toDoItem.id}, toDoItem)

             return (response) ? response.modifiedCount > 0 : false
         } catch (error) {
             console.error("Failed to update item")
             throw error
         }
     }

     /**
      * Remove an item given its id
      * @param id the item id
      * @returns true if the item was removed, false otherwise
      */
     async removeById(id: number): Promise<boolean> {
         try {
             const response = await this.getCollection().deleteOne(
                 {id: id}, 
                 {})
             return (response.deletedCount) ? response.deletedCount > 0 : false
         } catch (error) {
             console.error("Failed to remove item")
             throw error
         }
     }
 }
