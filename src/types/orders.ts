export type User = {
  user: string;
};

export type IOrder = {
  orderId: string;
  date: string;
  productId: string;
  title: string;
  price: number;
  quantity: number;
  total: number;
};
