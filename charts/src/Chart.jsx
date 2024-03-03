import { LineChart } from "@mui/x-charts/LineChart";

export default function Chart({ selected, type, data }) {
  const noTimeFormater = (date) => date.toString().slice(4, 15);
  if (selected) {
    const dates = Object.keys(data[selected]);
    const values = Object.values(data[selected]);
    return (
      <LineChart
        xAxis={[
          {
            id: "dates",
            data: dates.map((el) => new Date(el)),
            scaleType: "time",
            valueFormatter: noTimeFormater,
            label: "Date",
          },
        ]}
        yAxis={[
          {
            min:
              Math.min(...values) -
                (Math.max(...values) - Math.min(...values)) * 0.2 >=
              0
                ? Math.min(...values) -
                  (Math.max(...values) - Math.min(...values)) * 0.2
                : 0,
            max:
              Math.max(...values) +
              (Math.max(...values) - Math.min(...values)) * 0.2,
            label: type !== "Max reps" ? "Weight" : "Reps",
            scaleType: "linear",
            labelStyle: {
              padding: 14,
            },
          },
        ]}
        series={[
          {
            curve: "linear",
            data: values,
          },
        ]}
        sx={{
          ".MuiLineElement-root": {
            stroke: "#0B6BCB",
            strokeWidth: 2,
          },
          ".MuiMarkElement-root": {
            stroke: "#0B6BCB",
            scale: "00",
            fill: "#fff",
            strokeWidth: 0,
          },
        }}
        margin={{
          left: 50,
          right: 10,
        }}
        minWidth={180}
        minHeight={150}
      />
    );
  } else {
    return <p>Please select an exercise.</p>;
  }
}
