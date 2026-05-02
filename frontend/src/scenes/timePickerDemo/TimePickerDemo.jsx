import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  useTheme,
  Divider,
  Chip,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';
import { tokens } from '../../theme';
import { ModernTimePicker } from '../customComponents/ModernTimePicker';
import { CompactTimePicker, InlineTimePicker } from '../customComponents/CompactTimePickers';
import { DropdownTimePicker, CompactTimeInput, QuickTimeSelector } from '../customComponents/TimeInput';

const TimePickerDemo = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // State for each time picker
  const [muiTime, setMuiTime] = useState(null);
  const [modernTime, setModernTime] = useState(null);
  const [compactTime, setCompactTime] = useState(null);
  const [inlineTime, setInlineTime] = useState(null);
  const [dropdownTime, setDropdownTime] = useState('');
  const [compactInputTime, setCompactInputTime] = useState('');
  const [quickSelectTime, setQuickSelectTime] = useState('');

  const timePickerData = [
    {
      name: 'Original MUI TimePicker',
      description: 'The standard MUI TimePicker with digital clock popup',
      value: muiTime,
      setValue: setMuiTime,
      component: (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <TimePicker
            label="MUI TimePicker"
            value={muiTime}
            onChange={(newValue) => setMuiTime(newValue)}
            slotProps={{
              textField: {
                fullWidth: true,
                variant: "outlined",
                size: "medium",
              }
            }}
          />
        </LocalizationProvider>
      ),
      pros: ['Standard MUI component', 'Comprehensive time selection'],
      cons: ['Large popup', 'Not very compact', 'Complex styling'],
    },
    {
      name: 'ModernTimePicker',
      description: 'Our custom time picker with quick presets and compact selectors',
      value: modernTime,
      setValue: setModernTime,
      component: (
        <ModernTimePicker
          label="Modern TimePicker"
          value={modernTime}
          onChange={(newValue) => setModernTime(newValue)}
          fullWidth
          size="medium"
        />
      ),
      pros: ['Quick time presets', 'Compact popup', 'Modern design', 'Drop-in replacement'],
      cons: ['Custom component', 'Limited to 15-minute intervals'],
    },
    {
      name: 'CompactTimePicker',
      description: 'Ultra-compact HTML5 time input with dayjs compatibility',
      value: compactTime,
      setValue: setCompactTime,
      component: (
        <CompactTimePicker
          label="Compact TimePicker"
          value={compactTime}
          onChange={(newValue) => setCompactTime(newValue)}
          fullWidth
          size="medium"
        />
      ),
      pros: ['Very compact', 'Native time input', 'Fast input', 'Mobile-friendly'],
      cons: ['Less visual appeal', 'Limited styling options'],
    },
    {
      name: 'InlineTimePicker',
      description: 'Inline dropdowns for hour/minute/period selection',
      value: inlineTime,
      setValue: setInlineTime,
      component: (
        <InlineTimePicker
          label="Inline TimePicker"
          value={inlineTime}
          onChange={(newValue) => setInlineTime(newValue)}
          size="medium"
        />
      ),
      pros: ['Very compact', 'No popup required', 'Clear visual feedback'],
      cons: ['Takes more horizontal space', 'More clicks required'],
    },
    {
      name: 'DropdownTimePicker',
      description: 'Single dropdown with pre-generated time options',
      value: dropdownTime,
      setValue: setDropdownTime,
      component: (
        <DropdownTimePicker
          label="Dropdown TimePicker"
          value={dropdownTime}
          onChange={(newValue) => setDropdownTime(newValue)}
          fullWidth
          size="medium"
        />
      ),
      pros: ['Single interaction', 'Fast selection', 'Compact'],
      cons: ['String values', 'Fixed intervals only', 'Long dropdown list'],
    },
    {
      name: 'CompactTimeInput',
      description: 'Separate selectors for hour, minute, and AM/PM in a card',
      value: compactInputTime,
      setValue: setCompactInputTime,
      component: (
        <CompactTimeInput
          label="Compact Time Input"
          value={compactInputTime}
          onChange={(newValue) => setCompactInputTime(newValue)}
          fullWidth
          size="medium"
        />
      ),
      pros: ['Visual grouping', 'Clear labels', 'Easy to understand'],
      cons: ['Takes vertical space', 'String values', 'Multiple interactions'],
    },
    {
      name: 'QuickTimeSelector',
      description: 'Quick selection chips with manual input fallback',
      value: quickSelectTime,
      setValue: setQuickSelectTime,
      component: (
        <QuickTimeSelector
          label="Quick Time Selector"
          value={quickSelectTime}
          onChange={(newValue) => setQuickSelectTime(newValue)}
          fullWidth
          size="medium"
        />
      ),
      pros: ['Quick common times', 'Manual input option', 'Visual feedback'],
      cons: ['Takes more space', 'String values', 'Limited presets'],
    },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            color: colors.grey[100],
            mb: 2,
            textAlign: 'center'
          }}
        >
          Time Picker Alternatives Demo
        </Typography>
        
        <Typography
          variant="body1"
          sx={{
            color: colors.grey[300],
            mb: 4,
            textAlign: 'center'
          }}
        >
          Compare different time picker implementations to find the best fit for your use case
        </Typography>

        <Grid container spacing={3}>
          {timePickerData.map((picker, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card
                elevation={3}
                sx={{
                  borderRadius: 3,
                  background: theme.palette.mode === "dark"
                    ? colors.primary[800]
                    : 'white',
                  border: `1px solid ${theme.palette.mode === "dark" ? colors.primary[700] : colors.grey[200]}`,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <CardContent sx={{ p: 3, flexGrow: 1 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: colors.blueAccent[500],
                      mb: 1
                    }}
                  >
                    {picker.name}
                  </Typography>
                  
                  <Typography
                    variant="body2"
                    sx={{
                      color: colors.grey[300],
                      mb: 3
                    }}
                  >
                    {picker.description}
                  </Typography>

                  <Box sx={{ mb: 3 }}>
                    {picker.component}
                  </Box>

                  <Divider sx={{ my: 2, borderColor: colors.grey[600] }} />

                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: colors.greenAccent[500],
                        fontWeight: 600,
                        mb: 1
                      }}
                    >
                      Pros:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {picker.pros.map((pro, i) => (
                        <Chip
                          key={i}
                          label={pro}
                          size="small"
                          sx={{
                            backgroundColor: colors.greenAccent[700],
                            color: 'white',
                            fontSize: '0.7rem',
                          }}
                        />
                      ))}
                    </Box>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: colors.redAccent[500],
                        fontWeight: 600,
                        mb: 1
                      }}
                    >
                      Cons:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {picker.cons.map((con, i) => (
                        <Chip
                          key={i}
                          label={con}
                          size="small"
                          sx={{
                            backgroundColor: colors.redAccent[700],
                            color: 'white',
                            fontSize: '0.7rem',
                          }}
                        />
                      ))}
                    </Box>
                  </Box>

                  {picker.value && (
                    <Box sx={{ mt: 2, p: 1, backgroundColor: colors.primary[700], borderRadius: 1 }}>
                      <Typography
                        variant="caption"
                        sx={{ color: colors.grey[300] }}
                      >
                        Selected Value: {' '}
                        <span style={{ color: colors.blueAccent[400], fontWeight: 500 }}>
                          {dayjs.isDayjs(picker.value) 
                            ? picker.value.format('h:mm A') 
                            : picker.value || 'None'
                          }
                        </span>
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Card
          elevation={3}
          sx={{
            borderRadius: 3,
            background: theme.palette.mode === "dark"
              ? colors.primary[800]
              : 'white',
            border: `1px solid ${theme.palette.mode === "dark" ? colors.primary[700] : colors.grey[200]}`,
            mt: 4,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: colors.blueAccent[500],
                mb: 2
              }}
            >
              Recommendation
            </Typography>
            
            <Typography
              variant="body1"
              sx={{
                color: colors.grey[100],
                mb: 2
              }}
            >
              For the DoctorEdit modal, I recommend the <strong>ModernTimePicker</strong> because:
            </Typography>
            
            <Box sx={{ pl: 2 }}>
              <Typography variant="body2" sx={{ color: colors.grey[300], mb: 1 }}>
                • Drop-in replacement for MUI TimePicker (same API)
              </Typography>
              <Typography variant="body2" sx={{ color: colors.grey[300], mb: 1 }}>
                • Compact popup with quick presets for common times
              </Typography>
              <Typography variant="body2" sx={{ color: colors.grey[300], mb: 1 }}>
                • Professional appearance that matches the design system
              </Typography>
              <Typography variant="body2" sx={{ color: colors.grey[300], mb: 1 }}>
                • Works with existing dayjs values and validation
              </Typography>
              <Typography variant="body2" sx={{ color: colors.grey[300] }}>
                • Reduces clicks for common appointment times
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </LocalizationProvider>
  );
};

export default TimePickerDemo;
