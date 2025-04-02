"use client";

import CustomTable from "@/component/custom-table";
import { ITableColumn } from "@/types/common";
import { IOrder } from "@/types/orders";
import { Box, Card, Container, Divider, Typography } from "@mui/material";
import Link from "next/link";
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
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const ordersData = JSON.parse(localStorage.getItem("orders") || "{}");
    setOrdersByUser(ordersData);
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("loggedInUser") || "null");
    if (!user) {
      router.push("/login");
    } else {
      setLoggedInUser(user);
    }
  }, [router]);

  if (!loggedInUser) {
    return null;
  }
  return (
    <>
      <Container sx={{ padding: "25px" }}>
        <Typography variant="h4" sx={{ textAlign: "center" }}>
          Orders
        </Typography>
        <Box justifySelf="flex-end">
          <Card
            sx={{
              display: "inline-block",
              alignItems: "center",
              backgroundColor: "#1976d3",
              mt: "15px",
            }}
          >
            <Link
              href="/"
              style={{
                textDecoration: "none",
                color: "white",
                fontSize: "18px",
                padding: "10px 15px",
                display: "inline-block",
              }}
            >
              Go to Products
            </Link>
          </Card>
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
    </>
  );
};

export default OrdersPage;
