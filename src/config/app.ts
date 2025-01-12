import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import DatabaseService from "./db";
import YAML from "yamljs";
import path from "path";
import SwaggerUI from "swagger-ui-express";
import { AuthRoutes } from "../routes/auth.routes";
import RedisService from "../utils/redis";
import { UserRoutes } from "../routes/user.routes";

dotenv.config();

class App {
  public app: Application;
  private dbSetup: DatabaseService = new DatabaseService();
  private redisSetup = RedisService;
  private docs: any = YAML.load(path.join(__dirname, "../../src/docs.yaml"));
  //Routes Invocations
  private authRoute: AuthRoutes = new AuthRoutes();
  private userRoutes: UserRoutes = new UserRoutes();

  constructor() {
    this.app = express();
    this.dbSetup.databaseConnection();
    this.redisSetup;
    this.config();
    this.routes();
  }

  private config(): void {
    this.app.use(
      cors({
        origin: "*",
        methods: "GET,POST,PUT,DELETE,PATCH",
        credentials: true,
      })
    );
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use("/api/v1/docs", SwaggerUI.serve, SwaggerUI.setup(this.docs));
  }

  private routes(): void {
    this.authRoute.route("/api/v1/auth", this.app);
    this.userRoutes.route("/api/v1/user", this.app);

    this.app.get("/", (req: Request, res: Response) => {
      res.status(200).json({
        status: true,
        message: "Welcome to Home Page",
      });
    });
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({
        status: false,
        message: "Route not found",
      });
    });
  }
}

export const PORT = process.env.PORT;

export default new App().app;
