import { useTheme, Box, Typography, useMediaQuery } from '@mui/material';
import { useState, useEffect } from "react";
import { ResponsiveBar } from "@nivo/bar";
import { tokens } from "../theme";
// import { mockBarData as data } from "../data/mockData";
// import { mockCustomerSupportData as data } from "../data/mockData";

const BarChart = ({ isDashboard = false }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  // return (
  //   <ResponsiveBar
  //     data={data}
  //     theme={{
  //       // added
  //       axis: {
  //         domain: {
  //           line: {
  //             stroke: colors.grey[100],
  //           },
  //         },
  //         legend: {
  //           text: {
  //             fill: colors.grey[100],
  //           },
  //         },
  //         ticks: {
  //           line: {
  //             stroke: colors.grey[100],
  //             strokeWidth: 1,
  //           },
  //           text: {
  //             fill: colors.grey[100],
  //           },
  //         },
  //       },
  //       legends: {
  //         text: {
  //           fill: colors.grey[100],
  //         },
  //       },
  //     }}
  //     // keys={["hot dog", "burger", "sandwich", "kebab", "fries", "donut"]}
  //     keys={["tickets resolved","calls answered","live chats handled","emails responded"]}
  //     indexBy="country"
  //     margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
  //     padding={0.3}
  //     valueScale={{ type: "linear" }}
  //     indexScale={{ type: "band", round: true }}
  //     colors={{ scheme: "nivo" }}
  //     defs={[
  //       {
  //         id: "dots",
  //         type: "patternDots",
  //         background: "inherit",
  //         color: "#38bcb2",
  //         size: 4,
  //         padding: 1,
  //         stagger: true,
  //       },
  //       {
  //         id: "lines",
  //         type: "patternLines",
  //         background: "inherit",
  //         color: "#eed312",
  //         rotation: -45,
  //         lineWidth: 6,
  //         spacing: 10,
  //       },
  //     ]}
  //     borderColor={{
  //       from: "color",
  //       modifiers: [["darker", "1.6"]],
  //     }}
  //     axisTop={null}
  //     axisRight={null}
  //     axisBottom={{
  //       tickSize: 5,
  //       tickPadding: 5,
  //       tickRotation: 0,
  //       legend: isDashboard ? undefined : "country", // changed
  //       legendPosition: "middle",
  //       legendOffset: 32,
  //     }}
  //     axisLeft={{
  //       tickSize: 5,
  //       tickPadding: 5,
  //       tickRotation: 0,
  //       legend: isDashboard ? undefined : "Customers", // changed
  //       legendPosition: "middle",
  //       legendOffset: -40,
  //     }}
  //     enableLabel={false}
  //     labelSkipWidth={12}
  //     labelSkipHeight={12}
  //     labelTextColor={{
  //       from: "color",
  //       modifiers: [["darker", 1.6]],
  //     }}
  //     legends={[
  //       {
  //         dataFrom: "keys",
  //         anchor: "bottom-right",
  //         direction: "column",
  //         justify: false,
  //         translateX: 120,
  //         translateY: 0,
  //         itemsSpacing: 2,
  //         itemWidth: 100,
  //         itemHeight: 20,
  //         itemDirection: "left-to-right",
  //         itemOpacity: 0.85,
  //         symbolSize: 20,
  //         effects: [
  //           {
  //             on: "hover",
  //             style: {
  //               itemOpacity: 1,
  //             },
  //           },
  //         ],
  //       },
  //     ]}
  //     role="application"
  //     barAriaLabel={function (e) {
  //       return e.id + ": " + e.formattedValue + " in country: " + e.indexValue;
  //     }}
  //   />
  // );

  return (
    // <Box sx={{
    //   height: isDashboard ? '300px' : '75vh',
    //   width: '100%',
    //   display: 'flex',
    //   flexDirection: 'column',
    //   justifyContent: 'center',
    //   alignItems: 'center',
    //   p: 2,
    //   '& .bar-chart-container': {
    //     width: '100%',
    //     height: '100%',
    //     maxWidth: '1200px',
    //   }
    // }}>
    //   <Typography variant="h5" sx={{ mb: 2, color: colors.grey[100] }}>
    //     Customer Service Performance
    //   </Typography>
    //   <Box className="bar-chart-container">
    //     <ResponsiveBar
    //       data={data}
    //       theme={{
    //         axis: {
    //           domain: { line: { stroke: colors.grey[100] } },
    //           legend: { text: { fill: colors.grey[100] } },
    //           ticks: {
    //             line: { stroke: colors.grey[100], strokeWidth: 1 },
    //             text: { fill: colors.grey[100] },
    //           },
    //         },
    //         legends: { text: { fill: colors.grey[100] } },
    //         tooltip: {
    //           container: {
    //             background: colors.primary[400],
    //             color: colors.grey[100],
    //           },
    //         },
    //       }}
    //       keys={["tickets resolved", "calls answered", "live chats handled", "emails responded"]}
    //       indexBy="country"
    //       margin={{ top: 50, right: isMobile ? 20 : 130, bottom: isMobile ? 120 : 50, left: isMobile ? 50 : 60 }}
    //       padding={0.3}
    //       valueScale={{ type: "linear" }}
    //       indexScale={{ type: "band", round: true }}
    //       colors={{ scheme: "nivo" }}
    //       borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
    //       axisTop={null}
    //       axisRight={null}
    //       axisBottom={{
    //         tickSize: 5,
    //         tickPadding: 5,
    //         tickRotation: isMobile ? 45 : 0,
    //         legend: isDashboard ? undefined : "Country",
    //         legendPosition: "middle",
    //         legendOffset: 32,
    //         truncateTickAt: 0,
    //       }}
    //       axisLeft={{
    //         tickSize: 5,
    //         tickPadding: 5,
    //         tickRotation: 0,
    //         legend: isDashboard ? undefined : "Number of Interactions",
    //         legendPosition: "middle",
    //         legendOffset: -40,
    //         truncateTickAt: 0,
    //       }}
    //       enableLabel={false}
    //       labelSkipWidth={12}
    //       labelSkipHeight={12}
    //       labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
    //       legends={[
    //         {
    //           dataFrom: "keys",
    //           anchor: isMobile ? "bottom-left" : "bottom-right",
    //           direction: isMobile || isTablet ? "row" : "column",
    //           justify: false,
    //           translateX: isMobile ? 0 : 120,
    //           translateY: isMobile ? 80 : 0,
    //           itemsSpacing: isMobile ? 2 : 2,
    //           itemWidth: isMobile ? 80 : 100,
    //           itemHeight: 20,
    //           itemDirection: "left-to-right",
    //           itemOpacity: 0.85,
    //           symbolSize: 20,
    //           effects: [
    //             {
    //               on: "hover",
    //               style: {
    //                 itemOpacity: 1,
    //               },
    //             },
    //           ],
    //         },
    //       ]}
    //       role="application"
    //       ariaLabel="Customer Service Performance Chart"
    //       barAriaLabel={e => `${e.id}: ${e.formattedValue} in country: ${e.indexValue}`}
    //     />
    //   </Box>
    // </Box>

    <Box sx={{
      height: isDashboard ? '300px' : '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      p: 2,
      overflow: 'hidden', // Prevent content from overflowing
      '& .bar-chart-container': {
        width: '100%',
        height: isDashboard ? '100%' : 'calc(100% - 40px)', // Subtract title height
        maxWidth: '1200px',
      }
    }}>
      <Typography variant="h5" sx={{ mt: 2, color: colors.grey[100] }}>
        Customer Service Performance
      </Typography>
      <Box className="bar-chart-container">
        <ResponsiveBar
          data={data}
          theme={{
            axis: {
              domain: { line: { stroke: colors.grey[100] } },
              legend: { text: { fill: colors.grey[100] } },
              ticks: {
                line: { stroke: colors.grey[100], strokeWidth: 1 },
                text: { fill: colors.grey[100] },
              },
            },
            legends: { text: { fill: colors.grey[100] } },
            tooltip: {
              container: {
                background: colors.primary[400],
                color: colors.grey[100],
              },
            },
          }}
          keys={["tickets resolved", "calls answered", "live chats handled", "emails responded"]}
          indexBy="state"
          margin={{ top: 50, right: isMobile ? 20 : 130, bottom: isMobile ? 120 : 50, left: isMobile ? 50 : 60 }}
          padding={0.2} // Reduced padding between bars
          innerPadding={2} // Added inner padding for grouped bars
          groupMode="grouped"
          valueScale={{ type: "linear" }}
          indexScale={{ type: "band", round: true }}
          colors={{ scheme: "nivo" }}
          borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: isMobile ? 45 : 0,
            legend: isDashboard ? undefined : "state",
            legendPosition: "middle",
            legendOffset: 32,
            truncateTickAt: 0,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: isDashboard ? undefined : "Number of Interactions",
            legendPosition: "middle",
            legendOffset: -40,
            truncateTickAt: 0,
          }}
          enableLabel={false}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
          legends={[
            {
              dataFrom: "keys",
              anchor: isMobile ? "bottom-left" : "bottom-right",
              direction: isMobile || isTablet ? "row" : "column",
              justify: false,
              translateX: isMobile ? 0 : 120,
              translateY: isMobile ? 80 : 0,
              itemsSpacing: isMobile ? 2 : 2,
              itemWidth: isMobile ? 80 : 100,
              itemHeight: 20,
              itemDirection: "left-to-right",
              itemOpacity: 0.85,
              symbolSize: 20,
              effects: [
                {
                  on: "hover",
                  style: {
                    itemOpacity: 1,
                  },
                },
              ],
            },
          ]}
          role="application"
          ariaLabel="Customer Service Performance Chart"
          barAriaLabel={e => `${e.id}: ${e.formattedValue} in state: ${e.indexValue}`}
        />
      </Box>
    </Box>

  );
};

