import { useState } from 'react';
import { Box, Button, Collapse, IconButton, Stack, Typography } from '@mui/material';
import { FilterList, ExpandMore, ExpandLess, Clear } from '@mui/icons-material';

interface FilterPanelProps {
  children: React.ReactNode;
  onReset?: () => void;
  defaultExpanded?: boolean;
  title?: string;
}

export default function FilterPanel({ children, onReset, defaultExpanded = false, title = 'Filtres' }: FilterPanelProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <IconButton size="small" onClick={() => setExpanded(!expanded)}>
          <FilterList fontSize="small" />
        </IconButton>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>
          {title}
        </Typography>
        {expanded ? <ExpandLess fontSize="small" color="action" /> : <ExpandMore fontSize="small" color="action" />}
        {onReset && expanded && (
          <Button size="small" startIcon={<Clear fontSize="small" />} onClick={onReset} sx={{ ml: 'auto' }}>
            Réinitialiser
          </Button>
        )}
      </Box>
      <Collapse in={expanded}>
        <Stack direction="row" flexWrap="wrap" gap={2} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
          {children}
        </Stack>
      </Collapse>
    </Box>
  );
}
