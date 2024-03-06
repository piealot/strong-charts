import React, { useState, useEffect } from "react";
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
import GitHubIcon from "@mui/icons-material/GitHub";
import "./App.css";
import RangeSlider from "./RangeSlider.jsx";

function App() {
  const [rawData, setRawData] = useState([]);
  const [data, setData] = useState({});
  const [active, setActive] = useState(false);
  const [selectedExercise, setExercise] = useState("");
  const [selectedChartType, setChartType] = useState("Max weight");
  const [darkMode, setDarkMode] = useState(
    useMediaQuery("(prefers-color-scheme: dark)")
  );
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState([0, 100]);

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
    },
  });

  useEffect(() => {
    if (selectedChartType === "Workouts per week") {
      setExercise("");
    }
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
        if (lines[i] !== "") {
          const line = lines[i].split(",");
          const item = {};

          for (let j = 0; j < header.length; j++) {
            const key = header[j].trim();
            const value = line[j]?.trim().replaceAll('"', "");
            item[key] = value;
          }
          parsedData.push(item);
        }
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
    } else if (selectedChartType === "Workouts per week") {
      const workouts = {};
      const yearWeek = [
        Number(rawData[0].Date.slice(0, 4)),
        getWeekNumber(new Date(rawData[0].Date)),
      ];
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentWeek = getWeekNumber(now);
      while (yearWeek[0] < currentYear || yearWeek[1] <= currentWeek) {
        workouts[yearWeek[0].toString() + yearWeek[1].toString()] = [];
        if (yearWeek[1] >= 53) {
          yearWeek[0] += 1;
          yearWeek[1] = 1;
        } else {
          yearWeek[1] += 1;
        }
      }
      for (const record of rawData) {
        if (record.Date) {
          const year = record.Date.slice(0, 4);
          const weekNumber = getWeekNumber(new Date(record.Date));

          if (!workouts.hasOwnProperty(year + weekNumber)) {
            workouts[year + weekNumber] = [record.Date];
          } else {
            if (!workouts[year + weekNumber].includes(record.Date)) {
              workouts[year + weekNumber] = [
                ...workouts[year + weekNumber],
                record.Date,
              ];
            }
          }
        }
      }
      setData(workouts);
    }
  }

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
        aria-label="github"
        className="github"
        sx={{ position: "fixed", bottom: 10, right: 10 }}
      >
        <a href="https://github.com/piealot/strong-charts" target="_blank">
          <GitHubIcon />
        </a>
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
      <h1>
        Strong <span style={{ color: "#03a9f4" }}>App</span>{" "}
        <strong>Charts</strong>
      </h1>
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
                disabled={
                  selectedChartType === "Workouts per week" ? true : false
                }
                labelId="exercise-select-label"
                id="exercise-select"
                value={selectedExercise}
                label="Exercise"
                onChange={(event) => {
                  setExercise(event.target.value);
                }}
              >
                {Object.keys(data)
                  .sort()
                  .map((el) => {
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
                <MenuItem key="Workouts per week" value="Workouts per week">
                  <span style={{ color: darkMode ? "#42A5F5" : "#0B6BCB" }}>
                    Workouts per week
                  </span>
                </MenuItem>
              </Select>
            </FormControl>
          </div>

          <div className="chart">
            <Chart
              selected={selectedExercise}
              type={selectedChartType}
              data={data}
              setData={setData}
              darkMode={darkMode}
              range={range}
            />
          </div>
          <div className="slider">
            <RangeSlider
              selected={selectedExercise}
              type={selectedChartType}
              range={range}
              setRange={setRange}
            />
          </div>
        </Paper>
      </Grow>
    </ThemeProvider>
  );
}

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

function getWeekNumber(date) {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diff = date - startOfYear;
  const oneWeek = 604800000; // milliseconds in a week
  const weekNumber = Math.ceil(diff / oneWeek);
  return weekNumber;
}

export default App;
