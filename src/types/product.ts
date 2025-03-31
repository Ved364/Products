import { z } from "zod";

export const ProductSchema = z.object({
  id: z.string(),
  title: z.string().min(10, "Should be atleast 10 charaters"),
  image: z.string().nonempty("Image is required").url("Invalid url"),
  price: z.coerce.number().positive("Price should be a positive number"),
  quantity: z.coerce.number().positive("quantity should be a positive number"),
});

export const newProductSchema = ProductSchema.omit({ id: true });

export type IProducts = z.infer<typeof ProductSchema>;
export type INewProduct = z.infer<typeof newProductSchema>;
