import * as mongodb from "mongodb"
import {config} from "../conf/config"

/**
 * Database abstraction for a MongoDB-based model
 * WARNING: Only one instance of this class must be created for 
 * the whole application, otherwise multiple connection pools 
 * will be creating, wasting resources
 */
export class Database {
    private client: mongodb.MongoClient

    /**
     * Instantiate a new mongodb client
     */
    constructor() {
        this.client = new mongodb.MongoClient(config.db.url, 
            {useUnifiedTopology: true})
    }

    /**
     * Connect to the database
     */
    async connect(): Promise<void> {
        try {
            if (!this.client.isConnected()) {
                await this.client.connect()
                console.log("Connected to the database")
            }
        } catch (error) {
            console.error("Failed to connect to the database")
            throw error
        }
    }

    /**
     * Disconnect from the database
     */
    async disconnect(): Promise<void> {
        try {
            if (this.client.isConnected()) {
                await this.client.close()
                console.log("Closed database connection")
            }
        } catch (error) {
            console.error("Failed to close database connection")
            throw error
        }
    }

    /**
     * Get a database instance
     * @returns the database instance
     */
    getDb() {
        try {
            if (this.client.isConnected()) {
                return this.client.db(config.db.name)
            }
            throw new Error("Database is not connected")
        } catch(error) {
            console.error(error.stack)
            throw error
        }
    }
}
