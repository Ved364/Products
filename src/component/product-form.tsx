"use client";

import { INewProduct, IProducts, newProductSchema } from "@/types/product";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Card, Container, Stack, Typography } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import RHFTextFieldArea from "./RhfTextField";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import AuthGuard from "./auth-guard";

type Props = {
  id?: string | undefined;
};

const ProductForm = (props: Props) => {
  const { id } = props;
  const [products, setProducts] = useState<IProducts[]>([]);
  const product = products.find((product: IProducts) => product.id === id);
  const router = useRouter();

  const defaultValues = useMemo(
    () => ({
      image: product?.image ?? "",
      title: product?.title ?? "",
      price: product?.price ?? 0,
      quantity: product?.quantity ?? 0,
    }),
    [product]
  );

  const methods = useForm<INewProduct>({
    resolver: zodResolver(newProductSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { errors },
  } = methods;

  const onSubmit = (data: INewProduct) => {
    const existingProducts = JSON.parse(
      localStorage.getItem("products") ?? "[]"
    );
    if (id) {
      const updatedProducts = existingProducts.map((product: IProducts) =>
        product.id === id ? { ...product, ...data } : product
      );

      localStorage.setItem("products", JSON.stringify(updatedProducts));
      alert("Product updated successfully!");
    } else {
      const newProduct = { ...data, id: crypto.randomUUID() };
      const isDuplicate = existingProducts.some(
        (product: INewProduct) =>
          product.image === newProduct.image ||
          product.title === newProduct.title
      );

      if (isDuplicate) {
        alert("Product already exists!");
        return;
      }

      existingProducts.push(newProduct);
      localStorage.setItem("products", JSON.stringify(existingProducts));
    }
    router.push("/");
  };

  useEffect(() => {
    setProducts(JSON.parse(localStorage.getItem("products") || "[]"));
  }, []);

  useEffect(() => {
    methods.reset(defaultValues);
  }, [defaultValues, methods]);

  return (
    <>
      <AuthGuard>
        <FormProvider {...methods}>
          <Container
            sx={{
              padding: "15px",
              height: "100vh",
            }}
          >
            <Button variant="contained" onClick={() => router.push("/")}>
              Go to Products
            </Button>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Card
                component="form"
                onSubmit={handleSubmit(onSubmit)}
                elevation={6}
                sx={{
                  height: "500px",
                  width: "500px",
                  padding: "15px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Typography variant="h4" pb={3}>
                  {id ? "Edit Product" : "Add Product"}
                </Typography>
                <Box width="100%">
                  <Stack spacing={3}>
                    <RHFTextFieldArea
                      name="image"
                      label="Image Url"
                      placeholder="https://t4.ftcdn.net/jpg/05/45/42/81/360_F_545428173_uyYWJoR9n5uJFYIWfDa2C49AzIECcU20.jpg"
                      helperText={errors.image && errors.image.message}
                    />

                    <RHFTextFieldArea
                      name="title"
                      label="Title"
                      placeholder="Title"
                      helperText={errors.title && errors.title.message}
                    />

                    <RHFTextFieldArea
                      name="price"
                      label="Price"
                      placeholder="Price"
                      helperText={errors.price && errors.price.message}
                    />

                    <RHFTextFieldArea
                      name="quantity"
                      label="Quantity"
                      placeholder="Quantity"
                      helperText={errors.price && errors.price.message}
                    />

                    <Box textAlign="center">
                      <Button type="submit">
                        {id ? "Update Product" : "Add Product"}
                      </Button>
                    </Box>
                  </Stack>
                </Box>
              </Card>
            </Box>
          </Container>
        </FormProvider>
      </AuthGuard>
    </>
  );
};

export default ProductForm;
