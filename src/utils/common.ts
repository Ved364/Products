/* eslint-disable @typescript-eslint/no-explicit-any */
export const getObjectKeyValue = (
  item: any,
  key: string,
  defaultValue?: any
) => {
  let value;
  const paths = key.split(".");
  value = paths.reduce((acc, part) => acc && acc[part], item);
  if (value === undefined) {
    value = defaultValue;
  }
  return value;
};
