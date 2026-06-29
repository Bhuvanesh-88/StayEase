import { Button, MenuItem, Paper, Stack, TextField } from "@mui/material";

interface Props {
  city: string;
  propertyType: string;
  minRent: string;
  maxRent: string;
  onCityChange: (value: string) => void;
  onPropertyTypeChange: (value: string) => void;
  onMinRentChange: (value: string) => void;
  onMaxRentChange: (value: string) => void;
  onReset: () => void;
}

export default function PropertyFilters(props: Props) {
  return (
    <Paper sx={{ p: 2, borderRadius: 4 }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <TextField
          label="City"
          value={props.city}
          onChange={(e) => props.onCityChange(e.target.value)}
          fullWidth
        />
        
        <TextField
          select
          label="Property Type"
          value={props.propertyType}
          onChange={(e) => props.onPropertyTypeChange(e.target.value)}
          fullWidth
        >
          <MenuItem value="">All Types</MenuItem>
          <MenuItem value="PG">PG</MenuItem>
          <MenuItem value="HOSTEL">Hostel</MenuItem>
          <MenuItem value="APARTMENT">Apartment</MenuItem>
        </TextField>

        <TextField
          label="Min Rent"
          type="number"
          value={props.minRent}
          onChange={(e) => props.onMinRentChange(e.target.value)}
          fullWidth
        />
        
        <TextField
          label="Max Rent"
          type="number"
          value={props.maxRent}
          onChange={(e) => props.onMaxRentChange(e.target.value)}
          fullWidth
        />

        <Button variant="outlined" onClick={props.onReset} sx={{ minWidth: 100 }}>
          Reset
        </Button>
      </Stack>
    </Paper>
  );
}