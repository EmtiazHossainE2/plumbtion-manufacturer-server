//1
const express = require('express');
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000

//3
const cors = require('cors')
require('dotenv').config()

//4
app.use(cors())
app.use(express.json())

//5 

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
        const ordersCollection = client.db("plumbtion-manufacturer").collection("orders");

        //8 get tool 
        app.get('/tool' , async(req,res) => {
            const query = {}
            const tools = await toolsCollection.find(query).toArray()
            res.send(tools)
        })

        //9 get single tool 
        app.get('/tool/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const tool = await toolsCollection.findOne(query)
            res.send(tool)
        })

        //10 get orders
        app.post('/order' , async(req,res) => {
            const order = req.body 
            const result = await ordersCollection.insertOne(order)
            res.send(result)
        })

        //11 available tool (pipe) update
        app.put('/tool/:id', async (req, res) => {
            const id = req.params.id
            const updateTool = req.body
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    available: updateTool.available,
                },
            };
            const result = await toolsCollection.updateOne(filter, updateDoc, options);
            res.send(result)
        })





        // get reviews 
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