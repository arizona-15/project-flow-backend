import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';

export class UpdateTaskDto extends PartialType(
  OmitType(CreateTaskDto, ['priority', 'dueDate'] as const),
) {
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string | null;
  assignees?: string[];
}
