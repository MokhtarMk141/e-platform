import { Order } from "@prisma/client";
import { sendEmail } from "../../utils/send-email";

type OrderWithItems = Order & {
  items: Array<{
    quantity: number;
    price: number;
    product: {
      name: string;
      sku: string;
    };
  }>;
};

export class OrderEmailService {
  static async sendOrderConfirmation(order: OrderWithItems) {
    if (!order.customerEmail) return;
    const subject = `Order Confirmed - #${order.id.slice(0, 8).toUpperCase()}`;
    const itemsHtml = order.items
      .map(
        (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
          <div style="font-weight: 700; color: #111827;">${item.product.name}</div>
          <div style="font-size: 12px; color: #6b7280;">SKU: ${item.product.sku}</div>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: center; color: #374151;">
          ${item.quantity}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 700; color: #111827;">
          TND ${(item.price * item.quantity).toFixed(2)}
        </td>
      </tr>
    `
      )
      .join("");

    const html = this.getTemplate(`
      <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 800; letter-spacing: -0.02em; color: #111827;">Order Confirmed!</h1>
      <p style="margin: 0 0 24px; color: #4b5563; line-height: 1.6;">
        Hi ${order.customerName},<br>
        Thank you for your order! We've received your request and are getting things ready for delivery.
      </p>
      
      <div style="background: #f9fafb; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <h2 style="margin: 0 0 12px; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af;">Order Details</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="text-align: left; font-size: 12px; color: #9ca3af; padding-bottom: 8px;">Item</th>
              <th style="text-align: center; font-size: 12px; color: #9ca3af; padding-bottom: 8px;">Qty</th>
              <th style="text-align: right; font-size: 12px; color: #9ca3af; padding-bottom: 8px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        <div style="margin-top: 16px; text-align: right;">
          <span style="font-size: 14px; color: #6b7280; margin-right: 8px;">Total Paid:</span>
          <span style="font-size: 20px; font-weight: 800; color: #ff2800;">TND ${order.total.toFixed(2)}</span>
        </div>
      </div>

      <div style="margin-bottom: 24px;">
        <h2 style="margin: 0 0 8px; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af;">Shipping To</h2>
        <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.5;">
          ${order.customerName}<br>
          ${order.shippingAddressLine1}<br>
          ${order.shippingAddressLine2 ? order.shippingAddressLine2 + "<br>" : ""}
          ${order.shippingCity}, ${order.shippingState || ""} ${order.shippingPostalCode || ""}<br>
          ${order.shippingCountry}
        </p>
      </div>

      <a href="${process.env.FRONTEND_URL}/orders" style="display: inline-block; background: #111827; color: #ffffff; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 14px;">View Your Order</a>
    `);

    await sendEmail({ to: order.customerEmail, subject, html });
  }

  static async sendStatusUpdate(order: Order) {
    if (!order.customerEmail) return;
    const subject = `Update: Order #${order.id.slice(0, 8).toUpperCase()} is ${order.status}`;
    
    let message = "";
    let icon = "📦";

    switch (order.status) {
      case "PROCESSING":
        message = "Your order is now being processed and prepared for shipment.";
        icon = "⚙️";
        break;
      case "SHIPPED":
        message = "Great news! Your order has been shipped and is on its way to you.";
        icon = "🚚";
        break;
      case "DELIVERED":
        message = "Your order has been delivered. We hope you enjoy your purchase!";
        icon = "✅";
        break;
      case "CANCELLED":
        message = "Your order has been cancelled. If you have any questions, please contact our support.";
        icon = "❌";
        break;
      default:
        message = `Your order status has been updated to ${order.status}.`;
    }

    const html = this.getTemplate(`
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="font-size: 48px; margin-bottom: 16px;">${icon}</div>
        <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 800; color: #111827;">Your order is ${order.status.toLowerCase()}!</h1>
        <p style="margin: 0; color: #4b5563; line-height: 1.6;">Hi ${order.customerName}, ${message}</p>
      </div>

      <div style="background: #f9fafb; border-radius: 12px; padding: 20px; text-align: center;">
        <p style="margin: 0; font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 800;">Order Number</p>
        <p style="margin: 4px 0 0; font-size: 18px; font-weight: 800; color: #111827;">#${order.id.slice(0, 8).toUpperCase()}</p>
        <div style="margin-top: 20px;">
          <a href="${process.env.FRONTEND_URL}/orders" style="display: inline-block; background: #ff2800; color: #ffffff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 13px;">Track Order</a>
        </div>
      </div>
    `);

    await sendEmail({ to: order.customerEmail, subject, html });
  }

  private static getTemplate(content: string) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&display=swap');
          </style>
        </head>
        <body style="margin: 0; padding: 20px; background-color: #f3f4f6; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <div style="padding: 24px; background-color: #111827; text-align: center;">
              <span style="color: #ff2800; font-size: 20px; font-weight: 900; letter-spacing: -0.03em;">E-COMMERCE</span>
            </div>
            
            <!-- Content -->
            <div style="padding: 32px 24px;">
              ${content}
            </div>
            
            <!-- Footer -->
            <div style="padding: 24px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">&copy; ${new Date().getFullYear()} E-Commerce Platform. All rights reserved.</p>
              <p style="margin: 8px 0 0; font-size: 11px; color: #9ca3af;">You're receiving this email because of your order on our store.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
