import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import { moviesRouter } from "./routes/MoviesRouter";
import { categoriesRouter } from "./routes/CategoriesRouter";
import * as cors from "cors";

// Initialize firebase in order to access its services
admin.initializeApp(functions.config().firebase);

// initialize the database
const db = admin.firestore();

// initialize express server
const app = express();

app.use(cors());
app.use(express.json());
app.use("/v1/movies", moviesRouter(db));
app.use("/v1/categories", categoriesRouter(db));

// define google cloud function name and region
export const api = functions.region("europe-west3").https.onRequest(app);
