import React, { useState, useEffect } from "react";
import Button from "@mui/joy/Button";
import SvgIcon from "@mui/joy/SvgIcon";
import { styled } from "@mui/joy";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Chart from "./Chart.jsx";
import Paper from "@mui/material/Paper";
import Grow from "@mui/material/Grow";

import "./App.css";

function App() {
  const [rawData, setRawData] = useState([]);
  const [data, setData] = useState({});
  const [active, setActive] = useState(false);
  const [selectedExercise, setExercise] = useState("");
  const [selectedChartType, setChartType] = useState("Max weight");

  const VisuallyHiddenInput = styled("input")`
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    height: 1px;
    overflow: hidden;
    position: absolute;
    bottom: 0;
    left: 0;
    white-space: nowrap;
    width: 1px;
  `;

  useEffect(() => {
    prepareData();
  }, [rawData, selectedChartType]);

  const handleFileChange = (event) => {
    const reader = new FileReader();
    reader.onload = async ({ target }) => {
      const contents = target.result;
      const lines = contents.split("\n");
      const header = lines[0].split(",");
      const parsedData = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].split(",");
        const item = {};

        for (let j = 0; j < header.length; j++) {
          const key = header[j].trim();
          const value = line[j]?.trim().replaceAll('"', "");
          item[key] = value;
        }

        parsedData.push(item);
      }
      setActive(true);
      setRawData(parsedData);
    };
    reader.readAsText(event.target.files[0]);
  };

  function prepareData() {
    if (selectedChartType === "Max weight") {
      const exercises = {};

      for (const record of rawData) {
        const weight = parseFloat(record.Weight);

        if (!exercises.hasOwnProperty(record["Exercise Name"])) {
          exercises[record["Exercise Name"]] = {
            [record.Date]: weight,
          };
        } else {
          if (exercises[record["Exercise Name"]].hasOwnProperty(record.Date)) {
            if (exercises[record["Exercise Name"]][record.Date] < weight) {
              exercises[record["Exercise Name"]][record.Date] = weight;
            }
          } else {
            exercises[record["Exercise Name"]] = {
              ...exercises[record["Exercise Name"]],
              [record.Date]: weight,
            };
          }
        }
      }
      setData(exercises);
    } else if (selectedChartType === "Max reps") {
      const exercises = {};

      for (const record of rawData) {
        const reps = parseInt(record.Reps);

        if (!exercises.hasOwnProperty(record["Exercise Name"])) {
          exercises[record["Exercise Name"]] = {
            [record.Date]: reps,
          };
        } else {
          if (exercises[record["Exercise Name"]].hasOwnProperty(record.Date)) {
            if (exercises[record["Exercise Name"]][record.Date] < reps) {
              exercises[record["Exercise Name"]][record.Date] = reps;
            }
          } else {
            exercises[record["Exercise Name"]] = {
              ...exercises[record["Exercise Name"]],
              [record.Date]: reps,
            };
          }
        }
      }
      setData(exercises);
    } else if (selectedChartType === "1RM") {
      const exercises = {};

      for (const record of rawData) {
        const onerep = Math.floor(
          parseFloat(record.Weight) / (1.0278 - 0.0278 * parseInt(record.Reps))
        );

        if (!exercises.hasOwnProperty(record["Exercise Name"])) {
          exercises[record["Exercise Name"]] = {
            [record.Date]: onerep,
          };
        } else {
          if (exercises[record["Exercise Name"]].hasOwnProperty(record.Date)) {
            if (exercises[record["Exercise Name"]][record.Date] < onerep) {
              exercises[record["Exercise Name"]][record.Date] = onerep;
            }
          } else {
            exercises[record["Exercise Name"]] = {
              ...exercises[record["Exercise Name"]],
              [record.Date]: onerep,
            };
          }
        }
      }
      setData(exercises);
    } else if (selectedChartType === "Total volume") {
      const exercises = {};

      for (const record of rawData) {
        const volume = parseFloat(record.Weight) * record.Reps;
        if (!exercises.hasOwnProperty(record["Exercise Name"])) {
          exercises[record["Exercise Name"]] = {
            [record.Date]: volume,
          };
        } else {
          if (exercises[record["Exercise Name"]].hasOwnProperty(record.Date)) {
            exercises[record["Exercise Name"]][record.Date] += volume;
          } else {
            exercises[record["Exercise Name"]] = {
              ...exercises[record["Exercise Name"]],
              [record.Date]: volume,
            };
          }
        }
      }
      setData(exercises);
    }
  }

  return (
    <>
      <h1>Strong App Charts</h1>
      <Button
        component="label"
        role={undefined}
        startDecorator={
          <SvgIcon>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
              />
            </svg>
          </SvgIcon>
        }
      >
        Upload a file
        <VisuallyHiddenInput onChange={handleFileChange} type="file" />
      </Button>
      <Grow in={active} mountOnEnter unmountOnExit>
        <Paper
          elevation={3}
          sx={{
            margin: "10px auto",
            width: "95%",
          }}
        >
          <div className="select">
            <FormControl fullWidth>
              <InputLabel id="exercise-select-label">Exercise</InputLabel>
              <Select
                labelId="exercise-select-label"
                id="exercise-select"
                value={selectedExercise}
                label="Exercise"
                onChange={(event) => {
                  setExercise(event.target.value);
                }}
              >
                {Object.keys(data).map((el) => {
                  return (
                    <MenuItem key={el} value={el}>
                      {el}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="type-select-label">Chart type</InputLabel>
              <Select
                labelId="type-select-label"
                id="type-select"
                value={selectedChartType}
                label="Chart type"
                onChange={(event) => {
                  setChartType(event.target.value);
                }}
              >
                <MenuItem key="Max weight" value="Max weight">
                  Max weight
                </MenuItem>
                <MenuItem key="Max reps" value="Max reps">
                  Max reps
                </MenuItem>
                <MenuItem key="1RM" value="1RM">
                  1RM
                </MenuItem>
                <MenuItem key="Total volume" value="Total volume">
                  Total volume
                </MenuItem>
              </Select>
            </FormControl>
          </div>

          <div className="chart">
            <Chart
              selected={selectedExercise}
              type={selectedChartType}
              data={data}
            />
          </div>
        </Paper>
      </Grow>
    </>
  );
}

export default App;
