import "reflect-metadata";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { DataSource } from "typeorm";
import { Scooter } from "./models/Scooter";
import { Rental } from "./models/Rental";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

// Параметры подключения к БД (Берутся из .env или из docker-compose)
const dbHost = process.env.DB_HOST || "postgres";
const dbPort = Number(process.env.DB_PORT) || 5432;
const dbUser = process.env.DB_USER || "postgres";
const dbPassword = process.env.DB_PASSWORD || "postgrespassword";
const dbName = process.env.DB_NAME || "scooter_crm";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  host: process.env.DATABASE_URL ? undefined : dbHost,
  port: process.env.DATABASE_URL ? undefined : dbPort,
  username: process.env.DATABASE_URL ? undefined : dbUser,
  password: process.env.DATABASE_URL ? undefined : dbPassword,
  database: process.env.DATABASE_URL ? undefined : dbName,
  synchronize: true, // Использовать только для прототипа/дев-среды
  logging: false,
  entities: [Scooter, Rental],
});

// Функция регистрации маршрутов API
const setupRoutes = () => {
  const scooterRepo = AppDataSource.getRepository(Scooter);
  const rentalRepo = AppDataSource.getRepository(Rental);

  // --- 1. Аналитика ---
  app.get("/api/analytics", async (req, res) => {
    try {
      const total = await scooterRepo.count();
      const available = await scooterRepo.count({ where: { status: "available" } });
      const inUse = await scooterRepo.count({ where: { status: "in_use" } });
      const maintenance = await scooterRepo.count({ where: { status: "maintenance" } });
      const offline = await scooterRepo.count({ where: { status: "offline" } });
      
      const activeRentals = await rentalRepo.count({ where: { status: "active" } });

      const avgBatteryRaw = await scooterRepo.createQueryBuilder("scooter")
        .select("AVG(scooter.batteryLevel)", "avg")
        .getRawOne();

      res.json({
        statuses: { available, inUse, maintenance, offline, total },
        activeRentals,
        avgBattery: Math.round(avgBatteryRaw?.avg || 0),
      });
    } catch (err) {
      res.status(500).json({ message: "Ошибка получения аналитики", error: err });
    }
  });

  // --- 2. Управление самокатами ---
  app.get("/api/scooters", async (req, res) => {
    try {
      const scooters = await scooterRepo.find();
      res.json(scooters);
    } catch (err) {
      res.status(500).json({ message: "Ошибка получения списка самокатов" });
    }
  });

  app.post("/api/scooters", async (req, res) => {
    try {
      const scooter = scooterRepo.create(req.body);
      await scooterRepo.save(scooter);
      io.emit("scooter_updated", scooter);
      res.status(201).json(scooter);
    } catch (err) {
      res.status(500).json({ message: "Ошибка создания самоката" });
    }
  });

  app.put("/api/scooters/:id", async (req, res) => {
    try {
      await scooterRepo.update(req.params.id, req.body);
      const updated = await scooterRepo.findOneBy({ id: Number(req.params.id) });
      io.emit("scooter_updated", updated);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Ошибка обновления самоката" });
    }
  });

  app.delete("/api/scooters/:id", async (req, res) => {
    try {
      await scooterRepo.delete(req.params.id);
      io.emit("scooter_deleted", req.params.id);
      res.sendStatus(204);
    } catch (err) {
      res.status(500).json({ message: "Ошибка удаления самоката" });
    }
  });

  // --- 3. Управление арендами ---
  app.get("/api/rentals", async (req, res) => {
    try {
      const rentals = await rentalRepo.find({ relations: ["scooter"] });
      res.json(rentals);
    } catch (err) {
      res.status(500).json({ message: "Ошибка получения аренд" });
    }
  });

  app.post("/api/rentals", async (req, res) => {
    try {
      const { scooterId, userName, userPhone } = req.body;
      const scooter = await scooterRepo.findOneBy({ id: scooterId });
      
      if (!scooter || scooter.status !== "available") {
        return res.status(400).json({ message: "Самокат недоступен для аренды" });
      }

      scooter.status = "in_use";
      await scooterRepo.save(scooter);

      const rental = rentalRepo.create({ scooter, userName, userPhone, status: "active" });
      await rentalRepo.save(rental);

      io.emit("scooter_updated", scooter);
      res.status(201).json(rental);
    } catch (err) {
      res.status(500).json({ message: "Ошибка создания аренды" });
    }
  });

  app.post("/api/rentals/:id/complete", async (req, res) => {
    try {
      const rental = await rentalRepo.findOne({ where: { id: Number(req.params.id) }, relations: ["scooter"] });
      if (!rental || rental.status === "completed") {
        return res.status(400).json({ message: "Аренда не найдена или уже завершена" });
      }

      rental.status = "completed";
      rental.endTime = new Date();
      await rentalRepo.save(rental);

      if (rental.scooter) {
        rental.scooter.status = "available";
        await scooterRepo.save(rental.scooter);
        io.emit("scooter_updated", rental.scooter);
      }

      res.json(rental);
    } catch (err) {
      res.status(500).json({ message: "Ошибка завершения аренды" });
    }
  });
};

// Функция повторных попыток подключения к БД
const connectWithRetry = async () => {
  try {
    console.log("Попытка подключения к PostgreSQL...");
    await AppDataSource.initialize();
    console.log("✅ PostgreSQL Connected");

    setupRoutes();

    const PORT = process.env.PORT || 5000;
    server.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Ошибка подключения к базе данных, повторная попытка через 3 секунды...", err);
    setTimeout(connectWithRetry, 3000);
  }
};

connectWithRetry();