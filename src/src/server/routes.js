import notificacionesRoutes from "../modules/notificaciones/routes/notificacionesRoutes.js";
import reportesRoutes from "../modules/reportes/routes/reportesRoutes.js";
import dashboardRoutes from "../modules/dashboard/routes/dashboardRoutes.js";

router.use("/notificaciones", notificacionesRoutes);
router.use("/reportes", reportesRoutes);
router.use("/dashboard", dashboardRoutes);
