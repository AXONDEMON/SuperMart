import { Box } from "@mui/material";
import Header from "../../components/Header";
import GeographyChart from "../../components/GeographyChart";

const Geography = () => {
  return (
    <Box m="30px">
      <Header title="Store Expansion Map" subtitle="Best Locations to Open a Store in India" />
      <Box height="100vh" width="100%">
        <GeographyChart />
      </Box>
    </Box>
  );
};

export default Geography;
