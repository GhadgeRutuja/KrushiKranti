import { jsPDF } from "jspdf";
import type { Order } from "../../modules/orders/types";

type InvoiceItem = {
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
};

type InvoiceTemplateData = {
    websiteName: string;
    invoiceNumber: string;
    orderId: string;
    orderDate: string;

    customerName: string;
    customerEmail: string;
    deliveryAddress: string;

    farmerName?: string;
    farmLocation?: string;

    items: InvoiceItem[];

    subtotal: number;
    taxes: number;
    total: number;

    orderStatus: string;
    deliveryStatus: string;
};

function money(value: number): string {
    const amount = Number(value || 0);
    return `INR ${amount.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function prettyDate(value?: string): string {
    if (!value) return "-";

    return new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function normalizeItems(order: Order): InvoiceItem[] {
    if (Array.isArray(order?.items) && order.items.length > 0) {
        return order.items.map((item) => ({
            name: item.name,
            quantity: Number(item.quantity),
            unitPrice: Number(item.price),
            total: Number(item.quantity) * Number(item.price),
        }));
    }

    return [
        {
            name: order?.productName || "Product",
            quantity: Number(order?.quantity || 1),
            unitPrice: Number(order?.totalAmount || 0),
            total: Number(order?.totalAmount || 0),
        },
    ];
}

function toTemplateData(order: Order): InvoiceTemplateData {
    const items = normalizeItems(order);
    const subtotal = items.reduce((sum, i) => sum + i.total, 0);

    return {
        websiteName: "KrushiKranti",
        invoiceNumber: `INV-${order?.id}`,
        orderId: String(order?.id),
        orderDate: prettyDate(order?.createdAt),

        customerName: order?.userName || "Customer",
        customerEmail: order?.userEmail || "-",

        deliveryAddress: [
            order?.shippingAddress,
            order?.shippingCity,
            order?.shippingState,
            order?.shippingPincode,
        ]
            .filter(Boolean)
            .join(", "),

        farmerName: order?.farmerName || "-",
        farmLocation: order?.farmLocation || "-",

        items,

        subtotal,
        taxes: 0,
        total: Number(order?.totalAmount || subtotal),

        orderStatus: order?.status || "-",
        deliveryStatus: order?.deliveryStatus || "Pending",
    };
}

export function generateInvoicePdf(order: Order): string {
    const data = toTemplateData(order);

    const doc = new jsPDF({
        unit: "pt",
        format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const margin = 40;
    let y = 120;

    /* ================= WATERMARK ================= */

    const centerX = pageWidth / 2 + 60; // move watermark slightly right
    const centerY = pageHeight / 2 + 170; // keep it lower

    doc.setTextColor(230, 235, 230);
    doc.setFontSize(90);
    doc.setFont("helvetica", "bold");

    doc.text(
        "KRUSHIKRANTI",
        centerX,
        centerY,
        {
            align: "center",
            angle: 35,
            baseline: "middle"
        }
    );

    // Reset color
    doc.setTextColor(0, 0, 0);

    /* ================= HEADER ================= */

    doc.setFillColor(22, 101, 52);
    doc.rect(0, 0, pageWidth, 80, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");

    doc.text(data.websiteName, margin, 45);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    doc.text("Farm Fresh Produce Marketplace", margin, 62);

    doc.setFontSize(24);
    doc.setTextColor(234, 179, 8);

    doc.text("INVOICE", pageWidth - margin, 45, { align: "right" });

    /* ================= META INFO (NO BORDER) ================= */

    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    doc.text(`Invoice No : ${data.invoiceNumber}`, margin, y);
    doc.text(`Order ID : ${data.orderId}`, margin, y + 18);
    doc.text(`Date : ${data.orderDate}`, margin, y + 36);

    doc.text(
        `Order Status : ${data.orderStatus}`,
        pageWidth - margin,
        y,
        { align: "right" }
    );

    doc.text(
        `Delivery : ${data.deliveryStatus}`,
        pageWidth - margin,
        y + 18,
        { align: "right" }
    );

    y += 70;

    /* ================= CUSTOMER ================= */

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Customer Details", margin, y);

    y += 20;

    doc.setFont("helvetica", "normal");

    doc.text(`Name : ${data.customerName}`, margin, y);
    doc.text(`Email : ${data.customerEmail}`, margin, y + 18);
    doc.text(`Address : ${data.deliveryAddress}`, margin, y + 36);

    y += 70;

    /* ================= FARMER ================= */

    doc.setFont("helvetica", "bold");
    doc.text("Farmer Details", margin, y);

    y += 20;

    doc.setFont("helvetica", "normal");

    doc.text(`Farmer : ${data.farmerName}`, margin, y);
    doc.text(`Farm Location : ${data.farmLocation}`, margin, y + 18);

    y += 60;

    /* ================= PRODUCT TABLE ================= */

    const tableWidth = pageWidth - margin * 2;

    doc.setFont("helvetica", "bold");

    doc.rect(margin, y, tableWidth, 25);

    doc.text("#", margin + 10, y + 16);
    doc.text("Product", margin + 50, y + 16);
    doc.text("Qty", margin + 320, y + 16);
    doc.text("Rate", margin + 380, y + 16);
    doc.text("Total", pageWidth - margin, y + 16, { align: "right" });

    y += 25;

    doc.setFont("helvetica", "normal");

    data.items.forEach((item, index) => {
        doc.rect(margin, y, tableWidth, 22);

        doc.text(String(index + 1), margin + 10, y + 15);
        doc.text(item.name, margin + 50, y + 15);

        doc.text(String(item.quantity), margin + 320, y + 15);

        doc.text(money(item.unitPrice), margin + 370, y + 15);

        doc.text(
            money(item.total),
            pageWidth - margin,
            y + 15,
            { align: "right" }
        );

        y += 22;
    });

    y += 40;

    /* ================= SUMMARY (NO BORDER) ================= */

    doc.setFont("helvetica", "normal");

    doc.text("Subtotal", pageWidth - 200, y);
    doc.text(money(data.subtotal), pageWidth - margin, y, { align: "right" });

    y += 20;

    doc.text("Taxes (GST)", pageWidth - 200, y);
    doc.text(money(data.taxes), pageWidth - margin, y, { align: "right" });

    y += 28;

    doc.setFont("helvetica", "bold");
    doc.setTextColor(22, 101, 52);

    doc.text("TOTAL AMOUNT", pageWidth - 200, y);
    doc.text(money(data.total), pageWidth - margin, y, { align: "right" });

    doc.setTextColor(0, 0, 0);

    /* ================= FOOTER ================= */

    doc.setFillColor(22, 101, 52);
    doc.rect(0, pageHeight - 60, pageWidth, 60, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);

    doc.text(
        "Thank you for shopping with KrushiKranti",
        pageWidth / 2,
        pageHeight - 30,
        { align: "center" }
    );

    const fileName = `invoice_${data.orderId}.pdf`;

    doc.save(fileName);

    return fileName;
}