export class CreateTaskDto {
  title: string;
  description?: string;
  listId: string;
  order: number;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string;
  assignees?: string[];
}
