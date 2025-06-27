import jsPDF from "jspdf"

interface ServiceItem {
  id: string
  description: string
  details: string
  quantity: number
  price: number
  discount: number
}

interface BillData {
  invoiceNumber: string
  issueDate: string
  customerName: string
  customerPhone: string
  customerEmail: string
  customerAddress: string
  services: ServiceItem[]
  notes: string
}

export const generatePDF = async (billData: BillData, total: number) => {
  const pdf = new jsPDF()

  // Set font
  pdf.setFont("helvetica")

  // Header
  pdf.setFontSize(24)
  pdf.setFont("helvetica", "bold")
  pdf.text("ProtoHub", 20, 30)

  pdf.setFontSize(28)
  pdf.text("INVOICE", 150, 30)

  pdf.setFontSize(12)
  pdf.setFont("helvetica", "normal")
  pdf.text(billData.invoiceNumber, 150, 40)
  pdf.text(`Issued ${billData.issueDate}`, 150, 48)

  // From and Bill To sections
  pdf.setFontSize(10)
  pdf.setFont("helvetica", "bold")
  pdf.text("FROM", 20, 70)
  pdf.text("BILL TO", 120, 70)

  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(12)
  pdf.text("ProtoHub", 20, 80)

  pdf.setFont("helvetica", "bold")
  pdf.text(billData.customerName, 120, 80)
  pdf.setFont("helvetica", "normal")
  pdf.text(billData.customerPhone, 120, 88)
  pdf.text(billData.customerEmail, 120, 96)

  // Split address into multiple lines if needed
  const addressLines = pdf.splitTextToSize(billData.customerAddress, 70)
  pdf.text(addressLines, 120, 104)

  // Services table
  let yPosition = 130

  // Table header
  pdf.setFillColor(245, 245, 245)
  pdf.rect(20, yPosition, 170, 10, "F")

  pdf.setFont("helvetica", "bold")
  pdf.setFontSize(10)
  pdf.text("Description", 25, yPosition + 7)
  pdf.text("QTY", 130, yPosition + 7)
  pdf.text("Price, INR", 145, yPosition + 7)
  pdf.text("Amount, INR", 170, yPosition + 7)

  yPosition += 15

  // Table rows
  pdf.setFont("helvetica", "normal")
  billData.services.forEach((service, index) => {
    const rowHeight = 25

    // Alternate row colors
    if (index % 2 === 0) {
      pdf.setFillColor(250, 250, 250)
      pdf.rect(20, yPosition - 5, 170, rowHeight, "F")
    }

    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(10)
    pdf.text(service.description, 25, yPosition + 2)

    pdf.setFont("helvetica", "normal")
    pdf.setFontSize(9)
    const detailLines = pdf.splitTextToSize(service.details, 100)
    pdf.text(detailLines, 25, yPosition + 8)

    if (service.discount > 0) {
      pdf.text(`Incl. ₹${service.discount.toFixed(2)} discount`, 25, yPosition + 15)
    }

    pdf.setFontSize(10)
    pdf.text(service.quantity.toString(), 135, yPosition + 2)
    pdf.text(`₹${service.price.toFixed(2)}`, 150, yPosition + 2)
    pdf.text(`₹${(service.price * service.quantity - service.discount).toFixed(2)}`, 175, yPosition + 2)

    yPosition += rowHeight
  })

  // Total
  yPosition += 10
  pdf.setFont("helvetica", "bold")
  pdf.setFontSize(14)
  pdf.text(`Total: ₹${total.toFixed(2)}`, 150, yPosition)

  // Notes
  if (billData.notes) {
    yPosition += 20
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(10)
    pdf.text("NOTES & PAYMENTS INSTRUCTIONS", 20, yPosition)

    pdf.setFont("helvetica", "normal")
    const notesLines = pdf.splitTextToSize(billData.notes, 170)
    pdf.text(notesLines, 20, yPosition + 8)
  }

  // Footer
  pdf.setFontSize(8)
  pdf.setTextColor(128, 128, 128)
  pdf.text(`Inv. ${billData.invoiceNumber} | 1 of 1`, 105, 280, { align: "center" })

  // Save the PDF
  pdf.save(`Invoice_${billData.invoiceNumber.replace("#", "")}_${billData.customerName.replace(/\s+/g, "_")}.pdf`)
}
