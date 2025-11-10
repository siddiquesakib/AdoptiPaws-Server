const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;
require("dotenv").config();

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASS}@simple-crud-server.tdeipi8.mongodb.net/?appName=simple-crud-server`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const db = client.db("AdoptiPaws-server");
    const listingsColl = db.collection("listings");
    const orderColl = db.collection("OrderColl");

    app.get("/pets", async (req, res) => {
      const result = await listingsColl.find().toArray();

      res.send(result);
    });

    app.get("/latest-pets", async (req, res) => {
      const result = await listingsColl
        .find()
        .sort({ date: -1 })
        .limit(6)
        .toArray();

      res.send(result);
    });

    app.get("/pets/:id", async (req, res) => {
      const { id } = req.params;
      const objectid = new ObjectId(id);
      const result = await listingsColl.findOne({ _id: objectid });

      res.send(result);
    });

    app.post("/pets", async (req, res) => {
      const data = req.body;
      // console.log(data)
      const result = await listingsColl.insertOne(data);
      res.send(result);
    });

    app.post("/orders", async (req, res) => {
      const data = req.body;
      const result = await orderColl.insertOne(data);

      res.send(result);
    });

    app.get("/orders", async (req, res) => {
      const email = req.query.email;
      const query = {};

      if (email) {
        query.buyer_email = email;
      }

      const result = await orderColl.find(query).toArray();
      res.send(result);
    });

    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
