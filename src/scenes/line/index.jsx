import { Box } from "@mui/material";
import Header from "../../components/Header";
import LineChart from "../../components/PCAChart";

const Line = () => {
  return (
    <Box m="20px">
      <Header title="Customer Segmentation" />
      <Box height="100vh">
        <LineChart />
      </Box>
    </Box>
  );
};

export default Line;
