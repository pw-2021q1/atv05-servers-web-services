"use strict";
// /myFirstDatabase?retryWrites=true&w=majority
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.config = {
    "server-port": 3000,
    "db": {
        // "url": "mongodb://localhost:27017",
        "url": "mongodb+srv://mongodev:kh17wnrg2cFWoI12@cluster0.yifvq.mongodb.net",
        "name": "todo-spa",
        "collections": {
            "todo-items": "todo-items",
            "students": "students",
            "sequences": "sequences"
        }
    }
};
