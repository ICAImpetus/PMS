import * as React from 'react';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs, { Dayjs } from 'dayjs';


export default function BasicTimePicker({ formData, setFormData }) {
    const [selectedTime, setSelectedTime] = React.useState(null);
    const handleTimeChange = (newTime) => {
        const time = dayjs(newTime.$d); 
        const formattedTime = time.format('HH:mm');
        setSelectedTime(newTime);
        setFormData({ ...formData, AppointmentTime: formattedTime }); // Update AppointmentDate in formData
    };
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={['TimePicker']}>
                <TimePicker
                    label="Basic time picker"
                    value={selectedTime}
                    onChange={handleTimeChange}
                />
            </DemoContainer>
        </LocalizationProvider>
    );
}
