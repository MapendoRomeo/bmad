import { TextField, TextFieldProps, FormControl, FormHelperText } from '@mui/material';

interface FormFieldProps extends Omit<TextFieldProps, 'error'> {
  error?: string;
}

export default function FormField({ error, helperText, ...props }: FormFieldProps) {
  return (
    <FormControl fullWidth={props.fullWidth} error={!!error}>
      <TextField
        {...props}
        error={!!error}
        helperText={error || helperText}
        sx={{
          '& .MuiOutlinedInput-root': { borderRadius: 2 },
          ...props.sx,
        }}
      />
    </FormControl>
  );
}
