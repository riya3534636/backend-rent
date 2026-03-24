import Aggreement from "../models/Agreement.js"
import Property from "../models/Property.js";
import uploadOnCloudinary from "../utils/Cloudinary.js";

export const createAgreement = async (req, res) => {
  try {
    const ownerId = req.userId;

    const {
      tenantId,
      propertyId,
      rentAmount,
      dueDate,
      startDate,
      electricityCharge,
      waterCharge,
      endDate,
    } = req.body;

    let image;
    if(req.file){
        image=await uploadOnCloudinary(req.file.path)
    }

    // Check property
    const property = await Property.findById(propertyId);
    if (!property)
      return res.status(404).json({ message: "Property not found" });

    if (property.Status=="occupied")
      return res.status(400).json({ message: "Property already occupied" });

    const agreement = await Aggreement.create({
      ownerId,
      tenantId,
      propertyId,
      rentAmount,
      electricityCharge,
      waterCharge,
      dueDate,
      startDate,
      endDate,
      image,
      status: "active",
    });

    property.Status = "occupied";
    property.currentAgreementId = agreement._id;
    await property.save();

    return res.status(201).json({
      success: true,
      agreement,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getTenantAgreement = async (req, res) => {
  try {
    const tenantId = req.userId;

    const agreement = await Aggreement.findOne({
      tenantId: tenantId,
      status: "active"
    })
      .populate("propertyId", "propertyName address")
      .populate("ownerId", "name email phone");

    if (!agreement) {
      return res.status(404).json({ message: "No active agreement found" });
    }

    res.status(200).json(agreement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getOwnerAgreements = async (req, res) => {
  try {
    const ownerId = req.userId;

    const agreements = await Aggreement.find({ ownerId: ownerId })
      .populate("tenantId", "name email phone")
      .populate("propertyId", "title address")
      .sort({ createdAt: -1 });

      return res.status(200).json(agreements);
  } catch (error) {
   return  res.status(500).json({ message: error.message });
  }
};


export const getAgreementById = async (req, res) => {
  try {
    const { id } = req.params;

    const agreement = await Aggreement.findById(id)
      .populate("tenantId", "name email phone")
      .populate("ownerId", "name email")
      .populate("propertyId", "propertyName address");

    if (!agreement) {
      return res.status(404).json({ message: "Agreement not found" });
    }

    res.status(200).json(agreement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// export const endAgreement = async (req, res) => {

//   try {
//     const { id } = req.params;

//     const agreement = await Aggreement.findById(id);

//     if (!agreement) {
//       return res.status(404).json({ message: "Agreement not found" });
//     }

//     agreement.status = "terminated";
//     agreement.endDate = new Date();
//     await agreement.save();

//     // Free property
//     const property = await Property.findById(agreement.propertyId);
//     property.Status = "vacant";
//     property.currentAgreementId = null;
//     await property.save();

    

//     res.status(200).json({
//       message: "Agreement terminated successfully"
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

export const endAgreement = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find agreement
    const agreement = await Aggreement.findById(id);

    if (!agreement) {
      return res.status(404).json({ message: "Agreement not found" });
    }

    // 2. Update agreement status before deletion (optional, for audit logs)
    agreement.status = "terminated";
    agreement.endDate = new Date();
    await agreement.save();

    // 3. Free property
    const property = await Property.findById(agreement.propertyId);
    if (property) {
      property.Status = "vacant";
      property.currentAgreementId = null;
      await property.save();
    }

    // 4. Delete agreement
    await Aggreement.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Agreement terminated and deleted successfully"
    });
  } catch (error) {
    console.error("End agreement error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteAgreement = async (req, res) => {
  try {
    const { selectedAgreementId } = req.params;

    const agreement = await Aggreement.findByIdAndDelete(selectedAgreementId);

    if (!agreement) {
      return res.status(404).json({ message: "Agreement not found" });
    }

    res.status(200).json({ message: "Agreement deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};