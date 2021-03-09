import e from "express"
import * as model from "./model"
import bodyParser from "body-parser"
import { config } from "../conf/config"
import * as dbConnect from "./db-connection"
import cors from "cors"

const app = e()

app.use(cors())

app.get("/:ra/list", async function (req, res) {
    try {
        if (await model.StudentDAO.getInstance().exists(req.params.ra)) {
            res.status(200).json({
                status: "ok",
                items: await model.ToDoItemDAO.getInstance()
                    .listByRa(req.params.ra)
            })
        } else {
            res.status(401).json({
                status: "failure",
                message: "Unknown RA"
            })
        }
    } catch (error) {
        console.error("Failed to list items")
        res.status(500).json({
            status: "failure",
            message: "Internal error. Database query failed."
        })
    }

})

app.post("/:ra/add", bodyParser.json(), async function (req, res) {
    try {
        if (!(await model.StudentDAO.getInstance().exists(req.params.ra))) {
            res.status(401).json({
                status: "failure",
                message: "Unknown RA"
            })
        } else if ("description" in req.body) {
            const toDoItem = new model.ToDoItem(req.body.description,
                req.params.ra)

            if ("tags" in req.body && Array.isArray(req.body.tags)) {
                toDoItem.tags = (req.body.tags as string[]).map(value => value.trim())
                    .filter(value => value.length > 0)
            }
            if ("deadline" in req.body && !isNaN(Date.parse(req.body.deadline))) {
                toDoItem.deadline = new Date(Date.parse(req.body.deadline))
                    .toUTCString()
            }

            const status = await model.ToDoItemDAO.getInstance()
                .insert(toDoItem)

            if (status) {
                res.status(200).json({
                    status: "ok"
                })
            } else {
                res.status(500).json({
                    status: "failure",
                    message: "Failed to insert item"
                })
            }
        } else {
            res.status(406).json({
                status: "failure",
                message: "Invalid data received. Please check documentation.",
                debug: "Received: " + JSON.stringify(req.body)
            })
        }
    } catch (error) {
        console.error("Failed to add item")
        res.status(500).json({
            status: "failure",
            message: "Internal error. Database query failed."
        })
    }
})

app.post("/:ra/update", bodyParser.json(), async function (req, res) {
    try {
        if (!(await model.StudentDAO.getInstance().exists(req.params.ra))) {
            res.status(401).json({
                status: "failure",
                message: "Unknown RA"
            })
        } else if ("description" in req.body) {
            const toDoItem = new model.ToDoItem(req.body.description,
                req.params.ra)
            
            if ("id" in req.body) {
                toDoItem.id = parseInt(req.body.id)
            }
            if ("tags" in req.body && Array.isArray(req.body.tags)) {
                toDoItem.tags = (req.body.tags as string[]).map(value => value.trim())
                    .filter(value => value.length > 0)
            }
            if ("deadline" in req.body && !isNaN(Date.parse(req.body.deadline))) {
                toDoItem.deadline = new Date(Date.parse(req.body.deadline))
                    .toUTCString()
            }

            const status = await model.ToDoItemDAO.getInstance()
                .update(toDoItem)

            if (status) {
                res.status(200).json({
                    status: "ok"
                })
            } else {
                res.status(500).json({
                    status: "failure",
                    message: "Failed to update item"
                })
            }
        } else {
            res.status(406).json({
                status: "failure",
                message: "Invalid data received. Please check documentation.",
                debug: "Received: " + JSON.stringify(req.body)
            })
        }
    } catch (error) {
        console.error("Failed to update item")
        res.status(500).json({
            status: "failure",
            message: "Internal error. Database query failed."
        })
    }
})

app.get("/:ra/remove/:id", async (req, res) => {
    try {
        if (!(await model.StudentDAO.getInstance().exists(req.params.ra))) {
            res.status(401).json({
                status: "failure",
                message: "Unknown RA"
            })
        } else {
            const id = parseInt(req.params.id)
            const status = model.ToDoItemDAO.getInstance().removeById(id)

            if (status) {
                res.status(200).json({
                    status: "ok"
                })
            } else {
                res.status(500).json({
                    status: "failure",
                    message: "Failed to remove item"
                })
            }
        }
    } catch(error) {
        console.error("Failed to remove item")
        res.status(500).json({
            status: "failure",
            message: "Internal error. Database query failed."
        })
    }
})

app.get("/:ra/item/:id", async (req, res) => {
    try {
        if (!(await model.StudentDAO.getInstance().exists(req.params.ra))) {
            res.status(401).json({
                status: "failure",
                message: "Unknown RA"
            })
        } else {
            const id = parseInt(req.params.id)
            const item = await model.ToDoItemDAO.getInstance().findById(id)

            res.status(200).json({
                status: "ok",
                item: item
            })
        }
    } catch(error) {
        console.error("Failed to get item by id")
        res.status(500).json({
            status: "failure",
            message: "Internal error. Could not find item with the given id"
        })
    }
})

app.use(function (err: Error, req: e.Request, res: e.Response,
    next: e.NextFunction) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

app.use(function (req, res) {
    res.status(404).json({
        status: "failure",
        message: "Unknown operation"
    })
});



/**
 * OS signal handling
 * Automatic saving of the data model to disk
 * when the server shuts down
 */
process.once('exit', (code) => {
    console.log(`Server exiting with code ${code}...`)
    dbConnect.disconnect().then(() => {
        console.log(`Server exited`)
    })
})

function exitHandler() {
    process.exit()
}

process.once("SIGINT", exitHandler)
process.once("SIGUSR2", exitHandler)

const port = process.env.PORT || config["server-port"]

app.listen(port, () => {
    dbConnect.connect().then(() => {
        console.log(`ToDo! server Listening on port ${port}`)
    })
})