const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
require('dotenv').config();
const app = express();
// middlewares
app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.send('brand shop server is running !');
});



const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.kkcmbk1.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const brandCollection = client.db("brandDb").collection('brands');

        //brand api

        app.get("/brands", async (req, res) => {
            const result = await brandCollection.find().toArray();
            res.send(result);
        });

        app.get("/brands/:id", async (req, res) => {
            const brandId = req.params.id;
            const filter = { _id: new ObjectId(brandId) };
            const result = await brandCollection.findOne(filter);
            res.send(result);
        });

        app.post('/brands', async (req, res) => {
            const brandInfo = req.body;
            const doc = {
                brandName: brandInfo?.brandName,
                image: brandInfo?.image
            };
            const result = await brandCollection.insertOne(doc);
            res.send(result);
        });
        ////////brand api end
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`server running on port:${port}`);
});