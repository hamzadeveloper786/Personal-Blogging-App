import { MongoClient, ServerApiVersion } from 'mongodb';
const uri = "mongodb+srv://crudmongo:crudmongo@cluster0.o7vesgs.mongodb.net/?retryWrites=true&w=majority";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
export const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        console.log("Successfully connected to Atlas");
    } catch (err) {
        console.log(err);
        await client.close();
        process.exit(1)
    }
}
run().catch(console.dir);

process.on('SIGINT', async function () {
    console.log("app is terminating");
    await client.close();
    process.exit(0);
});
// function getGreeting() {
//     const currentTime = new Date();
//     const currentHour = currentTime.getHours();

//     let greeting;

//     if (currentHour < 12) {
//         greeting = 'Good morning';
//     } else if (currentHour < 18) {
//         greeting = 'Good afternoon';
//     } else {
//         greeting = 'Good evening';
//     }

//     return greeting;
// }

// const greeting = getGreeting();
// day.innerText = greeting + " !"