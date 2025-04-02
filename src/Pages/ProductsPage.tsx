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
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ProductsPage = () => {
  const [products, setProducts] = useState<IProducts[]>([]);
  const [addedProducts, setAddedProducts] = useState<Record<string, boolean>>(
    {}
  );
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [loggedInUser, setLoggedInUser] = useState<string>("");

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
    window.dispatchEvent(new Event("cartUpdated"));
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
    window.dispatchEvent(new Event("cartUpdated"));
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
    window.dispatchEvent(new Event("cartUpdated"));
  };

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
  }, [loggedInUser]);

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
          {loggedInUser === "admin@microfox.co" ? (
            <Card sx={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <Link
                href="/product/add"
                style={{
                  textDecoration: "none",
                  color: "white",
                  fontSize: "18px",
                  padding: "10px 15px",
                  backgroundColor: "#1976d3",
                }}
              >
                Add Product
              </Link>
            </Card>
          ) : (
            ""
          )}
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
                  {loggedInUser === "admin@microfox.co" ? (
                    <Card
                      sx={{
                        display: "inline-block",
                        alignItems: "center",
                        backgroundColor: "#1976d3",
                        mt: "15px",
                      }}
                    >
                      <Link
                        href={`/product/edit/${product.id}`}
                        style={{
                          textDecoration: "none",
                          color: "white",
                          fontSize: "18px",
                          padding: "10px 15px",
                          display: "inline-block",
                        }}
                      >
                        Edit
                      </Link>
                    </Card>
                  ) : (
                    ""
                  )}
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
