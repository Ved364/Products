"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useRouter } from "next/navigation";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import { IProducts } from "@/types/product";

const CartPage = () => {
  const [cartData, setCartData] = useState<IProducts[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [totalProductQuantity, setTotalProductQuantity] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [priceUpdates, setPriceUpdates] = useState<
    Record<string, { oldPrice: number; newPrice: number }>
  >({});
  const [acknowledged, setAcknowledged] = useState<boolean>(false);
  const [acknowledgedUpdates, setAcknowledgedUpdates] = useState<
    Record<string, number>
  >({});
  const [loggedInUser, setLoggedInUser] = useState<string>("");

  const router = useRouter();

  const handleIncrement = (cart: IProducts) => {
    const cartKey = localStorage.getItem("carts");
    const p = cartKey ? JSON.parse(cartKey) : {};
    const userCarts: IProducts[] = p[loggedInUser];
    console.log("increment userCart", userCarts);

    const updatedUserProducts = userCarts.map((userCart) =>
      userCart.id === cart.id
        ? { ...userCart, quantity: userCart.quantity + 1 }
        : userCart
    );

    p[loggedInUser] = updatedUserProducts;
    localStorage.setItem("carts", JSON.stringify(p));

    const specificUserProduct = userCarts.find(
      (userCart: IProducts) => userCart.id === cart.id
    );
    if (specificUserProduct) {
      setQuantities((prevQuantities) => ({
        ...prevQuantities,
        [cart.id]: specificUserProduct.quantity + 1,
      }));
      console.log(specificUserProduct?.quantity * specificUserProduct?.price);
    }

    calculateTotalQuantity(updatedUserProducts);
    calculateTotalAmount(updatedUserProducts);
  };

  const handleDecrement = (product: IProducts) => {
    const cartKey = localStorage.getItem("carts");
    const p = cartKey ? JSON.parse(cartKey) : {};
    const userCarts: IProducts[] = p[loggedInUser];

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
      const updatedQuantities = { ...prevQuantities };
      if ((prevQuantities[product.id] || 0) > 0) {
        if (specificUserProduct) {
          updatedQuantities[product.id] = specificUserProduct.quantity - 1;
        }
      }
      if (specificUserProduct?.quantity === 0) {
        delete updatedQuantities[product.id];
      }
      return updatedQuantities;
    });
    calculateTotalQuantity(updatedUserProducts);
    calculateTotalAmount(updatedUserProducts);
    fetchData();
  };

  const calculateTotalQuantity = (products: IProducts[]) => {
    const totalQuantity = products.reduce((total, product) => {
      return total + product.quantity;
    }, 0);
    setTotalProductQuantity(totalQuantity);
  };

  const calculateTotalAmount = (products: IProducts[]) => {
    const total = products.reduce((sum, product) => {
      return sum + product.price * product.quantity;
    }, 0);
    setTotalAmount(total);
  };

  const handlePlaceOrder = () => {
    const cartKey = localStorage.getItem("carts");
    const p = cartKey ? JSON.parse(cartKey) : {};
    const userCarts: IProducts[] = p[loggedInUser];
    const products = JSON.parse(localStorage.getItem("products") || "[]");

    if (!userCarts || userCarts.length === 0) {
      alert("Cart is empty. Please add products before placing an order.");
      return;
    }

    const updatedUserProducts = products.map((product: IProducts) => {
      const cartItem = userCarts.find(
        (item: IProducts) => item.id === product.id
      );
      if (cartItem) {
        return {
          ...product,
          quantity: product.quantity - cartItem.quantity,
        };
      }
      return product;
    });

    const hasInsufficientStock = updatedUserProducts.some(
      (product: IProducts) => product.quantity < 0
    );

    if (hasInsufficientStock) {
      alert("Order cannot be placed due to insufficient stock.");
      return;
    }

    localStorage.setItem("products", JSON.stringify(updatedUserProducts));

    // const orderId = `ORD-${product.id}-${Date.now()}`;

    const orderKey = localStorage.getItem("orders");
    const q = orderKey ? JSON.parse(orderKey) : {};

    // const orderDetails = {
    //   orderId,
    //   date: new Date().toISOString(),
    //   products: userCarts,
    //   totalAmount: totalAmount,
    // };

    const orderDetails = userCarts.map((product) => ({
      orderId: `ORD-${product.id}-${Date.now()}`,
      date: new Date().toISOString(),
      productId: product.id,
      title: product.title,
      price: product.price,
      quantity: product.quantity,
      total: product.price * product.quantity,
    }));

    if (!q[loggedInUser]) {
      q[loggedInUser] = [];
    }

    q[loggedInUser].push(orderDetails);
    localStorage.setItem("orders", JSON.stringify(q));
    delete p[loggedInUser];
    localStorage.setItem("carts", JSON.stringify(p));

    setCartData([]);
    setQuantities({});
    setTotalProductQuantity(0);
    setTotalAmount(0);

    alert("Order placed successfully!");
    router.push("/");
  };

  const handleAcknowledge = () => {
    setAcknowledged(true);

    const cartKey = localStorage.getItem("carts");
    const p = cartKey ? JSON.parse(cartKey) : {};
    const userCarts: IProducts[] = p[loggedInUser];

    const updatedUserCart = userCarts.map((cartItem: IProducts) => {
      if (priceUpdates[cartItem.id]) {
        return { ...cartItem, price: priceUpdates[cartItem.id].newPrice };
      }
      return cartItem;
    });

    p[loggedInUser] = updatedUserCart;
    localStorage.setItem("carts", JSON.stringify(p));
    setCartData(updatedUserCart);
    setPriceUpdates({});
  };

  const fetchData = useCallback(() => {
    const cartKey = localStorage.getItem("carts");
    const p = cartKey ? JSON.parse(cartKey) : {};
    const userCarts: IProducts[] = p[loggedInUser] || [];
    console.log("CartUserCart", userCarts);

    const initialQuantities = Object.fromEntries(
      userCarts.map((product: IProducts) => [product.id, product.quantity])
    );
    setQuantities(initialQuantities);
    if (JSON.stringify(cartData) !== JSON.stringify(userCarts)) {
      setCartData(userCarts);
      calculateTotalQuantity(userCarts);
      calculateTotalAmount(userCarts);
    }
  }, [cartData, loggedInUser]);

  const checkPriceUpdates = useCallback(() => {
    const cartKey = localStorage.getItem("carts");
    const p = cartKey ? JSON.parse(cartKey) : {};
    const userCarts: IProducts[] = p[loggedInUser] || [];
    const products = JSON.parse(localStorage.getItem("products") || "[]");

    const updates: Record<string, { oldPrice: number; newPrice: number }> = {};
    const newAcknowledgedUpdates = { ...acknowledgedUpdates };

    userCarts.forEach((cartItem: IProducts) => {
      const latestProduct = products.find(
        (p: IProducts) => p.id === cartItem.id
      );
      if (latestProduct && latestProduct.price !== cartItem.price) {
        updates[cartItem.id] = {
          oldPrice: cartItem.price,
          newPrice: latestProduct.price,
        };
        newAcknowledgedUpdates[cartItem.id] = latestProduct.price;
      }
    });

    setPriceUpdates(updates);
    p[loggedInUser] = newAcknowledgedUpdates;
    localStorage.setItem("acknowledgedUpdates", JSON.stringify(p));
  }, [acknowledgedUpdates, loggedInUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    checkPriceUpdates();
  }, [checkPriceUpdates, cartData]);

  useEffect(() => {
    const acknowledgedUpdates = JSON.parse(
      localStorage.getItem("acknowledgedUpdates") || "{}"
    );
    setAcknowledgedUpdates(acknowledgedUpdates);
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
      <Container>
        {Object.keys(priceUpdates).length > 0 && (
          <Box
            sx={{
              backgroundColor: "yellow",
              padding: "10px",
              marginBottom: "10px",
            }}
          >
            <Typography variant="h6" color="error">
              Price updates detected:
            </Typography>
            {Object.entries(priceUpdates).map(
              ([id, { oldPrice, newPrice }]) => (
                <Typography key={id}>
                  {`"${
                    cartData.find((item) => item.id === id)?.title ||
                    "Unknown Product"
                  }" - Price updated from ${oldPrice} to ${newPrice}`}
                </Typography>
              )
            )}
            <Button
              variant="contained"
              color="primary"
              onClick={handleAcknowledge}
            >
              Acknowledge
            </Button>
          </Box>
        )}
        <Typography variant="h4" textAlign="center" mt={3}>
          Cart
        </Typography>
        <Button variant="contained" onClick={() => router.push("/")}>
          Go to Products
        </Button>
        <Box
          sx={{
            margin: "25px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {cartData.length > 0 ? (
            cartData.map((cart) => (
              <Card
                key={cart.id}
                sx={{
                  display: "flex",
                  justifyContent: "space-around",
                  alignItems: "center",
                  width: "70%",
                  margin: "15px",
                }}
                elevation={6}
              >
                <CardMedia
                  component="img"
                  image={cart.image}
                  alt={cart.title}
                  sx={{
                    height: "100px",
                    width: "100px",
                    objectFit: "contain",
                  }}
                />
                <CardContent sx={{ width: "100%" }}>
                  <Typography variant="h6">{cart.title}</Typography>
                  <Typography
                    variant="h5"
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <CurrencyRupeeIcon />
                    {cart.price} * {quantities[cart.id]}
                  </Typography>
                  <Typography
                    variant="h5"
                    color="green"
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <CurrencyRupeeIcon />
                    {cart.price * quantities[cart.id]}
                  </Typography>
                  <Card sx={{ width: "154px", height: "46px" }} elevation={4}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-evenly"
                    >
                      <RemoveIcon
                        sx={{ cursor: "pointer" }}
                        onClick={() => handleDecrement(cart)}
                      />
                      <Divider orientation="vertical" flexItem />
                      <Typography variant="h6">
                        {quantities[cart.id]}
                      </Typography>
                      <Divider orientation="vertical" flexItem />
                      <AddIcon
                        sx={{ cursor: "pointer" }}
                        onClick={() => handleIncrement(cart)}
                      />
                    </Stack>
                  </Card>
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Typography
                variant="h5"
                sx={{ textAlign: "center", marginTop: "20px" }}
              >
                Cart is empty.
              </Typography>
              <Button size="large" onClick={() => router.push("/")}>
                Go to Products
              </Button>
            </>
          )}
          <Typography variant="h5">
            Total quantity: {totalProductQuantity} Total Amount:{" "}
            {Math.ceil(totalAmount)}
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={handlePlaceOrder}
          disabled={!acknowledged && Object.keys(priceUpdates).length > 0}
        >
          Place Order
        </Button>
      </Container>
    </>
  );
};

export default CartPage;
