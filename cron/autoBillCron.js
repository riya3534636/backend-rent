import cron from "node-cron";
import Property from "../models/Property.js";
import Bill from "../models/Bill.js";
import Agreement from "../models/Agreement.js";

export const startAutoBillCron = () => {
  // Runs on 1st day of every month at 12:05 AM
  cron.schedule("* * * * *", async () => {
    console.log("🔁 Auto bill creation started");

    const now = new Date();
    const month = now.toLocaleString("default", { month: "long" });
    const year = now.getFullYear();

    try {
      // 1️⃣ Get all occupied properties with tenant
      const properties = await Property.find({
        Status: "occupied",
        tenant: { $ne: null },
      });

      for (const property of properties) {
        // 2️⃣ Prevent duplicate bill
        const billExists = await Bill.findOne({
          property: property._id,
          month,
          year,
        });

        if (billExists) continue;

        // 3️⃣ Calculate due date (example: 5th of month)
        const dueDate = new Date(year, now.getMonth(), 5);

        // 4️⃣ Create bill
        await Bill.create({
          owner: property.ownerId,
          property: property._id,
          tenant: property.tenant,

          month,
          year,

          rentAmount: property.rent,
          waterAmount: Agreement.waterCharge,
          electricUnits: 0,
          electricityAmount: 0,

          totalAmount: property.rent,
          dueDate,

          status: "Pending",
          pendingPeriod: 0,
          overdueFee: 0,
          isDefaultPaid: false,
          autoPayAttempts: 0,
        });

        console.log(`✅ Bill created for property ${property._id}`);
      }
    } catch (error) {
      console.error("❌ Auto bill cron error", error);
    }
  });
};