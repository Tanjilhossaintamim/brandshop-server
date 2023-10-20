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
        // await client.connect();
        const brandDb = client.db("brandDb");
        const brandCollection = brandDb.collection('brands');
        const productsCollection = brandDb.collection("products");
        const cartCollection = brandDb.collection('carts');

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

        // products api
        app.get('/products/:brandName', async (req, res) => {
            const brandName = req.params.brandName;
            const filter = { brandName };
            const result = await productsCollection.find(filter).toArray();
            res.send(result);
        });
        app.get('/products/get/:id', async (req, res) => {
            const productId = req.params.id;
            const filter = {
                _id: new ObjectId(productId)
            };
            const result = await productsCollection.findOne(filter);

            res.send(result);
        });
        app.post('/products', async (req, res) => {
            const productInfo = req.body;

            const doc = {
                image: productInfo?.image,
                name: productInfo?.name,
                brandName: productInfo?.brandName,
                type: productInfo?.type,
                price: productInfo?.price,
                description: productInfo?.description,
                rating: productInfo?.rating
            };
            const result = await productsCollection.insertOne(doc);
            res.send(result);

        });
        app.put('/products/update/:id', async (req, res) => {
            const productId = req.params.id;
            const updatedProductInfo = req.body;
            const filter = {
                _id: new ObjectId(productId)
            };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    image: updatedProductInfo?.image,
                    name: updatedProductInfo?.name,
                    brandName: updatedProductInfo?.brandName,
                    type: updatedProductInfo?.type,
                    price: updatedProductInfo?.price,
                    description: updatedProductInfo?.description,
                    rating: updatedProductInfo?.rating
                }
            };
            const result = await productsCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        });
        // product api end
        // shoping cart api
        app.get('/carts/:userEmail', async (req, res) => {
            const userEmail = req.params.userEmail;
            const filter = {
                email: userEmail
            };
            const result = await cartCollection.find(filter).toArray();
            res.send(result);
        });
        app.post('/carts/:id', async (req, res) => {
            const info = req.body;
            const id = req.params.id;
            info.id = id;
            const userEmail = req.body.email;
            const filter = {
                email: userEmail,
                id: req.body.id
            };
            const isAlreadyExists = await cartCollection.findOne(filter);
            if (isAlreadyExists?._id) {
                res.send({ error: "Product Allready exists in your cart !" });
            } else {

                const result = await cartCollection.insertOne(info);
                res.send(result);
            }

        });
        app.delete('/carts/:id', async (req, res) => {
            const productId = req.params.id;
            const query = { _id: new ObjectId(productId) };
            const result = await cartCollection.deleteOne(query);
            res.send(result);
        });
        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
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