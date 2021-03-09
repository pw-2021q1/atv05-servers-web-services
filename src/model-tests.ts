import * as dbConnect from "./db-connection"
import * as model from "./model"

const toDoItems = [
    new model.ToDoItem(
        "do something", 
        "123"),
    new model.ToDoItem(
        "do something else",
        "456")
]

toDoItems[0].tags = ["tag1, tag2"]
toDoItems[1].tags = ["tag3, tag4"]

async function testInsert() {
    for (const toDoItem of toDoItems) {
        const status = 
            await model.ToDoItemDAO.getInstance().insert(toDoItem)

        console.log('Inserting element.');
        console.log(`Status: ${status}`);
    }
}

async function testList() {
    const toDoItems = await model.ToDoItemDAO.getInstance().listAll()

    console.log('Listing all elements')
    console.log(toDoItems)
}

async function testFindById() {
    const idSuccess = 2
    const idFailure = 1000

    console.log("Positive test: ")

    const profile = await model.ToDoItemDAO
        .getInstance().findById(idSuccess)

    console.log('Restrieved profile: ');
    console.log(profile);

    console.log("Negative test: ")

    try {
        const profile = await model.ToDoItemDAO
            .getInstance().findById(idFailure)

        console.log('Restrieved profile: ');
        console.log(profile);
    } catch(error) {
        throw Error("Expected error thrown. Passed.")
    }
}

async function testUpdate() {
    const id = 2

    console.log(`Retrieving profile id ${id}`)

    const profile = await model.ToDoItemDAO
        .getInstance().findById(id)
    
    console.log("Positive case: ")
    
    profile.description = "I changed this description"
    console.log(`Updating profile id ${id}`)
    
    const statusPositive = await model.ToDoItemDAO.getInstance().update(profile)

    console.log(`Status: ${statusPositive}`)

    console.log("Negative case: ")

    profile.id = 2000
    console.log(`Updating profile id ${id}`)
    
    const statusNegative = await model.ToDoItemDAO.getInstance().update(profile)

    console.log(`Status: ${statusNegative}`)
}

async function testRemove() {
    const idPositive = 3
    const idNegative = 2000
    
    console.log("Positive case: ")
    
    console.log(`Removing profile id ${idPositive}`)
    
    const statusPositive = await model.ToDoItemDAO.getInstance()
        .removeById(idPositive)

    console.log(`Status: ${statusPositive}`)

    console.log("Negative case: ")

    console.log(`Removing profile id ${idNegative}`)
    
    const statusNegative = await model.ToDoItemDAO.getInstance()
        .removeById(idNegative)

    console.log(`Status: ${statusNegative}`)
}

async function main() {
    try {
        await dbConnect.connect()

        // await testInsert()
        // await testList()
        // await testFindById()
        // await testUpdate()
        await testRemove()
    } catch (error) {
        console.log(error)
    } finally {
        await dbConnect.disconnect()
    }
}

main()
