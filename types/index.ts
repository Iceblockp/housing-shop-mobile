export type User = {
  id: string;
  email: string;
  name: string;
  phone?: string;
  roomNumber?: string;
  floor?: number;
  role: 'USER' | 'ADMIN';
  createdAt: string;
};

export type Category = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  products?: Product[];
  createdAt: string;
  updatedAt: string;
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

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'DELIVERING' | 'COMPLETED' | 'CANCELLED';

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

export type NotificationType = 'NEW_ORDER' | 'ORDER_STATUS_CHANGE' | 'ORDER_CANCELLED' | 'SYSTEM';

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