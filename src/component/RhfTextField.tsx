import { Controller, useFormContext } from "react-hook-form";
import { TextField } from "@mui/material";
import type { TextFieldProps } from "@mui/material";

export type ProductProps = TextFieldProps & {
  name: string;
};

const RHFTextFieldArea = ({
  name,
  helperText,
  type = "text",
  ...other
}: ProductProps) => {
  const { control, register } = useFormContext();

  return (
    <>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            {...register(name)}
            fullWidth
            value={field.value}
            type={type}
            error={!!error}
            helperText={error ? error?.message : helperText}
            {...other}
          />
        )}
      />
    </>
  );
};

export default RHFTextFieldArea;
