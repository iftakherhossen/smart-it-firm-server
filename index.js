const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const fileUpload = require('express-fileupload');

const app = express();

const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use((req, res, next) => {
    res.header({ "Access-Control-Allow-Origin": "http://localhost:3000/" });
    next();
}) 
app.use(express.json());
app.use(fileUpload());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wk6ov.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        console.log('database connected!')
        const database = client.db('smartITfirm');
        const servicesCollection = database.collection('services');
        const reviewsCollection = database.collection('reviews');
        const projectsCollection = database.collection('projects');
        const teamCollection = database.collection('team');
        const usersCollection = database.collection('users');
        const ordersCollection = database.collection('orders');


        // GET Services API
        app.get('/services', async (req, res) => {
            const cursor = servicesCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        })

        // POST Service API
        app.post('/services', async (req, res) => {
            const name = req.body.name;
            const description = req.body.description;
            const img = req.files.image;
            const imgData = img.data;
            const encodedImg = imgData.toString('base64');
            const imgBuffer = Buffer.from(encodedImg, 'base64');
            const service = {
                name,
                description,
                image: imgBuffer
            }
            const result = await servicesCollection.insertOne(service);
            res.json(result);
        });

        // GET Single Review API 
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await servicesCollection.findOne(query);
            res.json(service);
        })

        // PUT Hidden Info to a Single Review 
        app.put('/services/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const updateStatus = { $set: { available: false } };
            const result = await servicesCollection.updateOne(filter, updateStatus);
            res.json(result);
        })

        // GET Project API
        app.get('/projects', async (req, res) => {
            const cursor = projectsCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        })

        // POST Project API
        app.post('/projects', async (req, res) => {
            const title = req.body.title;
            const img = req.files.image;
            const imgData = img.data;
            const encodedImg = imgData.toString('base64');
            const imgBuffer = Buffer.from(encodedImg, 'base64');
            const service = {
                title,
                image: imgBuffer
            }
            const result = await projectsCollection.insertOne(service);
            res.json(result);
        });

        // GET Team API
        app.get('/team', async (req, res) => {
            const cursor = teamCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        })

        // POST Team API
        app.post('/team', async (req, res) => {
            const img = req.files.image;
            const imgData = img.data;
            const encodedImg = imgData.toString('base64');
            const imgBuffer = Buffer.from(encodedImg, 'base64');
            const service = {
                image: imgBuffer
            }
            const result = await teamCollection.insertOne(service);
            res.json(result);
        });

        // DELETE Single Team API
        app.delete('/team/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await teamCollection.deleteOne(query);
            res.json(result);
        })

        // GET Reviews API
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const result = await cursor.toArray();
            res.send(result)
        })

        // GET Single Review API 
        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const review = await reviewsCollection.findOne(query);
            res.json(review);
        })

        // PUT Hidden Info to a Single Review 
        app.put('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const updateStatus = { $set: { hidden: true } };
            const result = await reviewsCollection.updateOne(filter, updateStatus);
            res.json(result);
        })

        // POST Reviews API
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.json(result)
        })

        // GET Users API
        app.get('/users', async (req, res) => {
            const cursor = usersCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        })

        // GET Single User API 
        app.get('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const user = await usersCollection.findOne(query);
            res.json(user);
        })

        // POST Users API
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        })

        // Update Users API
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        })

        // GET Users API for Admin Role
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin })
        })

        // PUT Admin API
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

        // PUT Designation to a single User API 
        // app.put('/users/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const text = req.body;
        //     const filter = { _id: ObjectId(id) };
        //     const updateStatus = { $set: { designation: text } };
        //     const result = await reviewsCollection.updateOne(filter, updateStatus);
        //     res.json(result);
        // })

        // GET Orders API
        app.get('/orders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const result = await cursor.toArray();
            res.send(result)
        })
        
        // POST Orders API
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.json(result);
        })

        // GET Orders API with Email for Specific User
        app.get('/orders/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const cursor = ordersCollection.find(query);
            const order = await cursor.toArray();
            res.json(order);
        })

        // GET Single Order API 
        // app.get('/orders/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: ObjectId(id) };
        //     const order = await ordersCollection.findOne(query);
        //     res.json(order);
        // })

        // PUT Status Info to a Single Appointment 
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const updateStatus = { $set: { status: true } };
            const result = await ordersCollection.updateOne(filter, updateStatus);
            res.json(result);
        })

        // PUT Payment Status Info to a Single Appointment 
        app.put('/orders/paymentStatus/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const updateStatus = { $set: { paymentStatus: true } };
            const result = await ordersCollection.updateOne(filter, updateStatus);
            res.json(result);
        })

        // DELETE Single Order API
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.json(result);
        })
    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running Smart IT Firm Server')
})

app.listen(port, () => {
    console.log('listening to the port', port)
})