import e from "express"
import cors from "cors"
import * as path from "path"
import { ToDoItemService } from "./service"
import { Database } from "./database"
import { ValidationError } from "./model"

/**
 * Database and service should be instantiate only once for
 * the whole application
 */
const database = new Database()
const service = new ToDoItemService(database)

const app = e()

/**
 * router for all api calls
 */
const api = e.Router()

app.use(cors())
// register /api path to api calls
app.use("/api", api)
// register /doc path to service documentation page
app.use("/doc", e.static(path.join(__dirname, "..", "static", "doc")))
// register /client path to the spa client
app.use("/client", e.static(path.join(__dirname, "..", "static", "client")))
// register website icon
app.use("/favicon.ico", e.static(path.join(__dirname, "..", "static", "favicon.ico")))

/**
 * Item list route
 */
api.get("/list", async (req, res) => {
    try {
        res.status(200).json({
            status: "ok",
            items: await service.list()
        })
    } catch (error) {
        res.status(500).json({
            status: "failure",
            message: "Internal error. Database query failed."
        })
    }
})

/**
 * Item insertion route
 */
api.put("/add", e.json(), async (req, res) => {
    try {
        await service.add(req.body)
        res.status(200).json({
            status: "ok"
        })
    } catch(error) {
        if (error instanceof ValidationError) {
            res.status(406).json({
                status: "failure",
                message: "Invalid data received. Please check documentation.",
                debug: "Received: " + JSON.stringify(req.body)
            })
        } else {
            res.status(500).json({
                status: "failure",
                message: "Internal error. Failed to insert item."
            })
        }
    } 
})

/**
 * TODO: implementar rota de update
 */

/**
 * TODO: implementar rota de recuperacao de um item pelo id
 */

/**
 * TODO: implementar rota de remocao de um item pelo id
 */

/**
 * Error handling middleware
 */
app.use(function (err: Error, req: e.Request, res: e.Response,
    next: e.NextFunction) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

/**
 * 404 middleware
 */
app.use(function (req, res) {
    res.status(404).json({
        status: "failure",
        message: "Unknown operation"
    })
});

/**
 * coordinate web and db servers
 * using OS signal handling
 */
async function exitHandler() {
    console.log(`Server exiting...`)
    await database.disconnect()
    console.log("Server exited")
    process.exit()
}

process.once("SIGINT", exitHandler)
process.once("SIGUSR2", exitHandler)

const port = process.env.PORT || 3000

app.listen(port, () => {
    database.connect().then(() => {
        console.log(`ToDo! server Listening on port ${port}`)
    })
})