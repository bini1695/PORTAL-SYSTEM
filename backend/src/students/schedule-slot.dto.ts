import { IsEnum, Matches } from 'class-validator';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const;

export class ScheduleSlotDto {
  @IsEnum(DAYS)
  day!: (typeof DAYS)[number];

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'start must be HH:mm (00:00–23:59)',
  })
  start!: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'end must be HH:mm (00:00–23:59)',
  })
  end!: string;
}