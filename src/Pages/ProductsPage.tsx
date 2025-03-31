"use client";

import { IProducts } from "@/types/product";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCartOutlined";
import { useRouter } from "next/navigation";
import LogoutIcon from "@mui/icons-material/Logout";
import { styled } from "@mui/material/styles";
import Badge from "@mui/material/Badge";
import { badgeClasses } from "@mui/material";

const CartBadge = styled(Badge)`
  & .${badgeClasses.badge} {
    top: -12px;
    right: -6px;
  }
`;

const ProductsPage = () => {
  const [products, setProducts] = useState<IProducts[]>([]);
  const [addedProducts, setAddedProducts] = useState<Record<string, boolean>>(
    {}
  );
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [loggedInUser, setLoggedInUser] = useState<string>("");
  const [cartLength, setCartLength] = useState<number>(0);

  const router = useRouter();

  const handleClick = (cart: IProducts) => {
    if (!loggedInUser) {
      router.push("/login");
      return;
    }
    const cartKey = localStorage.getItem("carts");
    const p = cartKey ? JSON.parse(cartKey) : {};
    let userCarts;
    if (!p[loggedInUser]) {
      userCarts = [];
      p[loggedInUser] = [];
    } else {
      userCarts = p[loggedInUser];
    }

    const productToStore: IProducts = {
      id: cart.id,
      title: cart.title,
      price: cart.price,
      image: cart.image,
      quantity: 0,
    };

    const existingUserProductsQuantity: IProducts[] =
      JSON.parse(localStorage.getItem("products") || "[]") || [];

    const specificUserQuantity = existingUserProductsQuantity.find(
      (existingProductsQuantity: IProducts) =>
        existingProductsQuantity.id === cart.id
    );

    if (specificUserQuantity?.quantity === 0) {
      alert("Product is Out of Stock");
      return;
    }

    const productExist = userCarts.some(
      (userCarts: IProducts) => userCarts.id === productToStore.id
    );

    if (!productExist) {
      const newUserProduct = { ...productToStore, quantity: 1 };
      userCarts.push(newUserProduct);
      p[loggedInUser] = userCarts;
      localStorage.setItem("carts", JSON.stringify(p));
      setAddedProducts((prevState) => ({
        ...prevState,
        [cart.id]: true,
      }));
      setCartLength(userCarts.length);
    }

    const specificUserProduct = userCarts.find(
      (userCart: IProducts) => userCart.id === cart.id
    );

    if (specificUserProduct) {
      setQuantities((prevQuantities) => ({
        ...prevQuantities,
        [cart.id]: 1,
      }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    router.push("/login");
  };

  const handleAddButton = () => {
    if (loggedInUser !== "admin@microfox.in") {
      alert("Only admin can add products");
      return;
    }
    router.push("/product/add");
  };

  const handleEditButton = (id: string) => {
    if (loggedInUser !== "admin@microfox.in") {
      alert("Only admin can edit products");
      return;
    }
    router.push(`/product/edit/${id}`);
  };

  const handleOrders = () => {
    if (loggedInUser !== "admin@microfox.in") {
      router.push("/my-orders");
      return;
    }
    router.push("/orders");
  };

  const isProductInCart = (productId: string) => {
    const cartKey = localStorage.getItem("carts");
    const p = cartKey ? JSON.parse(cartKey) : {};
    const userCarts: IProducts[] = p[loggedInUser] || [];
    return userCarts.some((userCart: IProducts) => userCart.id === productId);
  };

  const handleIncrement = (product: IProducts) => {
    const cartKey = localStorage.getItem("carts");
    const p = cartKey ? JSON.parse(cartKey) : {};
    const userCarts: IProducts[] = p[loggedInUser] || [];

    const existingUserProductsQuantity: IProducts[] =
      JSON.parse(localStorage.getItem("products") || "[]") || [];

    const specificUserProduct = userCarts.find(
      (userCart: IProducts) => userCart.id === product.id
    );

    const specificUserQuantity = existingUserProductsQuantity.find(
      (existingProductsQuantity: IProducts) =>
        existingProductsQuantity.id === product.id
    );

    if (specificUserProduct && specificUserQuantity) {
      if (specificUserProduct.quantity === specificUserQuantity.quantity) {
        alert(
          "You have reached the maximum quantity for this product. Stock is empty."
        );
        return;
      }
    }

    const updatedUserProducts = userCarts.map((userCart) =>
      userCart.id === product.id
        ? { ...userCart, quantity: userCart.quantity + 1 }
        : userCart
    );

    p[loggedInUser] = updatedUserProducts;
    localStorage.setItem("carts", JSON.stringify(p));

    if (specificUserProduct) {
      setQuantities((prevQuantities) => ({
        ...prevQuantities,
        [product.id]: specificUserProduct.quantity + 1,
      }));
    }
    updateCartLength();
  };

  const handleDecrement = (product: IProducts) => {
    const cartKey = localStorage.getItem("carts");
    const p = cartKey ? JSON.parse(cartKey) : {};
    const userCarts: IProducts[] = p[loggedInUser] || [];

    const updatedUserProducts = userCarts
      .map((userCart) =>
        userCart.id === product.id
          ? { ...userCart, quantity: userCart.quantity - 1 }
          : userCart
      )
      .filter((product) => product.quantity > 0);

    p[loggedInUser] = updatedUserProducts;
    localStorage.setItem("carts", JSON.stringify(p));

    const specificUserProduct = userCarts.find(
      (userCart: IProducts) => userCart.id === product.id
    );

    setQuantities((prevQuantities) => {
      const updatedUserQuantities = { ...prevQuantities };
      if ((prevQuantities[product.id] || 0) > 0) {
        if (specificUserProduct) {
          updatedUserQuantities[product.id] = specificUserProduct.quantity - 1;
        }
      }
      if (specificUserProduct?.quantity === 0) {
        delete updatedUserQuantities[product.id];
      }
      return updatedUserQuantities;
    });
    updateCartLength();
  };

  const updateCartLength = useCallback(() => {
    const cartKey = localStorage.getItem("carts");
    const p = cartKey ? JSON.parse(cartKey) : {};
    const userCarts: IProducts[] = p[loggedInUser] || [];
    setCartLength(userCarts.length);
  }, [loggedInUser]);

  useEffect(() => {
    setProducts(JSON.parse(localStorage.getItem("products") ?? "[]"));
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("loggedInUser") || "null");
    if (!user) {
      router.push("/login");
    } else {
      setLoggedInUser(user);
    }
  }, [router]);

  useEffect(() => {
    const cartKey = localStorage.getItem("carts");
    const p = cartKey ? JSON.parse(cartKey) : {};
    const userCarts: IProducts[] = p[loggedInUser] || [];
    const initialQuantities = Object.fromEntries(
      userCarts.map((product) => [product.id, product.quantity])
    );
    setQuantities(initialQuantities);
    updateCartLength();
  }, [loggedInUser, updateCartLength]);

  if (!loggedInUser) {
    return null;
  }

  return (
    <>
      <Container sx={{ padding: "25px" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h4" pb={3}>
            Products
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <Button variant="contained" onClick={handleAddButton}>
              Add Product
            </Button>
            <Button variant="contained" onClick={handleOrders}>
              Orders
            </Button>
            <IconButton onClick={() => router.push("/cart")}>
              <ShoppingCartIcon fontSize="medium" />
              <CartBadge
                badgeContent={cartLength}
                color="primary"
                overlap="circular"
              />
            </IconButton>
            <LogoutIcon onClick={handleLogout} sx={{ cursor: "pointer" }} />
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px",
            marginTop: "20px",
          }}
        >
          {products.length > 0 ? (
            products.map((product) => (
              <Card
                key={product.id}
                sx={{
                  maxWidth: 345,
                  padding: "15px",
                  alignSelf: "normal",
                  flexWrap: "wrap",
                }}
                elevation={6}
              >
                <CardMedia
                  component="img"
                  height={160}
                  image={product.image}
                  alt={product.title}
                  sx={{ objectFit: "contain" }}
                />
                <CardContent>
                  <Typography variant="h6" padding="5px">
                    <Tooltip title={product.title}>
                      <Box
                        sx={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "250px",
                        }}
                      >
                        {product.title}
                      </Box>
                    </Tooltip>
                  </Typography>
                  <Typography variant="h5" padding="5px">
                    {product.price}
                  </Typography>
                  {product.quantity === 0 && (
                    <Typography variant="h6" color="error">
                      Out of Stock
                    </Typography>
                  )}
                  {(quantities[product.id] !== 0 &&
                    addedProducts[product.id]) ||
                  isProductInCart(product.id) ? (
                    <Card sx={{ width: "154px", height: "46px" }} elevation={4}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-evenly"
                      >
                        <RemoveIcon
                          sx={{ cursor: "pointer" }}
                          onClick={() => handleDecrement(product)}
                        />
                        <Divider orientation="vertical" flexItem />
                        <Typography variant="h6">
                          {quantities[product.id]}
                        </Typography>
                        <Divider orientation="vertical" flexItem />
                        <AddIcon
                          sx={{ cursor: "pointer" }}
                          onClick={() => handleIncrement(product)}
                        />
                      </Stack>
                    </Card>
                  ) : (
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => handleClick(product)}
                    >
                      Add to Cart
                    </Button>
                  )}
                  <br />
                  <Button
                    variant="contained"
                    onClick={() => handleEditButton(product.id)}
                    sx={{ marginTop: "15px" }}
                  >
                    Edit
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card sx={{ padding: "20px", textAlign: "center" }} elevation={6}>
              <Typography variant="h5" color="textSecondary">
                No products available. Please add products.
              </Typography>
            </Card>
          )}
        </Box>
      </Container>
    </>
  );
};

export default ProductsPage;
