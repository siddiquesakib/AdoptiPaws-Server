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
    const usersColl = db.collection("users");
    const donationsColl = db.collection("donations");
    const adoptionRequestsColl = db.collection("adoptionRequests");

    // Users Routes
    app.get("/users", async (req, res) => {
      const result = await usersColl.find().toArray();
      res.send(result);
    });

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      console.log("Fetching user by email:", email);
      const query = { email: email };
      const result = await usersColl.findOne(query);
      console.log("User found:", result ? "Yes" : "No");
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      console.log("Attempting to create user:", user.email);
      const query = { email: user.email };
      const existingUser = await usersColl.findOne(query);

      if (existingUser) {
        console.log("User already exists:", user.email);
        return res.send({ message: "User already exists", insertedId: null });
      }

      const result = await usersColl.insertOne(user);
      console.log("User created successfully:", user.email);
      res.send(result);
    });

    app.patch("/users/:id", async (req, res) => {
      const { id } = req.params;
      const { role } = req.body;
      const objectid = new ObjectId(id);

      const update = {
        $set: { role: role },
      };

      const result = await usersColl.updateOne({ _id: objectid }, update);
      res.send(result);
    });

    app.delete("/users/:id", async (req, res) => {
      const { id } = req.params;
      const objectid = new ObjectId(id);
      const result = await usersColl.deleteOne({ _id: objectid });
      res.send(result);
    });

    // Donations Routes
    app.get("/donations", async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.email = email;
      }
      const result = await donationsColl.find(query).toArray();
      res.send(result);
    });

    app.post("/donations", async (req, res) => {
      const data = req.body;
      const result = await donationsColl.insertOne(data);
      res.send(result);
    });

    app.patch("/donations/:id", async (req, res) => {
      const { id } = req.params;
      const objectid = new ObjectId(id);
      const updateData = req.body;

      const update = {
        $set: updateData,
      };

      const result = await donationsColl.updateOne({ _id: objectid }, update);
      res.send(result);
    });

    app.delete("/donations/:id", async (req, res) => {
      const { id } = req.params;
      const objectid = new ObjectId(id);
      const result = await donationsColl.deleteOne({ _id: objectid });
      res.send(result);
    });

    // Adoption Requests Routes
    app.get("/adoption-requests", async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.ownerEmail = email; // Owner's email who listed the pet
      }
      const result = await adoptionRequestsColl.find(query).toArray();
      res.send(result);
    });

    app.post("/adoption-requests", async (req, res) => {
      const data = req.body;
      const result = await adoptionRequestsColl.insertOne(data);
      res.send(result);
    });

    app.patch("/adoption-requests/:id", async (req, res) => {
      const { id } = req.params;
      const { status } = req.body;
      const objectid = new ObjectId(id);

      const update = {
        $set: { status: status },
      };

      const result = await adoptionRequestsColl.updateOne(
        { _id: objectid },
        update
      );
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

    app.get("/pets", async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.email = email;
      }
      const result = await listingsColl.find(query).toArray();
      res.send(result);
    });

    app.delete("/pets/:id", async (req, res) => {
      const { id } = req.params;
      const objectid = new ObjectId(id);
      const result = await listingsColl.deleteOne({ _id: objectid });

      res.send(result);
    });

    app.patch("/pets/:id", async (req, res) => {
      const { id } = req.params;
      const objectid = new ObjectId(id);

      const updateUser = req.body;

      const update = {
        $set: {
          name: updateUser.name,
          category: updateUser.category,
          price: updateUser.price,
          location: updateUser.location,
          description: updateUser.description,
          image: updateUser.image,
          email: updateUser.email,
          date: updateUser.date,
        },
      };

      const options = {};
      const result = await listingsColl.updateOne(
        { _id: objectid },
        update,
        options
      );

      res.send(result);
    });

    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
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
