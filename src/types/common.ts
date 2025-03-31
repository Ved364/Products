export type ITableColumn = {
  key: string | null;
  label: string;
  image?: string;
  align?: "right" | "left" | "center";
  minWidth?: number;
  textTransform?: string;
};
