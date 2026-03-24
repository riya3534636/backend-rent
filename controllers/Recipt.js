import Bill from "../models/Bill.js"
import PDFDocument from "pdfkit";


export const getReceipt = async (req, res) => {
  try {
    const { id } = req.params;

    const bill = await Bill.findById(id)
      .populate("tenant")
      .populate("property")
      .populate("owner");

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    if (bill.status !== "Paid") {
      return res.status(400).json({
        success: false,
        message: "Payment not completed yet",
      });
    }

    res.status(200).json({
      success: true,
      receipt: {
        receiptNo: `REC-${bill._id.toString().slice(-6)}`,
        billId: bill._id,
        amount: bill.rentAmount, // ✅ matches schema
        TotalAmount:bill.totalAmount,
        month: bill.month,
        paidAt: bill.paidAt, // ✅ direct field
        paymentId: bill.razorpayPaymentId, // ✅ direct field
        orderId: bill.razorpayOrderId, // ✅ direct field
        method: bill.paymentMethod, // ✅ direct field

        tenant: {
          name: bill.tenant?.name,
          email: bill.tenant?.email,
          flatNo: bill.tenant?.flatNo,
        },

        owner:bill.owner?.name,

        property: bill.property?.propertyName,
        createdAt: bill.createdAt,
      },
    });
  } catch (error) {
    console.error("Receipt Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load receipt",
    });
  }
};


export const downloadReceiptPDF = async (req, res) => {
  try {
    const { id } = req.params;

    const bill = await Bill.findById(id)
      .populate("tenant")
      .populate("property");

    if (!bill || bill.status !== "Paid") {
      return res.status(400).json({
        success: false,
        message: "Receipt not available",
      });
    }

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=receipt-${bill._id}.pdf`
    );
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);

    // 🧾 TITLE
    doc.fontSize(20).text("Payment Receipt", { align: "center" });
    doc.moveDown();

    // BASIC INFO
    doc.fontSize(12);
    doc.text(`Receipt No: REC-${bill._id.toString().slice(-6)}`);
    doc.text(`Payment Date: ${bill.paidAt?.toDateString()}`);
    doc.text(`Payment ID: ${bill.paymentId}`);
    doc.text(`Order ID: ${bill.razorpayOrderId}`);
    doc.moveDown();

    // TENANT INFO
    doc.text("Tenant Details", { underline: true });
    doc.text(`Name: ${bill.tenant?.name}`);
    doc.text(`Email: ${bill.tenant?.email}`);
    doc.text(`Flat No: ${bill.tenant?.flatNo}`);
    doc.moveDown();

    // BILL INFO
    doc.text("Bill Details", { underline: true });
    doc.text(`Month: ${bill.month}`);
    doc.text(`Amount Paid: ₹${bill.totalAmount}`);
    doc.text(`Payment Method: ${bill.paymentMethod}`);
    doc.moveDown();

    doc.text("Thank you for your payment!", { align: "center" });

    doc.end();
  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(500).json({ success: false, message: "PDF generation failed" });
  }
};
