import Property from "../models/Property.js";
import Tenant from "../models/Tenant.js";
import uploadOnCloudinary from "../utils/Cloudinary.js";

export const CreateProperty = async (req, res) => {
  try {
    const ownerId = req.userId;
    const {
      propertyName,
      propertyType,
      address,
      city,
      state,
      pincode,
      bedrooms,
      bathrooms,
      areaSqft,
      hasParking,
      hasElectricityConnection,
      hasWaterConnection,
      rent
    } = req.body;

    let image = null;
    if (req.file) {
      image = await uploadOnCloudinary(req.file.path); // ✅ get Cloudinary URL
    }

    const property = await Property.create({
      propertyName,
      propertyType,
      address,
      city,
      state,
      pincode,
      bedrooms,
      bathrooms,
      areaSqft,
      hasParking,
      hasElectricityConnection,
      hasWaterConnection,
      image, // ✅ now contains Cloudinary URL
      ownerId,
      Status: "vacant",
      rent
    });

    return res.status(201).json({
      success: true,
      message: "Property created successfully",
      property,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getOwnerProperties = async (req, res) => {
  try {
    const ownerId = req.userId;

    const properties = await Property.find({ ownerId }).sort({ createdAt: -1 });

    // ✅ calculate counts based on Status field
    const occupiedCount = properties.filter(p => p.Status.toLowerCase() === "occupied").length;
    const vacantCount   = properties.filter(p => p.Status.toLowerCase() === "vacant").length;

    res.status(200).json({
      success: true,
      count: properties.length,
      occupied: occupiedCount,
      vacant: vacantCount,
      properties,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * ✅ GET SINGLE PROPERTY BY ID
 * GET /property/:id
 */
export const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    res.status(200).json({
      success: true,
      property,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// /**
//  * ✅ UPDATE PROPERTY (Owner)
//  * PUT /property/:id
//  */
export const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // owner check
    if (property.ownerId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );

    res.status(200).json({
      success: true,
      message: "Property updated",
      property: updatedProperty,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// /**
//  * ✅ DELETE PROPERTY (Owner)
//  * DELETE /property/:id
//  */
export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    if (property.ownerId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (property.Status=="occupied") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete occupied property",
      });
    }

    await property.deleteOne();

    res.status(200).json({
      success: true,
      message: "Property deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};





export const assignTenant = async (req, res) => {
  try {
    const { tenantId, leaseStartDate } = req.body;
    const { id } = req.params;

    // 1️⃣ Check tenant exists
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    // 2️⃣ Update property and populate tenant fields
    const property = await Property.findByIdAndUpdate(
      id,
      {
        tenant: tenantId,
        // Status: "occupied",
        leaseStartDate,
      },
      { new: true }
    ).populate("tenant", "name email phone"); // 👈 populate specific fields

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // 3️⃣ OPTIONAL (recommended): link property to tenant
    tenant.property = property._id;
    await tenant.save();

    res.json({
      success:true,
      message: "Tenant assigned successfully",
      property,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


export const getPropertyViewDetails = async (req, res) => {
    try {
      const {id} = req.params;

  const property = await Property.findById(id)
    .populate({
      path: "tenant",
      select: "name phone  isActive email verified",
    });

  if (!property) {
    return res.status(404).json({ message: "Property not found" });
  }

  res.status(200).json({
    success: true,
    property,
    assignedTenant: property.tenant || null,
  });
    } catch (error) {
      return res.status(500).json({success:false,message:error.message})
    }
};





