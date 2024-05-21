import React from 'react';
import dayjs from 'dayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { PaymentChannelDataSchema } from '../schema/PaymentChannelDataSchema';

dayjs.extend(utc);
dayjs.extend(timezone);

export default function TimezoneLabelDateTimePicker ({ 
    onChange 
}: {
    onChange: (data: Partial<PaymentChannelDataSchema>) => void
}) {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const formattedLabel = `Expiration (${timezone})`;

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
                label={formattedLabel}
                defaultValue={dayjs()}
                disablePast
                onChange={(e) => {
                    console.log(e?.toString());
                    if (e instanceof Date) {
                        onChange({ expirationDate: e });
                    } else if (dayjs.isDayjs(e)) {
                        onChange({ expirationDate: e.toDate() });
                    }
                }}
            />
        </LocalizationProvider>
    );
};
