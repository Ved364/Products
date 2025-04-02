"use client";

import { AppBar, Box, Toolbar, Typography } from "@mui/material";
import Link from "next/link";
import { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import Badge from "@mui/material/Badge";
import { badgeClasses } from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCartOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import { useRouter } from "next/navigation";
import { IProducts } from "@/types/product";

const CartBadge = styled(Badge)`
  & .${badgeClasses.badge} {
    top: -20px;
    right: -6px;
  }
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [loggedInUser, setLoggedInUser] = useState<string>("");
  const [cartCount, setCartCount] = useState<number>(0);

  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    window.dispatchEvent(new Event("authChanged"));
    router.push("/login");
  };

  useEffect(() => {
    const fetchUser = () => {
      const user = JSON.parse(localStorage.getItem("loggedInUser") || '""');
      setLoggedInUser(user);
    };

    const updateCartCount = () => {
      const cartData = JSON.parse(localStorage.getItem("carts") || "{}");
      const userCart = cartData[loggedInUser] || [];
      const totalQuantity = userCart.reduce(
        (sum: number, item: IProducts) => sum + item.quantity,
        0
      );
      setCartCount(totalQuantity);
    };

    fetchUser();
    updateCartCount();

    window.addEventListener("authChanged", fetchUser);
    window.addEventListener("cartUpdated", updateCartCount);

    return () => {
      window.removeEventListener("authChanged", fetchUser);
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, [loggedInUser]);

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h4" sx={{ flexGrow: 1, cursor: "pointer" }}>
            <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
              Microfox Store
            </Link>
          </Typography>

          {loggedInUser && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Link
                href={
                  loggedInUser === "admin@microfox.co"
                    ? "/orders"
                    : "/my-orders"
                }
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  fontSize: "18px",
                }}
              >
                Orders
              </Link>
              <Link
                href="/cart"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <ShoppingCartIcon fontSize="medium" />
                <CartBadge
                  badgeContent={cartCount}
                  color="secondary"
                  overlap="circular"
                />
              </Link>
              <LogoutIcon onClick={handleLogout} sx={{ cursor: "pointer" }} />
            </Box>
          )}
        </Toolbar>
      </AppBar>
      {children}
    </>
  );
}
