import { CircularProgress, ColorPaletteProp, Typography } from "@mui/joy";
import CheckTwoToneIcon from "@mui/icons-material/CheckTwoTone";

const CircularProgressWithLabel = ({
  value,
  status,
}: {
  value: number;
  status: string;
}) => {
  return (
    <CircularProgress
      size="md"
      determinate
      value={value}
      variant="solid"
      color={
        {
          N: "neutral",
          S: "primary",
          P: "warning",
          C: "success",
          R: "danger",
        }[status] as ColorPaletteProp
      }
    >
      {Math.round(value) === 100 ? (
        <CheckTwoToneIcon color="success" />
      ) : (
        <Typography
          color={
            {
              N: "neutral",
              S: "primary",
              P: "warning",
              C: "success",
              R: "danger",
            }[status] as ColorPaletteProp
          }
        >
          {Math.round(value)}%
        </Typography>
      )}
    </CircularProgress>
  );
};

export default CircularProgressWithLabel;
