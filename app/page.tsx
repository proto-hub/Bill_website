"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, Download, Eye } from "lucide-react"
import { generatePDF } from "@/lib/pdf-generator"

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

export default function BillGenerator() {
  const [billData, setBillData] = useState<BillData>({
    invoiceNumber: `#${String(Date.now()).slice(-3)}`,
    issueDate: new Date().toLocaleDateString("en-GB"),
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    customerAddress: "",
    services: [
      {
        id: "1",
        description: "",
        details: "",
        quantity: 1,
        price: 0,
        discount: 0,
      },
    ],
    notes: "",
  })

  const [showPreview, setShowPreview] = useState(false)

  const addService = () => {
    const newService: ServiceItem = {
      id: Date.now().toString(),
      description: "",
      details: "",
      quantity: 1,
      price: 0,
      discount: 0,
    }
    setBillData((prev) => ({
      ...prev,
      services: [...prev.services, newService],
    }))
  }

  const removeService = (id: string) => {
    setBillData((prev) => ({
      ...prev,
      services: prev.services.filter((service) => service.id !== id),
    }))
  }

  const updateService = (id: string, field: keyof ServiceItem, value: string | number) => {
    setBillData((prev) => ({
      ...prev,
      services: prev.services.map((service) => (service.id === id ? { ...service, [field]: value } : service)),
    }))
  }

  const calculateTotal = () => {
    return billData.services.reduce((total, service) => {
      const serviceTotal = service.price * service.quantity - service.discount
      return total + serviceTotal
    }, 0)
  }

  const handleDownloadPDF = async () => {
    await generatePDF(billData, calculateTotal())
  }

  const isFormValid = () => {
    return (
      billData.customerName.trim() !== "" &&
      billData.services.every((service) => service.description.trim() !== "" && service.price > 0)
    )
  }

  if (showPreview) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              ← Back to Form
            </Button>
            <Button onClick={handleDownloadPDF} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-4">
                <img src="/protohub-logo.png" alt="ProtoHub" className="w-12 h-12" />
                <h1 className="text-2xl font-bold text-gray-800">ProtoHub</h1>
              </div>
              <div className="text-right">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">INVOICE</h2>
                <p className="text-gray-600">{billData.invoiceNumber}</p>
                <p className="text-gray-600">Issued {billData.issueDate}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-2">FROM</h3>
                <p className="text-lg font-semibold text-gray-800">ProtoHub</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-2">BILL TO</h3>
                <p className="text-lg font-semibold text-gray-800">{billData.customerName}</p>
                <p className="text-gray-600">{billData.customerPhone}</p>
                <p className="text-gray-600">{billData.customerEmail}</p>
                <p className="text-gray-600">{billData.customerAddress}</p>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden mb-8">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-700">Description</th>
                    <th className="text-center p-4 font-semibold text-gray-700">QTY</th>
                    <th className="text-right p-4 font-semibold text-gray-700">Price, INR</th>
                    <th className="text-right p-4 font-semibold text-gray-700">Amount, INR</th>
                  </tr>
                </thead>
                <tbody>
                  {billData.services.map((service, index) => (
                    <tr key={service.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="p-4">
                        <div className="font-semibold text-gray-800">{service.description}</div>
                        <div className="text-sm text-gray-600 mt-1">{service.details}</div>
                        {service.discount > 0 && (
                          <div className="text-sm text-gray-500 mt-1">
                            Incl. ₹{service.discount.toFixed(2)} discount
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-center">{service.quantity}</td>
                      <td className="p-4 text-right">₹{service.price.toFixed(2)}</td>
                      <td className="p-4 text-right">
                        ₹{(service.price * service.quantity - service.discount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mb-8">
              <div className="text-right">
                <div className="text-xl font-bold text-gray-800">Total: ₹{calculateTotal().toFixed(2)}</div>
              </div>
            </div>

            {billData.notes && (
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-2">NOTES & PAYMENTS INSTRUCTIONS</h3>
                <p className="text-gray-700">{billData.notes}</p>
              </div>
            )}

            <div className="mt-12 text-center text-sm text-gray-500">Inv. {billData.invoiceNumber} | 1 of 1</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-4">
              <img src="/protohub-logo.png" alt="ProtoHub" className="w-10 h-10" />
              <div>
                <CardTitle>ProtoHub Bill Generator</CardTitle>
                <CardDescription>Generate professional invoices for your clients</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    value={billData.invoiceNumber}
                    onChange={(e) => setBillData((prev) => ({ ...prev, invoiceNumber: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="issueDate">Issue Date</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={new Date().toISOString().split("T")[0]}
                    onChange={(e) =>
                      setBillData((prev) => ({
                        ...prev,
                        issueDate: new Date(e.target.value).toLocaleDateString("en-GB"),
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  value={billData.customerName}
                  onChange={(e) => setBillData((prev) => ({ ...prev, customerName: e.target.value }))}
                  placeholder="Enter customer name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerPhone">Phone</Label>
                  <Input
                    id="customerPhone"
                    value={billData.customerPhone}
                    onChange={(e) => setBillData((prev) => ({ ...prev, customerPhone: e.target.value }))}
                    placeholder="+91XXXXXXXXXX"
                  />
                </div>
                <div>
                  <Label htmlFor="customerEmail">Email</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={billData.customerEmail}
                    onChange={(e) => setBillData((prev) => ({ ...prev, customerEmail: e.target.value }))}
                    placeholder="customer@example.com"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="customerAddress">Address</Label>
                <Textarea
                  id="customerAddress"
                  value={billData.customerAddress}
                  onChange={(e) => setBillData((prev) => ({ ...prev, customerAddress: e.target.value }))}
                  placeholder="Enter customer address"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Services</CardTitle>
              <Button onClick={addService} size="sm" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Service
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {billData.services.map((service, index) => (
                <div key={service.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-semibold">Service {index + 1}</h4>
                    {billData.services.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeService(service.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Service Description</Label>
                      <Input
                        value={service.description}
                        onChange={(e) => updateService(service.id, "description", e.target.value)}
                        placeholder="e.g., Service providing for Clean City Quest App"
                      />
                    </div>

                    <div>
                      <Label>Service Details</Label>
                      <Textarea
                        value={service.details}
                        onChange={(e) => updateService(service.id, "details", e.target.value)}
                        placeholder="Additional details about the service"
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          value={service.quantity}
                          onChange={(e) => updateService(service.id, "quantity", Number.parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div>
                        <Label>Price (₹)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={service.price}
                          onChange={(e) => updateService(service.id, "price", Number.parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label>Discount (₹)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={service.discount}
                          onChange={(e) =>
                            updateService(service.id, "discount", Number.parseFloat(e.target.value) || 0)
                          }
                        />
                      </div>
                    </div>

                    <div className="text-right text-sm text-gray-600">
                      Amount: ₹{(service.price * service.quantity - service.discount).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-6" />

            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total Amount:</span>
              <span>₹{calculateTotal().toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={billData.notes}
              onChange={(e) => setBillData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="e.g., 50% discount for 1st client, Payment terms, etc."
              rows={3}
            />
          </CardContent>
        </Card>

        <div className="flex justify-center gap-4 mt-8">
          <Button
            variant="outline"
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2"
            disabled={!billData.customerName || billData.services.some((s) => !s.description)}
          >
            <Eye className="w-4 h-4" />
            Preview Invoice
          </Button>
          <Button onClick={handleDownloadPDF} className="flex items-center gap-2" disabled={!isFormValid()}>
            <Download className="w-4 h-4" />
            Generate & Download PDF
          </Button>
        </div>
      </div>
    </div>
  )
}
