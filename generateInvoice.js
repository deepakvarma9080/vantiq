const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

module.exports = function generateInvoice(order) {

  const invoicesDir = path.join(__dirname, "../invoices");

  // ✅ Ensure invoices folder exists
  if (!fs.existsSync(invoicesDir)) {
    fs.mkdirSync(invoicesDir, { recursive: true });
  }

  const filePath = path.join(
    invoicesDir,
    `invoice-${order._id}.pdf`
  );

  const doc = new PDFDocument({ margin: 40 });
  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(18).text("VANTIQ Cover Store", { align: "center" });
  doc.moveDown();

  doc.fontSize(12);
  doc.text(`Order ID: ${order._id}`);
  doc.text(`Customer: ${order.name}`);
  doc.text(`Phone: ${order.phone}`);
  doc.text(`Address: ${order.address}`);
  doc.moveDown();

  doc.text("Products:");
  order.items.forEach(item => {
    doc.text(`• ${item.name} × ${item.qty || item.quantity}`);
  });

  doc.moveDown();
  doc.text(`Payment Method: ${order.paymentMethod}`);
  doc.text(`Order Status: ${order.status}`);
  doc.text(`Total Amount: ₹${order.totalAmount}`);

  doc.end();

  return filePath; // ✅ VERY IMPORTANT
};
