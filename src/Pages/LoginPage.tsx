"use client";

import RHFTextFieldArea from "@/component/RhfTextField";
import { ILogin, loginSchema } from "@/types/login";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Card, CardContent, CardHeader } from "@mui/material";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";

const LoginPage = () => {
  const router = useRouter();

  const methods = useForm<ILogin>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
    },
  });

  const {
    handleSubmit,
    formState: { errors },
  } = methods;

  const handleLogin = (data: ILogin) => {
    localStorage.setItem("loggedInUser", JSON.stringify(data.email));
    window.dispatchEvent(new Event("authChanged"));
    router.push("/");
  };

  return (
    <>
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Card sx={{ width: "500px", height: "250px" }}>
          <CardHeader title="Login" sx={{ justifySelf: "center" }} />
          <FormProvider {...methods}>
            <CardContent
              component="form"
              onSubmit={handleSubmit(handleLogin)}
              sx={{ display: "flex", flexDirection: "column", gap: "15px" }}
            >
              <RHFTextFieldArea
                name="email"
                label="Email"
                placeholder="xyz@gmail.com"
                helperText={errors.email && errors.email.message}
              />
              <Button type="submit" variant="contained">
                Login
              </Button>
            </CardContent>
          </FormProvider>
        </Card>
      </Box>
    </>
  );
};

export default LoginPage;
