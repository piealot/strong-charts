import React, { useState, useEffect, useMemo } from "react";
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import useMediaQuery from "@mui/material/useMediaQuery";
import { styled } from "@mui/material";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Chart from "./Chart.jsx";
import Paper from "@mui/material/Paper";
import Grow from "@mui/material/Grow";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import IconButton from "@mui/material/IconButton";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import HelpIcon from "@mui/icons-material/Help";
import Drawer from "@mui/material/Drawer";
import "./App.css";

function App() {
  const [rawData, setRawData] = useState([]);
  const [data, setData] = useState({});
  const [active, setActive] = useState(false);
  const [selectedExercise, setExercise] = useState("");
  const [selectedChartType, setChartType] = useState("Max weight");
  const [darkMode, setDarkMode] = useState(
    useMediaQuery("(prefers-color-scheme: dark)")
  );
  const [open, setOpen] = React.useState(false);

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
    const fileExtension = event.target.files[0].type.split("/")[1];
    if (!["csv"].includes(fileExtension)) {
      setActive(false);
      alert("Please input a csv file");
      return;
    }

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
      if (
        !parsedData[0].hasOwnProperty("Date") ||
        !parsedData[0].hasOwnProperty("Exercise Name") ||
        !parsedData[0].hasOwnProperty("Reps") ||
        !parsedData[0].hasOwnProperty("Weight")
      ) {
        setActive(false);
        alert("Please input a csv file exported from Strong");
        return;
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
        if (record.Date) {
          const weight = parseFloat(record.Weight);

          if (!exercises.hasOwnProperty(record["Exercise Name"])) {
            exercises[record["Exercise Name"]] = {
              [record.Date]: weight,
            };
          } else {
            if (
              exercises[record["Exercise Name"]].hasOwnProperty(record.Date)
            ) {
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
      }
      setData(exercises);
    } else if (selectedChartType === "Max reps") {
      const exercises = {};

      for (const record of rawData) {
        if (record.Date) {
          const reps = parseInt(record.Reps);

          if (!exercises.hasOwnProperty(record["Exercise Name"])) {
            exercises[record["Exercise Name"]] = {
              [record.Date]: reps,
            };
          } else {
            if (
              exercises[record["Exercise Name"]].hasOwnProperty(record.Date)
            ) {
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
      }
      setData(exercises);
    } else if (selectedChartType === "1RM") {
      const exercises = {};

      for (const record of rawData) {
        if (record.Date) {
          const onerep = Math.floor(
            parseFloat(record.Weight) /
              (1.0278 - 0.0278 * parseInt(record.Reps))
          );

          if (!exercises.hasOwnProperty(record["Exercise Name"])) {
            exercises[record["Exercise Name"]] = {
              [record.Date]: onerep,
            };
          } else {
            if (
              exercises[record["Exercise Name"]].hasOwnProperty(record.Date)
            ) {
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
      }
      setData(exercises);
    } else if (selectedChartType === "Total volume") {
      const exercises = {};

      for (const record of rawData) {
        if (record.Date) {
          const volume = parseFloat(record.Weight) * record.Reps;
          if (!exercises.hasOwnProperty(record["Exercise Name"])) {
            exercises[record["Exercise Name"]] = {
              [record.Date]: volume,
            };
          } else {
            if (
              exercises[record["Exercise Name"]].hasOwnProperty(record.Date)
            ) {
              exercises[record["Exercise Name"]][record.Date] += volume;
            } else {
              exercises[record["Exercise Name"]] = {
                ...exercises[record["Exercise Name"]],
                [record.Date]: volume,
              };
            }
          }
        }
      }
      setData(exercises);
    }
  }
  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
    },

    "@global": {
      "*::-webkit-scrollbar": {
        width: "0.4em",
      },
      "*::-webkit-scrollbar-track": {
        "-webkit-box-shadow": "inset 0 0 6px rgba(0,0,0,0.00)",
      },
      "*::-webkit-scrollbar-thumb": {
        backgroundcolor: "rgba(0,0,0,.1)",
        outline: "1px solid slategrey",
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Drawer
        open={open}
        onClose={() => {
          setOpen(false);
        }}
      >
        <div className="help">
          <p>
            To generate charts for your gym result, first you need to export
            data from Strong app.
          </p>
          <img className="helpImg" src="./export.gif" alt="loading..." />
          <p>
            After exporting your data, next step is to upload the file you
            saved.
          </p>
          <img className="helpImg" src="./button.gif" alt="loading..." />
          <p>
            Done! Now select an exercise and a chart type to display desired
            data.
          </p>
        </div>
      </Drawer>
      <IconButton
        onClick={() => {
          darkMode ? setDarkMode(false) : setDarkMode(true);
        }}
        aria-label="dark-mode"
        sx={{ position: "fixed", top: 20, right: 20 }}
      >
        {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
      <IconButton
        onClick={() => {
          setOpen(true);
        }}
        aria-label="help"
        sx={{ position: "fixed", top: 20, left: 20 }}
      >
        <HelpIcon />
      </IconButton>
      <h1>Strong App Charts</h1>
      <Button
        className="button"
        component="label"
        role={undefined}
        variant="contained"
        tabIndex={-1}
        startIcon={<CloudUploadIcon />}
      >
        Upload a file
        <VisuallyHiddenInput onChange={handleFileChange} type="file" />
      </Button>
      <Grow in={active} mountOnEnter unmountOnExit>
        <Paper
          className="paper"
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
    </ThemeProvider>
  );
}

export default App;
