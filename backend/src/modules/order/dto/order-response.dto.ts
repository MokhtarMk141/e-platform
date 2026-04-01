import { Order, OrderItem, OrderStatus, Product } from "@prisma/client";

export type OrderWithItems = Order & {
  items: Array<OrderItem & { product: Product }>;
};

export class OrderItemResponseDto {
  id: string;
  productId: string;
  name: string;
  sku: string;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;

  constructor(item: OrderItem & { product: Product }) {
    this.id = item.id;
    this.productId = item.productId;
    this.name = item.product.name;
    this.sku = item.product.sku;
    this.imageUrl = item.product.imageUrl;
    this.quantity = item.quantity;
    this.unitPrice = item.price;
    this.lineTotal = Number((item.quantity * item.price).toFixed(2));
  }
}

export class OrderResponseDto {
  id: string;
  userId: string;
  status: OrderStatus;
  total: number;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  shippingAddressLine1: string | null;
  shippingAddressLine2: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingPostalCode: string | null;
  shippingCountry: string | null;
  deliveryMode: string;
  paymentMethod: string;
  orderNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
  totalItems: number;
  items: OrderItemResponseDto[];

  constructor(order: OrderWithItems) {
    this.id = order.id;
    this.userId = order.userId;
    this.status = order.status;
    this.total = order.total;
    this.customerName = order.customerName;
    this.customerEmail = order.customerEmail;
    this.customerPhone = order.customerPhone;
    this.shippingAddressLine1 = order.shippingAddressLine1;
    this.shippingAddressLine2 = order.shippingAddressLine2;
    this.shippingCity = order.shippingCity;
    this.shippingState = order.shippingState;
    this.shippingPostalCode = order.shippingPostalCode;
    this.shippingCountry = order.shippingCountry;
    this.deliveryMode = order.deliveryMode;
    this.paymentMethod = order.paymentMethod;
    this.orderNotes = order.orderNotes;
    this.createdAt = order.createdAt;
    this.updatedAt = order.updatedAt;
    this.items = order.items.map((item) => new OrderItemResponseDto(item));
    this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
  }
}
