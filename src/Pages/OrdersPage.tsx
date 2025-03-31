"use client";

import AuthGuard from "@/component/auth-guard";
import CustomTable from "@/component/custom-table";
import { ITableColumn } from "@/types/common";
import { IOrder } from "@/types/orders";
import { Box, Button, Container, Divider, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const COLUMNS: ITableColumn[] = [
  {
    key: "orderId",
    label: "Order Id",
  },
  {
    key: "date",
    label: "Date & Time",
  },
  {
    key: "productId",
    label: "Product-Id",
  },
  {
    key: "title",
    label: "Title",
  },
  {
    key: "price",
    label: "Price",
  },
  {
    key: "quantity",
    label: "Quantity",
  },
  {
    key: "total",
    label: "Total",
  },
];

const OrdersPage = () => {
  const [ordersByUser, setOrdersByUser] = useState<Record<string, IOrder[]>>(
    {}
  );
  const router = useRouter();

  useEffect(() => {
    const ordersData = JSON.parse(localStorage.getItem("orders") || "{}");
    setOrdersByUser(ordersData);
  }, []);

  return (
    <>
      <AuthGuard>
        <Container sx={{ padding: "25px" }}>
          <Typography variant="h4" sx={{ textAlign: "center" }}>
            Orders
          </Typography>
          <Box justifySelf="flex-end">
            <Button variant="contained" onClick={() => router.push("/")}>
              Go to Products
            </Button>
          </Box>

          {Object.keys(ordersByUser).length > 0 ? (
            Object.entries(ordersByUser).map(([user, orders]) => {
              const flattenedOrders = orders.flatMap((order) =>
                Array.isArray(order) ? order : [order]
              );

              return (
                <Box key={user} sx={{ my: 4 }}>
                  <Typography variant="h5" sx={{ fontWeight: "bold", mt: 3 }}>
                    User: {user}
                  </Typography>
                  <Divider sx={{ my: 2 }} />

                  <CustomTable columns={COLUMNS} data={flattenedOrders} />
                </Box>
              );
            })
          ) : (
            <Typography
              variant="h5"
              sx={{ textAlign: "center", marginTop: "20px" }}
            >
              No orders found.
            </Typography>
          )}
        </Container>
      </AuthGuard>
    </>
  );
};

export default OrdersPage;
