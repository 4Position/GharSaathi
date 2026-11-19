const express = require("express");
const cors = require("cors");
const env = require("./config/env");
const healthRoutes = require("./routes/health.routes");
const authRoutes = require("./routes/auth.routes");
const propertyRoutes = require("./routes/property.routes");
const applicationRoutes = require("./routes/application.routes");
const leaseRoutes = require("./routes/lease.routes");
const paymentRoutes = require("./routes/payment.routes");
const maintenanceRoutes = require("./routes/maintenance.routes");
const notFound = require("./middleware/not-found");
const errorHandler = require("./middleware/error-handler");

const app = express();

app.use(cors({ origin: env.clientUrl }));
app.use(express.json());

app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/leases", leaseRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/maintenance", maintenanceRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
