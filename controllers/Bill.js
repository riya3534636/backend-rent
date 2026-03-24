import Bill from "../models/Bill.js";
import Agreement from "../models/Agreement.js";
import Property from "../models/Property.js"
import mongoose from "mongoose";
import Tenant from "../models/Tenant.js"


export const createBill = async (req, res) => {
  try {
    const {
      propertyId,
      month,
      year,
      electricUnits,
      electricityAmount,
      dueDate,
    } = req.body;

    const ownerId = req.userId;

    // 1️⃣ Get property + tenant
    const property = await Property.findById(propertyId).populate("tenant");

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    if (!property.tenant) {
      return res
        .status(400)
        .json({ message: "No tenant assigned to this property" });
    }

    // 2️⃣ Prevent duplicate bill for same month/year
    const existingBill = await Bill.findOne({
      property: propertyId,
      month,
      year,
    });

    if (existingBill) {
      return res.status(400).json({
        message: "Bill already exists for this month",
      });
    }

    // 3️⃣ Fixed + derived values
    const rentAmount = property.rent;
    const waterAmount = 300; // fixed (you can change)
    const totalAmount =
      rentAmount + waterAmount + (electricityAmount || 0);

    // 4️⃣ Create bill
    const bill = await Bill.create({
      owner: ownerId,
      property: property._id,
      tenant: property.tenant._id,

      month,
      year,

      rentAmount,
      waterAmount,
      electricUnits: electricUnits || 0,
      electricityAmount: electricityAmount || 0,

      totalAmount,
      dueDate,

      status: "Pending",
      pendingPeriod: 0,
      overdueFee: 0,

      isDefaultPaid: false,
      autoPayAttempts: 0,
    });

    res.status(201).json({
      success: true,
      bill,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to create bill",
    });
  }
};


export const manualGenerateBills = async (req, res) => {
  const now = new Date();
  const month = now.toLocaleString("default", { month: "long" });
  const year = now.getFullYear();

  const properties = await Property.find({
    Status: "occupied",
    tenant: { $ne: null },
  });

  let created = 0;

  for (const property of properties) {
    const exists = await Bill.findOne({
      property: property._id,
      month,
      year,
    });

    if (exists) continue;

    await Bill.create({
      owner: property.ownerId,
      property: property._id,
      tenant: property.tenant,
      month,
      year,
      rentAmount: property.rent,
      totalAmount: property.rent,
      dueDate: new Date(year, now.getMonth(), 5),
      status: "Pending",
    });

    created++;
  }

  res.json({
    message: "Bills generated",
    count: created,
  });
};

export const getBillsByProperty = async (req, res) => {
  try {
    const bills = await Bill.find({
    property: req.params.id,
  })
    .populate("tenant", "name phone")
    .sort({ createdAt: -1 });

  return res.json(bills);
  } catch (error) {
    return res.status(500).json({message:error.message})
  }
};


export const getBillById= async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid bill ID" });
    }
    const bill = await Bill.findById(id)
      .populate("tenant")
      .populate("property")
      .populate("owner");
    if (!bill) return res.status(404).json({ message: "Bill not found" });
    res.json(bill);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


export const getTenantBills = async (req, res) => {
  try {
   const tenant = await Tenant.findOne({ user: req.userId });
  if (!tenant) return res.status(404).json({ message: "Tenant not found" });

const bills = await Bill.find({ tenant: tenant._id })
  .sort({ year: -1, month: -1 });

const pendingBills = await Bill.find({
  tenant: tenant._id,
  status: { $ne: "Paid" }
});

return res.status(200).json({ bills, pendingBills });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getBillsByTenant = async (req, res) => {
  try {
    const { id } = req.params;

    const bills = await Bill.find({ tenant:id })
      .populate("property", "propertyName propertyType")
      .sort({ year: -1, createdAt: -1 });

    // 🔢 Aggregate totals
    const totals = bills.reduce(
      (acc, bill) => {
        if (bill.status === "Pending") {
          acc.pending += bill.totalAmount;
        }
        if (bill.status === "Overdue") {
          acc.due += bill.totalAmount + (bill.overdueFee || 0);
        }
        if (bill.status === "Paid") {
          acc.paid += bill.totalAmount;
        }
        return acc;
      },
      { pending: 0, due: 0, paid: 0 }
    );

    res.status(200).json({
      success: true,
      bills,
      totals, // 👈 includes pending, due, paid
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch tenant bills",
    });
  }
};



export const getOwnerBills = async (req, res) => {
  try {
    const ownerId = req.userId;

    const bills = await Bill.find({ owner: ownerId })
      .populate("tenant", "name email")
      .populate("property", "propertyName")
      .sort({ year: -1, month: -1 });

    return res.status(200).json(bills);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};



export const updateBill = async (req, res) => {
  try {
    const { electricityAmount, waterAmount = 0 } = req.body;

    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: "Bill not found" });

    if (bill.status.toLowerCase() === "paid") {
      return res.status(400).json({ message: "Paid bill cannot be updated" });
    }

    // ✅ Only update electricity and water
    bill.electricityAmount = Number(electricityAmount || bill.electricityAmount);
    bill.waterAmount = Number(waterAmount || bill.waterAmount);

    // ✅ Recalculate total based on rent + updated charges
    bill.totalAmount = Number(bill.rentAmount || 0) + bill.electricityAmount + bill.waterAmount;

    await bill.save();

    res.json({ success: true, bill });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};



export const payBill = async (req, res) => {
  try {
    const { billId} = req.params;

    const bill = await Bill.findById(billId);

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    if (bill.status === "paid") {
      return res.status(400).json({ message: "Already paid" });
    }

    bill.status = "paid";
    bill.paidAt = new Date();
    bill.paymentMethod = "razorpay";
    bill.paymentId = "test_payment_id";

    await bill.save();

    res.status(200).json({
      message: "Bill paid successfully",
      bill
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};