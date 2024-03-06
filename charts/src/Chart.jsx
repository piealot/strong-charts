import { LineChart } from "@mui/x-charts/LineChart";
import { BarChart } from "@mui/x-charts/BarChart";
import { useMemo } from "react";

export default function Chart({ selected, type, data, darkMode, range }) {
  const noTimeFormater = (date) => date.toString().slice(4, 15);
  const barData = useMemo(
    () => [
      Object.keys(data).sort(
        (a, b) =>
          new Date(a.slice(0, 4), 0, a.slice(4, 6)) -
          new Date(b.slice(0, 4), 0, b.slice(4, 6))
      ),
      Object.keys(data)
        .sort(
          (a, b) =>
            new Date(a.slice(0, 4), 0, a.slice(4, 6)) -
            new Date(b.slice(0, 4), 0, b.slice(4, 6))
        )
        .map((el) => data[el].length),
    ],
    [data]
  );

  if (selected && type !== "Workouts per week") {
    const dates = Object.keys(data[selected]).slice(
      Math.floor(range[0] * 0.01 * Object.keys(data[selected]).length),
      Math.floor(range[1] * 0.01 * Object.keys(data[selected]).length)
    );
    const values = Object.values(data[selected]).slice(
      Math.floor(range[0] * 0.01 * Object.values(data[selected]).length),
      Math.floor(range[1] * 0.01 * Object.values(data[selected]).length)
    );
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
            tickMinStep: type === "Max reps" ? 1 : 0.1,
          },
        ]}
        series={[
          {
            curve: "linear",
            data: values,
            color: darkMode ? "#42A5F5" : "#0B6BCB",
          },
        ]}
        sx={{
          ".MuiLineElement-root": {
            strokeWidth: 2,
          },
          ".MuiMarkElement-root": {
            scale: "0.7",
            fill: "#fff",
            strokeWidth: 3,
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
  } else if (type === "Workouts per week") {
    const weeks = barData[0].slice(
      Math.floor(range[0] * 0.01 * barData[0].length),
      Math.floor(range[1] * 0.01 * barData[0].length)
    );
    const workouts = barData[1].slice(
      Math.floor(range[0] * 0.01 * barData[1].length),
      Math.floor(range[1] * 0.01 * barData[1].length)
    );

    return (
      <BarChart
        xAxis={[
          {
            scaleType: "band",
            data: weeks,
            valueFormatter: weekFormatter,
          },
        ]}
        yAxis={[
          {
            tickMinStep: 1,
          },
        ]}
        series={[
          {
            data: workouts,
            color: darkMode ? "#42A5F5" : "#0B6BCB",
          },
        ]}
        margin={{
          left: 50,
          right: 10,
        }}
        minWidth={180}
        minHeight={150}
        color="black"
      />
    );
  } else {
    return <p>Please select an exercise.</p>;
  }
}

const weekFormatter = (week) => {
  const date = new Date(week.slice(0, 4), 0, 7 * week.slice(4) - 6);
  // return `${date.getDate()}/${date.getMonth() + 1}`;
  return date.toDateString().slice(4);
};
