import React, { useState } from 'react';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';

const FormComponent = ({ formData, setFormData }) => {
  const [selectedDate, setSelectedDate] = useState(null);

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    const date = dayjs(newDate.$d);
    // const formattedDate = date.format('YYYY-MM-DD'); // Format date as needed (e.g., YYYY-MM-DD)
    const formattedDate = date.format('DD-MM-YYYY');
    setFormData({ ...formData, AppointmentDate: formattedDate }); // Update AppointmentDate in formData
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DemoContainer components={['DatePicker']}>
        <DatePicker
          label="Appointment Date"
          value={selectedDate}
          onChange={handleDateChange}
        />
      </DemoContainer>
    </LocalizationProvider>
  );
};

export default FormComponent;
