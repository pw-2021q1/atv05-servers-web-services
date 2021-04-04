/**
 * CLI-based manual test client for ToDoItemService
 * Most operations should be inspected visually to assess results
 * For automated testing, refer to *.test.ts
 */

import axios from "axios"
import { config } from "../conf/config"
import { ToDoItem } from "./model"

/**
 * If your server is in different port, update the config file
 */
const url = config.test.url

/**
 * Test list operation
 */
async function testList() {
    try {
        const response = await axios.get(`${url}/list`)

        console.log(response.status)
        console.dir(response.data, {depth: null})
    } catch (error) {
        console.error(error)
    }
}

/**
 * Test add operation with an arbitrary item
 */
async function testAdd() {
    try {
        const item = new ToDoItem("Testing insert on REST client")

        item.deadline = new Date(Date.parse("03/31/2021")).toUTCString()
        item.tags = ["tag3", "tag4"]
        
        const response = await axios.put(`${url}/add`, item)

        console.log(response.status)
        console.dir(response.data)
    } catch (error) {
        console.error(error)
    }
}



testList()
// testAdd()

