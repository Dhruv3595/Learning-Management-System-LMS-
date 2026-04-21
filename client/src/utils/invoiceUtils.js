// Simple invoice generator utility
export const generateInvoice = (order) => {
    const invoiceData = {
        orderNumber: order.orderNumber,
        orderDate: new Date(order.createdAt).toLocaleDateString('en-IN'),
        customerName: order.userId?.fullName || 'Customer',
        customerEmail: order.userId?.email || '',
        courses: order.courseIds.map(course => ({
            name: course.title,
            price: course.price || 0
        })),
        pricing: order.pricing,
        paymentStatus: order.paymentStatus,
        transactionId: order.paymentDetails?.razorpay_payment_id || order.paymentDetails?.transactionId
    };

    return invoiceData;
};

// Function to download invoice as PDF (placeholder)
export const downloadInvoicePDF = (order) => {
    const invoiceData = generateInvoice(order);
    
    // For now, create a simple text-based invoice
    let invoiceText = `
INVOICE
=====================================
Order Number: ${invoiceData.orderNumber}
Date: ${invoiceData.orderDate}
Customer: ${invoiceData.customerName}
Email: ${invoiceData.customerEmail}

COURSES PURCHASED:
=====================================
`;

    invoiceData.courses.forEach((course, index) => {
        invoiceText += `${index + 1}. ${course.name} - ₹${course.price}\n`;
    });

    invoiceText += `
PAYMENT SUMMARY:
=====================================
Subtotal: ₹${invoiceData.pricing.subtotal}
Discount: ₹${invoiceData.pricing.discount || 0}
Tax: ₹${invoiceData.pricing.tax || 0}
Total: ₹${invoiceData.pricing.total}

Payment Status: ${invoiceData.paymentStatus}
Transaction ID: ${invoiceData.transactionId || 'N/A'}

=====================================
Thank you for your purchase!
Learning Management System
    `;

    // Create and download the text file
    const blob = new Blob([invoiceText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${invoiceData.orderNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};

// Function to print invoice
export const printInvoice = (order) => {
    const invoiceData = generateInvoice(order);
    
    const printContent = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #333; margin-bottom: 10px;">INVOICE</h1>
                <div style="background: #f8f9fa; padding: 10px; border-radius: 5px;">
                    <strong>Order #${invoiceData.orderNumber}</strong>
                </div>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
                <div>
                    <h3 style="color: #555; margin-bottom: 10px;">Bill To:</h3>
                    <p style="margin: 5px 0;"><strong>${invoiceData.customerName}</strong></p>
                    <p style="margin: 5px 0;">${invoiceData.customerEmail}</p>
                </div>
                <div style="text-align: right;">
                    <h3 style="color: #555; margin-bottom: 10px;">Invoice Details:</h3>
                    <p style="margin: 5px 0;"><strong>Date:</strong> ${invoiceData.orderDate}</p>
                    <p style="margin: 5px 0;"><strong>Status:</strong> ${invoiceData.paymentStatus}</p>
                </div>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <thead>
                    <tr style="background: #f8f9fa;">
                        <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Course</th>
                        <th style="border: 1px solid #ddd; padding: 12px; text-align: right;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${invoiceData.courses.map(course => `
                        <tr>
                            <td style="border: 1px solid #ddd; padding: 12px;">${course.name}</td>
                            <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">₹${course.price}</td>
                        </tr>
                    `).join('')}
                </tbody>
                <tfoot>
                    <tr>
                        <td style="border: 1px solid #ddd; padding: 12px; text-align: right;"><strong>Subtotal:</strong></td>
                        <td style="border: 1px solid #ddd; padding: 12px; text-align: right;"><strong>₹${invoiceData.pricing.subtotal}</strong></td>
                    </tr>
                    ${invoiceData.pricing.discount > 0 ? `
                    <tr>
                        <td style="border: 1px solid #ddd; padding: 12px; text-align: right; color: green;"><strong>Discount:</strong></td>
                        <td style="border: 1px solid #ddd; padding: 12px; text-align: right; color: green;"><strong>-₹${invoiceData.pricing.discount}</strong></td>
                    </tr>
                    ` : ''}
                    ${invoiceData.pricing.tax > 0 ? `
                    <tr>
                        <td style="border: 1px solid #ddd; padding: 12px; text-align: right;"><strong>Tax:</strong></td>
                        <td style="border: 1px solid #ddd; padding: 12px; text-align: right;"><strong>₹${invoiceData.pricing.tax}</strong></td>
                    </tr>
                    ` : ''}
                    <tr style="background: #f8f9fa;">
                        <td style="border: 2px solid #333; padding: 12px; text-align: right;"><strong>Total:</strong></td>
                        <td style="border: 2px solid #333; padding: 12px; text-align: right;"><strong>₹${invoiceData.pricing.total}</strong></td>
                    </tr>
                </tfoot>
            </table>
            
            ${invoiceData.transactionId ? `
            <div style="margin-bottom: 20px;">
                <p><strong>Transaction ID:</strong> ${invoiceData.transactionId}</p>
            </div>
            ` : ''}
            
            <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd;">
                <p style="color: #666;">Thank you for your purchase!</p>
                <p style="color: #666;">Learning Management System</p>
            </div>
        </div>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Invoice - ${invoiceData.orderNumber}</title>
                <style>
                    body { margin: 0; padding: 20px; }
                    @media print {
                        body { margin: 0; }
                    }
                </style>
            </head>
            <body>
                ${printContent}
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
};