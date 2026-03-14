import { useState, useEffect } from 'react';
import { TextField, InputAdornment } from '@mui/material';
import { Search } from '@mui/icons-material';

interface SearchBarProps {
  value?: string;
  placeholder?: string;
  delay?: number;
  onChange: (value: string) => void;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
}

export default function SearchBar({
  value: externalValue, placeholder = 'Rechercher...', delay = 300,
  onChange, fullWidth = false, size = 'small',
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(externalValue || '');

  useEffect(() => {
    if (externalValue !== undefined) setLocalValue(externalValue);
  }, [externalValue]);

  useEffect(() => {
    const timer = setTimeout(() => onChange(localValue), delay);
    return () => clearTimeout(timer);
  }, [localValue, delay]);

  return (
    <TextField
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      placeholder={placeholder}
      size={size}
      fullWidth={fullWidth}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search fontSize="small" color="action" />
          </InputAdornment>
        ),
      }}
      sx={{ minWidth: 250, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
    />
  );
}
