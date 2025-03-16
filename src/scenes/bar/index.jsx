import { Box } from "@mui/material";
import Header from "../../components/Header";
import BarChart from "../../components/BarChart";

const Bar = () => {
  return (
    <Box m="60px">
      <Header title="Low Conversion Rate" />
      <Box height="65vh">
        <BarChart />
      </Box>
    </Box>
  );
};

export default Bar;
