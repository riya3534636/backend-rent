import Maintenance from "../models/Maintenance.js";
import Property from "../models/Property.js"
import Tenant from "../models/Tenant.js"


export const createIssue = async (req, res) => {
  try {
    const userId = req.userId; // from auth middleware

    // 1️⃣ Find tenant linked to logged-in user
    const tenant = await Tenant.findOne({ user: userId });

    if (!tenant) {
      return res.status(400).json({
        success: false,
        message: "Tenant not assigned to any property",
      });
    }

    // 2️⃣ Find property to get owner
    const property = await Property.findById(tenant.property);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // 3️⃣ Create maintenance request
    const newMaintenance = await Maintenance.create({
      property: tenant.property,
      tenant: tenant._id,
      owner: property.ownerId,
      category: req.body.category,
      description: req.body.description,
      
    });

    res.status(201).json({
      success: true,
      message: "Maintenance request created successfully",
      maintenance: newMaintenance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyMaintenance = async (req, res) => {
  try {
    const userId = req.userId; // from auth middleware

    // 1️⃣ Find tenant using logged-in user
    const tenant = await Tenant.findOne({ user: userId });

    if (!tenant) {
      return res.status(400).json({
        success: false,
        message: "Tenant not found",
      });
    }

    // 2️⃣ Get all maintenance requests of this tenant
    const maintenanceList = await Maintenance.find({
      tenant: tenant._id,
    })
      .populate("category", "description")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: maintenanceList.length,
      maintenance: maintenanceList,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}


export const getOwnerIssues = async (req, res) => {
  try {
    const issues = await Maintenance.find({ owner: req.userId })
      .populate("property", "propertyName")
      .populate("tenant", "name email")
      .sort({ createdAt: -1 });

    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateIssueStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const issue = await Maintenance.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    issue.status = status;
    await issue.save();

    res.json(issue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// GET single maintenance details
export const getSingleMaintenance = async (req, res) => {
  try {
    const { id } = req.params;

    const maintenance = await Maintenance.findById(id)
      .populate("property", "propertyName address city")
      .populate("tenant", "name phone email")
      .populate("owner", "name email");

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: "Maintenance request not found"
      });
    }

    return res.status(200).json({
      success: true,
      maintenance
    });

  } catch (error) {
    console.error("Get single maintenance error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};