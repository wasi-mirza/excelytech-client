import jsPDF from "jspdf";
import "jspdf-autotable";
import axios from "axios";
import { BASE_URL } from "../../utils/endPointNames";
function addLetterSpacing(doc, text, x, y, spacing = 1) {
  let currentX = x; // Track the current X position
  for (let char of text) {
    doc.text(char, currentX, y); // Draw each character at the current position
    currentX += doc.getTextWidth(char) + spacing; // Move X by character width + spacing
  }
}

export const savePdfToServer = async (proposalData, authToken) => {
  const doc = new jsPDF();
  // console.log("proposalData.grandTotalCurrency from pdf", proposalData);

  // Get current date and time for filename
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().slice(0, 10);
  const formattedTime = currentDate
    .toTimeString()
    .slice(0, 8)
    .replace(/:/g, "-");
  const filename = `proposal_${formattedDate}_${formattedTime}.pdf`;
  // doc.setFont("courier", "normal");
  // Set up PDF content
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text("Proposal Details", 20, 20);

  // Add title and table
  doc.setFontSize(12);
  doc.text(`Title: ${proposalData.title || ""}`, 20, 40);

  const headers = [["Product", "Quantity", "Discount", "Total"]];
  const tableData = proposalData.products.map((product) => [
    product.name || "",
    product.quantity || 0,
    product.discount != 0
      ? `${proposalData.grandTotalCurrency} ${product.discount} ${product.discountType}`
      : 0,
    `${proposalData.grandTotalCurrency} ${product.total || 0}`,
  ]);

  // Draw table with custom styles
  doc.autoTable({
    head: headers,
    body: tableData,
    startY: 60,
    theme: "grid",
    styles: {
      fontSize: 10,
      halign: "center",
      valign: "middle",
    },
    headStyles: {
      fillColor: [22, 160, 133],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [240, 248, 255],
    },
  });

  // Calculate Y-position for totals
  const finalY = doc.lastAutoTable.finalY + 15;

  // Add totals with bold font
  // doc.setFontSize(12);
  // doc.setTextColor(40, 40, 40);
  // Reducing letter spacing by 0.5 units for a condensed appearance

  addLetterSpacing(
    doc,
    `Product Total: ${proposalData.grandTotalCurrency} ${
      proposalData.productTotal || 0
    }`,
    20,
    finalY,
    -0.11
  );
  addLetterSpacing(
    doc,
    `Grand Total: ${proposalData.grandTotalCurrency} ${
      proposalData.grandTotal || 0
    }`,
    20,
    finalY + 10,
    -0.11
  );
  addLetterSpacing(
    doc,
    `Discount on Grand Total: ${proposalData.grandTotalCurrency} ${
      proposalData.discountOnGrandTotal || 0
    }`,
    20,
    finalY + 20,
    -0.11
  );
  addLetterSpacing(
    doc,
    `Final Amount: ${proposalData.grandTotalCurrency} ${
      proposalData.finalAmount || 0
    }`,
    20,
    finalY + 30,
    -0.11
  );

  doc.text(`Payment Link: ${proposalData.paymentLink || ""}`, 20, finalY + 40);

  // Convert to Blob and prepare FormData
  const pdfBlob = doc.output("blob");
  const formData = new FormData();
  formData.append("doc", pdfBlob, filename);

  try {
    // Send to server and receive the URL
    const response = await axios.post(`${BASE_URL}/upload/doc`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (response.data) {
      // console.log(
      //   "File uploaded successfully:",
      //   filename,
      //   response.data.fileUrl
      // );
      return { filename: filename, attachmentUrl: response.data.fileUrl };
    } else {
      console.error("Unexpected response structure:", response.data.fileUrl);
      throw new Error("Upload failed: Invalid response structure.");
    }
  } catch (error) {
    console.error("Error uploading PDF:", error.message || error);
    throw new Error("Failed to upload PDF to server.");
  }
};
