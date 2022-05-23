//1
const express = require('express');
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000
const jwt = require('jsonwebtoken');

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


//14 jwt 
const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized Access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden Access' });
        }
        req.decoded = decoded;
        next();
    })
}





//6
async function run() {
    try {
        //7
        await client.connect();
        const toolsCollection = client.db("plumbtion-manufacturer").collection("tools");
        const reviewsCollection = client.db("plumbtion-manufacturer").collection("reviews");
        const ordersCollection = client.db("plumbtion-manufacturer").collection("orders");
        const usersCollection = client.db("plumbtion-manufacturer").collection("users");


        // 18 ( middleware ) verify admin 
        const verifyAdmin = async (req, res, next) => {
            const requester = req.decoded.email
            const requesterAccount = await usersCollection.findOne({ email: requester })
            if (requesterAccount.role === 'admin') {
                next()
            }
            else {
                res.status(403).send({ message: 'Forbidden Access' });
            }
        }

        // ***    Tools (pipes)        **//

        //8 get tool 
        app.get('/tool', async (req, res) => {
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
        app.post('/order', async (req, res) => {
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

        
        
        // ***    Order        **//

        //12 read my orders (get)
        app.get('/order',verifyJWT, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email
            if (email === decodedEmail) {
                const query = { email: email };
                const orders = await ordersCollection.find(query).toArray();
                res.send(orders);
            }
            else {
                return res.status(403).send({ message: 'Forbidden Access' });
            }

        })

        //13 delete my order
        app.delete('/order/:email', async (req, res) => {
            const email = req.params.email
            const filter = { email: email }
            const result = await ordersCollection.deleteOne(filter)
            res.send(result)
        })



        // ***    User        **//

        //15  user create or update 
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const user = req.body;
            const options = { upsert: true }
            const updateDoc = {
                $set: user
            };
            const result = await usersCollection.updateOne(filter, updateDoc, options)
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN, { expiresIn: '1d' })
            res.send({ result, token })
        })

        //16 get users 
        app.get('/user',verifyJWT, async (req, res) => {
            const users = await usersCollection.find().toArray()
            res.send(users)
        })

        //17 make admin 
        app.put('/user/admin/:email', verifyJWT, verifyAdmin, async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const updateDoc = {
                $set: {role : 'admin'}
            };
            const result = await usersCollection.updateOne(filter, updateDoc)
            res.send(result)
        })

        app.put('/user/user/:email', verifyJWT, verifyAdmin, async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const updateDoc = {
                $set: {role : 'user'}
            };
            const result = await usersCollection.updateOne(filter, updateDoc)
            res.send(result)
        })

        // 19 check admin
        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email
            const user = await usersCollection.findOne({ email: email })
            const isAdmin = user?.role === 'admin'
            res.send({ admin: isAdmin })
        })

        //20 delete user/admin
        app.delete('/user/:email', verifyJWT, verifyAdmin, async (req, res) => {
            const email = req.params.email
            const filter = {email : email}
            const result = await usersCollection.deleteOne(filter)
            res.send(result)
        })



        // ***    Review        **//

        // get reviews 
        app.get('/review', async (req, res) => {
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