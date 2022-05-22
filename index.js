//1
const express = require('express');
const app = express()
const port = process.env.PORT || 5000

//3
const cors = require('cors')
require('dotenv').config()

//4
app.use(cors())
app.use(express.json())

//5 

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.emoo7.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// console.log(uri);

//6
async function run() {
    try {
        //7
        await client.connect();
        const toolsCollection = client.db("plumbtion-manufacturer").collection("tools");
        const reviewsCollection = client.db("plumbtion-manufacturer").collection("reviews");

        //8 get tool 
        app.get('/tool' , async(req,res) => {
            const query = {}
            const tools = await toolsCollection.find(query).toArray()
            res.send(tools)
        })
        //9 get reviews 
        app.get('/review' , async(req,res) => {
            const query = {}
            const reviews = await reviewsCollection.find(query).toArray()
            res.send(reviews)
        })

    }
    finally {
        //   await client.close();
    }
}
run().catch(console.dir);



//2
app.get('/', (req, res) => {
    res.send('Plumbtion server is running')
})

app.listen(port, () => {
    console.log('server running on ', port);
})