// const BarChart = ({ data, isDashboard = false }) => {
//   const theme = useTheme();
//   const colors = tokens(theme.palette.mode);

//   return (
//     <div style={{ width: '100%', height: '100%', maxWidth: '100%', overflow: 'hidden' }}>
//       <ResponsiveBar
//         data={data}
//         theme={{
//           axis: {
//             domain: {
//               line: {
//                 stroke: colors.grey[100],
//               },
//             },
//             legend: {
//               text: {
//                 fill: colors.grey[100],
//               },
//             },
//             ticks: {
//               line: {
//                 stroke: colors.grey[100],
//                 strokeWidth: 1,
//               },
//               text: {
//                 fill: colors.grey[100],
//               },
//             },
//           },
//           legends: {
//             text: {
//               fill: colors.grey[100],
//             },
//           },
//         }}
//         keys={["tickets resolved", "calls answered", "live chats handled", "emails responded"]}
//         indexBy="country"
//         margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
//         padding={0.3}
//         valueScale={{ type: "linear" }}
//         indexScale={{ type: "band", round: true }}
//         colors={{ scheme: "nivo" }}
//         defs={[
//           {
//             id: "dots",
//             type: "patternDots",
//             background: "inherit",
//             color: "#38bcb2",
//             size: 4,
//             padding: 1,
//             stagger: true,
//           },
//           {
//             id: "lines",
//             type: "patternLines",
//             background: "inherit",
//             color: "#eed312",
//             rotation: -45,
//             lineWidth: 6,
//             spacing: 10,
//           },
//         ]}
//         borderColor={{
//           from: "color",
//           modifiers: [["darker", "1.6"]],
//         }}
//         axisTop={null}
//         axisRight={null}
//         axisBottom={{
//           tickSize: 5,
//           tickPadding: 5,
//           tickRotation: 0,
//           legend: isDashboard ? undefined : "country",
//           legendPosition: "middle",
//           legendOffset: 32,
//         }}
//         axisLeft={{
//           tickSize: 5,
//           tickPadding: 5,
//           tickRotation: 0,
//           legend: isDashboard ? undefined : "Customers",
//           legendPosition: "middle",
//           legendOffset: -40,
//         }}
//         enableLabel={false}
//         labelSkipWidth={12}
//         labelSkipHeight={12}
//         labelTextColor={{
//           from: "color",
//           modifiers: [["darker", 1.6]],
//         }}
//         legends={[
//           {
//             dataFrom: "keys",
//             anchor: "bottom-right", // default position
//             direction: "column",
//             justify: false,
//             translateX: 120,
//             translateY: 0,
//             itemsSpacing: 2,
//             itemWidth: 100,
//             itemHeight: 20,
//             itemDirection: "left-to-right",
//             itemOpacity: 0.85,
//             symbolSize: 20,
//             effects: [
//               {
//                 on: "hover",
//                 style: {
//                   itemOpacity: 1,
//                 },
//               },
//             ],
//           },
//         ]}
//         role="application"
//         barAriaLabel={function (e) {
//           return e.id + ": " + e.formattedValue + " in country: " + e.indexValue;
//         }}
//       />
//     </div>
//   );
// };



export default BarChart;
