import {
  IsIn,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';

const GRADES = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'] as const;

export class SubmitGradeDto {
  @IsUUID()
  enrollmentId!: string;

  @IsIn(GRADES as unknown as string[])
  @IsString()
  @Matches(/^[A-F][+-]?$/, { message: 'Invalid grade' })
  grade!: string;
}