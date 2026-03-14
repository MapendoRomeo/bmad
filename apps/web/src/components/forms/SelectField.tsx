import { TextField, MenuItem, TextFieldProps } from '@mui/material';

interface Option {
  value: string;
  label: string;
}

interface SelectFieldProps extends Omit<TextFieldProps, 'error' | 'select'> {
  options: Option[];
  error?: string;
  emptyLabel?: string;
}

export default function SelectField({ options, error, emptyLabel = 'Sélectionner...', ...props }: SelectFieldProps) {
  return (
    <TextField
      {...props}
      select
      error={!!error}
      helperText={error || props.helperText}
      sx={{
        '& .MuiOutlinedInput-root': { borderRadius: 2 },
        ...props.sx,
      }}
    >
      <MenuItem value="">
        <em>{emptyLabel}</em>
      </MenuItem>
      {options.map((opt) => (
        <MenuItem key={opt.value} value={opt.value}>
          {opt.label}
        </MenuItem>
      ))}
    </TextField>
  );
}
