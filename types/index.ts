export type User = {
  id: string;
  email: string;
  name: string;
  phone?: string;
  roomNumber?: string;
  floor?: number;
  address?: string; // New optional field for address
  latitude?: number; // New optional field for latitude
  longitude?: number; // New optional field for longitude
  role: 'USER' | 'ADMIN';
  createdAt: string;
};

export type Category = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  // products?: Product[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
};

export type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  inStock: boolean;
  categoryId: string;
  category?: Category;
  unit: string; // kg, pcs, l
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
};

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
};

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'DELIVERING'
  | 'COMPLETED'
  | 'CANCELLED';

export type Order = {
  id: string;
  userId: string;
  user: {
    name: string;
    email: string;
    phone?: string;
    roomNumber?: string;
    floor?: number;
  };
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  notes?: string;
  confirmDeadline?: string;
  deliveryDeadline?: string;
  createdAt: string;
  updatedAt: string;
};

export type NotificationType =
  | 'NEW_ORDER'
  | 'ORDER_STATUS_CHANGE'
  | 'ORDER_CANCELLED'
  | 'SYSTEM'
  | 'NEW_COUPON';

export type Notification = {
  id: string;
  userId: string;
  orderId?: string;
  order?: {
    id: string;
    status: OrderStatus;
    total: number;
  };
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
};
