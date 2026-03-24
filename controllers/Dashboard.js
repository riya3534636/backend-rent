// controllers/dashboardController.js
import Property from "../models/Property.js";
import Tenant from "../models/Tenant.js";
import Bill from "../models/Bill.js";

export const getOwnerDashboardStats = async (req, res) => {
  try {
    // If you’re using auth middleware:
    // const ownerId = req.user._id;

    // Or fallback: get from query
    const ownerId = req.query.ownerId;
    if (!ownerId) {
      return res.status(400).json({ success: false, message: "Owner ID required" });
    }

    const propertiesCount = await Property.countDocuments({ ownerId });
    const activeTenantsCount = await Tenant.countDocuments({ owner: ownerId, isActive: true });
    const pendingRequestsCount = await Bill.countDocuments({ owner: ownerId, status: "Pending" });
    const billsGeneratedCount = await Bill.countDocuments({ owner: ownerId });

    return res.status(200).json({
      success: true,
      stats: {
        propertiesManaged: propertiesCount,
        activeTenants: activeTenantsCount,
        pendingRequests: pendingRequestsCount,
        billsGenerated: billsGeneratedCount,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};