import {config} from "../conf/config"
import * as dbConnect from "./db-connection"


/**
 * Data model
 */
export class ToDoItem {
    id: number
    description: string
    tags: string[]
    deadline: string
    student: string

    constructor(description: string, student: string) {
            this.id = 0
            this.description = description
            this.tags = []
            this.deadline = ""
            this.student = student
        }
    
    isValid = () => this.description.length > 0
}

/**
 * ToDo DAO object
 */
 export class ToDoItemDAO {
     private static instance: ToDoItemDAO

     private constructor() {}

     private getCollection() {
         return dbConnect.getDb().collection(config.db.collections["todo-items"])
     }

     static getInstance(): ToDoItemDAO {
         if (!ToDoItemDAO.instance) {
             ToDoItemDAO.instance = new ToDoItemDAO()
         }

         return ToDoItemDAO.instance
     }

     /**
      * Insert a new profile
      * @param toDoItem the profile
      */
     async insert(toDoItem: ToDoItem) {
        try {
            toDoItem.id = await this.nextId()

            const response = await this.getCollection().insertOne(toDoItem)

            return (response) ? response.insertedCount > 0 : false
        } catch (error) {
            throw Error("Failed to insert new element")
        }
     }

     /**
      * List all todo items
      */
     async listAll() {
         try {
             return await this.getCollection().find(
                 {}, 
                 {projection: {_id: 0}}).toArray() || []
         } catch (error) {
             console.error("Failed to list elements")
             throw error
         }
     }

     /**
      * list all todo items for a given RA
      */
     async listByRa(ra: string) {
        try {
            return await this.getCollection().find(
                {student: ra}, 
                {projection: {_id: 0, student: 0}}).toArray() || []
        } catch (error) {
            console.error("Failed to list elements for the given RA")
            throw error
        }
     }

     /**
      * Find by profile using its id
      * @param id the profile id
      */
     async findById(id: number) {
         try {
             const response = await this.getCollection().findOne(
                 {id: id}, 
                 {projection: {_id: 0, student: 0}})

             if (response) {
                 return response as ToDoItem
             }
             throw Error("Failed to find element with the given id")
         } catch (error) {
             console.error("Failed to find element by id")
             throw error
         }
     }

     async update(toDoItem: ToDoItem) {
         try {
             const response = await this.getCollection().replaceOne(
                 {id: toDoItem.id}, toDoItem)

             return (response) ? response.modifiedCount > 0 : false
         } catch (error) {
             console.error("Failed to update element")
             throw error
         }
     }

     async removeById(id: number) {
         try {
             const response = await this.getCollection().deleteOne({id: id}, {})
             return (response.deletedCount) ? response.deletedCount > 0 : false
         } catch (error) {
             console.log("Failed to remove element")
             throw error
         }
     }

     /**
      * Generate a new profile id using a db sequence.
      */
     async nextId() {
        try {
            const seqColl = dbConnect.getDb()
                .collection(config.db.collections.sequences)
            const result = await seqColl.findOneAndUpdate(
                {name: "todo-item-id"}, 
                {$inc: {value: 1}})
            if (result.ok) {
                return result.value.value as number
            }
            throw Error()
        } catch (error) {
            console.error("Failed to generate a new id")
            throw error
        }
     }
 }

 export class StudentDAO {
    private static instance: StudentDAO

    private constructor() {}

    private getCollection() {
        return dbConnect.getDb().collection(config.db.collections["students"])
    }

    static getInstance(): StudentDAO {
        if (!StudentDAO.instance) {
            StudentDAO.instance = new StudentDAO()
        }

        return StudentDAO.instance
    }

    async exists(ra: string): Promise<boolean> {
        try {
            return await this.getCollection().countDocuments({id: ra}) > 0
        } catch(error) {
            console.error("Failed to fetch a student from the database")
            throw error
        }
    }
 }
