import * as path from "path"

export const config = {
    "server-port": 3000,
    "db": {
        "url": "mongodb://localhost:27017",
        "name": "todo-spa", 
        "collections": {
            "todo-items": "todo-items",
            "students": "students",
            "sequences": "sequences"
        }
    }
}
