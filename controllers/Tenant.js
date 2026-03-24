import Tenant from "../models/Tenant.js";
import Agreement from "../models/Agreement.js";
import Bill from "../models/Bill.js";
import Maintenance from "../models/Maintenance.js";
import Property from "../models/Property.js";
import User from "../models/user.js";

export const createTenant = async (req, res) => {
  try {
    const tenant = await Tenant.create({
      owner: req.userId, // owner ObjectId
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      verified: req.body.verified,
    });

   return res.status(201).json({
    success:true,
      message: "Tenant added successfully",
      tenant,
      tenantId: tenant._id,
    });
  } catch (err) {
     res.status(500).json({ error: err.message });
  }
};

export const getOwnerTenants = async (req, res) => {
  try {
    const tenants = await Tenant.find({ owner: req.userId });

    if (!tenants || tenants.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No tenants found for this owner",
      });
    }

    // Calculate totals
    const totalTenants = tenants.length;
    const activeTenants = tenants.filter((t) => t.isActive).length;
    const vacantTenants = tenants.filter((t) => !t.property).length;
    // assuming "vacant" means property is null

    return res.json({
      success: true,
      totalTenants,
      activeTenants,
      vacantTenants,
      tenants, // full list if you still want to return them
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getVacantActiveTenants = async (req, res) => {
  try {
    const tenants = await Tenant.find({
      owner: req.userId,
      property: null, // vacant
      isActive: true, // active
      verified: true, // verified
    });

    if (!tenants || tenants.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No active vacant tenants found for this owner",
      });
    }

    return res.json({
      success: true,
      count: tenants.length,
      tenants,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getTenantViewDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Find tenant and populate property
    const tenant = await Tenant.findById(id).populate("property");
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    // 2️⃣ Find active agreement linked to tenant
    const agreement = await Agreement.findOne({
      tenantId: id, // 👈 matches your schema
      status: "active", // 👈 use status instead of isActive
    })
      .populate("tenantId", "name email phone") // optional: populate tenant
      .populate("propertyId", "propertyName address"); // optional: populate property

    // 3️⃣ Return response
    res.status(200).json({
      tenant,
      agreement: agreement || null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTenantProfile = async (req, res) => {
  try {
    const userId = req.userId;

    const tenant = await Tenant.findOne({ user: userId }).populate(
      "user",
      "name email",
    );

    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    res.status(200).json(tenant);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const vacateTenant = async (req, res) => {
  try {
    const { id } = req.params; // ✅ use id
    const ownerId = req.userId; // from auth middleware

    // 1. Find tenant
    const tenant = await Tenant.findOne({
      _id: id,
      owner: ownerId,
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found",
      });
    }

    // 2. If tenant has property, update property
    if (tenant.property) {
      await Property.findOneAndUpdate(
        { _id: tenant.property, ownerId },
        {
          Status: "vacant",
          tenant: null,
          leaseStartDate: null,
          currentAgreementId: null,
        },
        { new: true },
      );

      if (Property?.currentAgreementId) {
        await Agreement.findByIdAndUpdate(Property.currentAgreementId, {
          status: "expired",
          endDate: Date.now(),
        });
      }
    }

    // 3. Update tenant
    tenant.isActive = false;
    tenant.property = null;
    await tenant.save();

    return res.status(200).json({
      success: true,
      message: "Tenant vacated successfully",
    });
  } catch (error) {
    console.error("Vacate tenant error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const deleteTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.userId;

    const tenant = await Tenant.findOne({
      _id: id,
      owner: ownerId,
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found",
      });
    }

    // ❌ Prevent deleting active tenant
    if (tenant.property) {
      return res.status(400).json({
        success: false,
        message: "Vacate tenant before deleting",
      });
    }

    await tenant.deleteOne();

    res.status(200).json({
      success: true,
      message: "Tenant deleted successfully",
    });
  } catch (error) {
    console.error("Delete tenant error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// export const assignTenantToUser = async (req, res) => {
//   try {
//     const { userId, tenantId } = req.body;

//     // 1️⃣ Check user exists
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // 2️⃣ Check tenant exists
//     const tenant = await Tenant.findById(tenantId);
//     if (!tenant) {
//       return res.status(404).json({ message: "Tenant not found" });
//     }

//     // 3️⃣ Assign tenant to user
//     tenant.user = user._id; // make sure your Tenant schema has a `user` fiel//d
//     user.tenant = tenant._id;
//     await tenant.save();
//     await user.save();

//     res.json({
//       message: "Tenant assigned successfully",
//       tenant, // return updated tenant
//       user, // return user info too
//     });
//   } catch (error) {
//     console.error("Error assigning tenant:", error);
//     res.status(500).json({ message: error.message });
//   }
// };


export const assignTenantToUser = async (req, res) => {
  try {
    const { userId, tenantId } = req.body;

    // 1️⃣ Check user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 2️⃣ Check tenant exists
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ success: false, message: "Tenant not found" });
    }

    // 3️⃣ Prevent re-assignment if tenant already has a user
    if (tenant.user) {
      return res.status(400).json({ success: false, message: "Tenant already assigned to a user" });
    }

    // 4️⃣ Prevent assigning a user who is already linked to another tenant
    if (user.tenant) {
      return res.status(400).json({ success: false, message: "User already assigned to a tenant" });
    }

    // 5️⃣ Assign tenant to user
    tenant.user = user._id;
    user.tenant = tenant._id;

    await tenant.save();
    await user.save();

    return res.json({
      success: true,
      message: "Tenant assigned successfully",
      tenant,
      user,
    });
  } catch (error) {
    console.error("Error assigning tenant:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getCurrentTenantToUser = async (req, res) => {
  try {
    const userId = req.userId; // from auth middleware

    const tenant = await Tenant.findOne({ user: userId })
      .populate("property")
      .populate("owner");

    if (!tenant) {
      return res.status(200).json({
        success: false,
        message: "No tenant assigned to this user",
        tenant: null,
      });
    }

    res.status(200).json({
      success: true,
      tenant,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getTenantDashboardSummary = async (req, res) => {
  try {
    const userId = req.userId;

    const tenant = await Tenant.findOne({ user: userId })
      .populate("property", "name")
      .populate("owner", "name");

    if (!tenant) {
      return res.status(404).json({ message: "Tenant not assigned" });
    }

    const pendingBills = await Bill.find({
      tenant: tenant._id,
       status: "Pending"
    });

    const totalPendingAmount = pendingBills.reduce(
      (sum, bill) => sum + bill.totalAmount,
      0
    );

    return res.status(200).json({
      tenantName: tenant.name,
      propertyName: tenant.property.name,
      // flatNo: tenant.flatNo,
      ownerName: tenant.owner.name,
      totalPendingAmount,
      overdueBills: pendingBills.length
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getCurrentMonthBill = async (req, res) => {
  try {
    const userId = req.userId;

    const tenant = await Tenant.findOne({ user: userId });
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not assigned" });
    }

    const currentBill = await Bill.findOne({
      tenant: tenant._id,
      status: "Pending"
    }).sort({ year: -1, month: -1 });

    res.status(200).json(currentBill);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



export const getMaintenanceSummary = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(400).json({ message: "User ID missing in request" });
    }

    const tenant = await Tenant.findOne({ user: userId }).lean();
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not assigned" });
    }

    // Run counts in parallel
    const [active, resolved] = await Promise.all([
      Maintenance.countDocuments({ tenant: tenant._id, status: "in_progress" }),
      Maintenance.countDocuments({ tenant: tenant._id, status: "resolved" })
    ]);

    return res.status(200).json({ active, resolved });
  } catch (err) {
    console.error("Error in getMaintenanceSummary:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};