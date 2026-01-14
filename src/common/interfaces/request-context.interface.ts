import { User } from '../../users/user.entity';
import { Project } from '../../projects/project.entity';

export interface RequestContext {
  user?: User;
  project?: Project;
  apiKey?: string;
}

