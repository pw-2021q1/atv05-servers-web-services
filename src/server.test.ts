/**
 * DO NOT EDIT THIS FILE
 */

import {suite as define} from "mocha"
import {strict as assert} from "assert"
import axios, { AxiosResponse } from "axios"
import { config } from "../conf/config"
import { ToDoItem } from "./model"

/**
 * Tests for the service layer
 */
define("Service layer tests", () => {
    axios.defaults.validateStatus = () => true
    const url = config.test.url
    const ops = {
        list: () => `${url}/list`,
        add: () => `${url}/add`,
        item: (id: any) => `${url}/item/${id}`,
        remove: (id: any) => `${url}/remove/${id}`,
        update: () => `${url}/update`
    }

    function validateToDoItem(item: object) {
        assert.equal("description" in item, true, `Item does not have description property: ${JSON.stringify(item)}`)
        for (const prop of Object.keys(item)) {
            if (["id", "description", "deadline", "tags"].indexOf(prop) < 0) {
                assert.fail(`Unknown property "${prop}" in retrieved object: ${JSON.stringify(item)}`)
            }
        }
    }

    /**
     * Tests for list operation
     */
    define("Test /list", async () => {
        const doRequest = async () => await axios.get(ops.list())

        it("Operation is defined (should not throw 404)", async () => {
            const response = await doRequest()

            assert.notEqual(response.status, 404, "/add operation does not match REST specification. Check documentation.")
        })

        it("Successfull list follows expected structure", async () => {
            const response = await doRequest()

            assert.equal(response.status, 200, "Expected 200 status code")
            assert.equal("status" in response.data, true, "'status' property not found in response JSON")
            assert.equal("ok", response.data.status, "proptery 'status' should have 'ok' value")
            assert.equal("items" in response.data, true, "Missing 'items' property in response")
            if ("items" in response.data) {
                assert.equal(Array.isArray(response.data.items), true, "Property 'items' should be an array")
            }
        })

        it("Retrieved items follow data type structure", async () => { 
            const items = (await doRequest()).data.items

            if (items.length < 1) {
                assert.fail("No element returned. Impossible to test.")
            }

            for (const item of items) {
                validateToDoItem(item)
            }
        })
    })

    /**
     * Tests for item operation
     */
    define("Test /item", () => {
        const doRequest = async (id: any) => await axios.get(ops.item(id))

        it("Operation is defined (should not throw 404)", async () => {
            const response = await doRequest(-1)

            assert.notEqual(response.status, 404, "Operation does not match REST specification. Check documentation.")
        })

        it("Invalid id should be unsuccessfull", async () => {
            for (const id of [-1, "a"]) {
                const response = await doRequest(-1)
                assert.equal(response.status, 500, `Unexpected response code with invalid id: ${id}`)
                assert.equal(response.data.status, "failure")
            }
        })

        it("Valid id should be successfull", async () => {
            const items = (await axios.get(ops.list())).data.items

            for (const item of items) {
                const response = await doRequest(item.id)

                assert.equal(response.status, 200, `Unexpected response code with valid item id: ${JSON.stringify(item)}`)
                assert.equal(response.data.status, "ok")
            }
        })

        it("Retrieved items follow data type structure", async () => {    
            const items = (await axios.get(ops.list())).data.items

            if (items.length < 1) {
                assert.fail("No element returned. Impossible to test")
            }
            for (const item of items) {
                const retrItem = (await doRequest(item.id)).data.item

                if (!retrItem) {
                    assert.fail("Retrieved item should not be undefined")
                }
                validateToDoItem(retrItem)
            }
        })

        it("Successfull list follows expected structure", async () => {
            const items = ((await axios.get(ops.list())).data.items as any[]).map(item => ToDoItem.fromJSON(item))

            for (const item of items) {
                const response = await doRequest(item.id)

                assert.equal(response.status, 200, "Expected 200 status code")
                assert.equal("status" in response.data, true, "'status' property not found in response JSON")
                assert.equal("ok", response.data.status, "proptery 'status' should have 'ok' value")
                assert.equal("item" in response.data, true, "Missing 'item' property in response")
            }            
        })
    })

    /**
     * Tests for add operation
     */
    define("Test /add", () => {
        const doRequest = (data: any) => axios.put(ops.add(), data)

        it("Operation is defined (should not throw 404)", async () => {
            const response = await doRequest(null)
            assert.notEqual(response.status, 404, "Operation does not match REST specification. Check documentation.")
        })

        it("Should emit 406 status when item has no description", async () => {
            const data = {
                "prop1": "Whatever"
            }
            const response = await doRequest(data)
            assert.equal(response.status, 406, "Expected 406 status with invalid data: " + JSON.stringify(data))
        })

        it("Valid item should be inserted successfully", async () => {
            const data = {
                "description": "A random task in mocha"
            }
            const response = await doRequest(data)
            assert.equal(response.status, 200, "Expected status code 200 when inserting valid item: " + JSON.stringify(data))
        })

        it("Successfull response follows expected structure", async () => {
            const data = {
                "description": "A random task in mocha"
            }
            const response = await doRequest(data)

            assert.equal("status" in response.data, true, "Response should have 'status' property: " + JSON.stringify(response.data))
            assert.equal("ok", response.data.status, "Property 'status' should have 'ok' value: " +  JSON.stringify(response.data))
        })

        it("Successfull insertion increment element count", async () => {
            const respItemsBefore = await axios.get(ops.list())
            
            await doRequest({
                "description": "A random task in mocha"
            })
            
            const respItemsAfter = await axios.get(ops.list())
            const actual = respItemsAfter.data.items.length
            const expected = respItemsBefore.data.items.length + 1

            assert.equal(actual, expected, "Insertion failed to increment element count")
        })
    })

    /**
     * Tests for remove operation
     */
    define("Test /remove", () => {
        const doRequest = (id: number) => axios.delete(ops.remove(id))

        it("Operation is defined (should not throw 404)", async () => {
            const response = await doRequest(-1)

            assert.notEqual(response.status, 404, "Operation does not match REST specification. Check documentation.")
        })

        it("Removing item decrement item count", async () => {
            const respItemsBefore = await axios.get(ops.list())

            await doRequest(respItemsBefore.data.items[0].id)

            const respItensAfter = await axios.get(ops.list())
            const actual = respItensAfter.data.items.length
            const expected = respItemsBefore.data.items.length - 1

            assert.equal(actual, expected, "Removal failed to decrement element count")
        })

        it("After removal, element cannot be found by id", async () => {
            const items = (await axios.get(ops.list())).data.items as ToDoItem[]
            const id = items[0].id
            
            await doRequest(id)

            const response = await axios.get(ops.item(id))

            assert.equal(response.status, 500, "Unexpected response code")
            assert.equal(response.data.status, "failure", `Expected 'failure' but received something else: ${JSON.stringify(response.data)}`)
        })
    })

    /**
     * Tests for update operation
     */
    define("Test /update", () => {
        const doRequest = (data: any) => axios.put(ops.update(), data)

        it("Operation is defined (should not throw 404)", async () => {
            const response = await doRequest({})

            assert.notEqual(response.status, 404, "Operation does not match REST specification. Check documentation.")
        })

        it("Element with no description cannot be updated", async () => {
            const response = await doRequest({})

            assert.equal(response.status, 406, "Unexpected response code")
            assert.equal(response.data.status, "failure", `Expected 'failure' but received something else: ${JSON.stringify(response.data)}`)
        })

        it("Element with invalid id cannot be updated", async () => {
            const response = await doRequest({id: -1, description: "whatever"})

            assert.equal(response.status, 500, "Unexpected response code")
            assert.equal(response.data.status, "failure", `Expected 'failure' but received something else: ${JSON.stringify(response.data)}`)
        })

        it("Element with valid id is consistently updated", async () => {
            const items = (await axios.get(ops.list())).data.items as ToDoItem[]
            const item = ToDoItem.fromJSON(items[0])

            item.description = "a description was changed during update"
            item.deadline = new Date(Date.parse("01/01/2021")).toUTCString()
            item.tags = ["tag5", "tag6", "tag7"]

            await doRequest(item)

            const retrItem = (await axios.get(ops.item(item.id))).data.item

            assert.equal(item?.isEqual(retrItem), true, `Updated item and retrieved item differ: 
                Updated: ${JSON.stringify(item)}
                Retrieved: ${JSON.stringify(retrItem)}`)
        })
    })

    
})