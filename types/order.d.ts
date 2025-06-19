type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string;
  inStock: boolean;
  createdAt: string; // ISO 8601 formatted date string
  updatedAt: string; // ISO 8601 formatted date string
};
interface Coupon {
  id: string;
  code: string;
  amount: number;
  isUsed: boolean;
}

type OrderItem = {
  id: string;
  orderId: string;
  price: number;
  product: Product;
  productId: string;
  categoryId: string;
  quantity: number;
  createdAt: string; // ISO 8601 formatted date string
  updatedAt: string; // ISO 8601 formatted date string
};

type User = {
  name: string;
  email: string;
  phone: string;
  roomNumber: string;
  floor: number;
};

export type Order = {
  id: string;
  userId: string;
  confirmDeadline: string; // ISO 8601 formatted date string
  createdAt: string; // ISO 8601 formatted date string
  deliveryDeadline: string | null; // ISO 8601 formatted date string or null
  items: OrderItem[];
  notes: string | null;
  processingMinutes: number | null;
  status:
    | 'PENDING'
    | 'CONFIRMED'
    | 'PROCESSING'
    | 'DELIVERING'
    | 'COMPLETED'
    | 'CANCELLED'; // Add other statuses if applicable
  total: number; // Total price or amount
  updatedAt: string; // ISO 8601 formatted date string
  user: User;
  appliedCoupon: Coupon | null;
};
