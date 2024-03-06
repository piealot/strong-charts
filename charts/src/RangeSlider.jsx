import { Slider } from "@mui/material";

export default function RangeSlider({ selected, type, range, setRange }) {
  if (
    (selected && type !== "Workouts per week") ||
    type === "Workouts per week"
  ) {
    const minDistance = 10;
    const handleChange = (event, newValue, activeThumb) => {
      if (newValue[1] - newValue[0] < minDistance) {
        if (activeThumb === 0) {
          const clamped = Math.min(newValue[0], 100 - minDistance);
          setRange([clamped, clamped + minDistance]);
        } else {
          const clamped = Math.max(newValue[1], minDistance);
          setRange([clamped - minDistance, clamped]);
        }
      } else {
        setRange(newValue);
      }
    };

    return (
      <Slider
        value={range}
        onChange={handleChange}
        valueLabelDisplay="auto"
        valueLabelFormat={(el) => el + " %"}
        min={0}
        max={100}
        size="small"
        sx={{
          marginTop: -2,
        }}
      />
    );
  }
}
