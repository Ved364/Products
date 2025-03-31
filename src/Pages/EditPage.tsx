"use client";

import ProductForm from "@/component/product-form";
import { useParams } from "next/navigation";

const EditPage = () => {
  const params = useParams();
  const id = params?.id;
  return (
    <>
      <ProductForm id={id?.toString()} />
    </>
  );
};

export default EditPage;
