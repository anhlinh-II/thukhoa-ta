import { ENV } from '../../config/env';
import { BaseEntity, BaseService } from '../BaseService';
import { Program, ProgramRequest, ProgramResponse, ProgramView } from './models';



export class ProgramService extends BaseService<
     Program,
     ProgramRequest,
     ProgramResponse,
     ProgramView
> {
     constructor() {
          super(ENV.API_URL, 'programs');
     }

}

export const programService = new ProgramService();
