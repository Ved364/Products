"use client";

import AuthGuard from "@/component/auth-guard";
import CustomTable from "@/component/custom-table";
import { ITableColumn } from "@/types/common";
import { IOrder } from "@/types/orders";
import { Box, Button, Container, Divider, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const COLUMNS: ITableColumn[] = [
  { key: "orderId", label: "Order Id" },
  { key: "date", label: "Date & Time" },
  { key: "productId", label: "Product-Id" },
  { key: "title", label: "Title" },
  { key: "price", label: "Price" },
  { key: "quantity", label: "Quantity" },
  { key: "total", label: "Total" },
];

const OrdersPage = () => {
  const [userOrders, setUserOrders] = useState<IOrder[]>([]);
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("loggedInUser") || "null");

    const ordersData = JSON.parse(localStorage.getItem("orders") || "{}");

    if (ordersData[user]) {
      const flattenedOrders = ordersData[user].flat(Infinity);
      setUserOrders(flattenedOrders);
    }
  }, [router]);

  return (
    <>
      <AuthGuard>
        <Container sx={{ padding: "25px" }}>
          <Typography variant="h4" sx={{ textAlign: "center" }}>
            Your Orders
          </Typography>
          <Box sx={{ justifySelf: "flex-end" }}>
            <Button variant="contained" onClick={() => router.push("/")}>
              Go to Products
            </Button>
          </Box>

          {userOrders.length > 0 ? (
            <Box sx={{ my: 4 }}>
              <Divider sx={{ my: 2 }} />

              <CustomTable columns={COLUMNS} data={userOrders} />
            </Box>
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
