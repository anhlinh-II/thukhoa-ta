import { BaseEntity, BaseService } from './BaseService';

export interface Program extends BaseEntity {
     name: string;
     description?: string | null;
     slug?: string | null;
     level: number;
     isActive?: boolean;
     displayOrder?: number;
     parentId?: number | null;
     parent?: Partial<Program> | null;
}

export interface ProgramRequest {
     name: string;
     description?: string | null;
     slug?: string | null;
     level: number;
     isActive?: boolean;
     displayOrder?: number;
     parentId?: number | null;
}

export interface ProgramResponse extends Program { }

export interface ProgramView extends Program {

}

export class ProgramService extends BaseService<
     Program,
     ProgramRequest,
     ProgramResponse,
     ProgramView
> {
     constructor() {
          super('http://localhost:8080/api/v1', 'programs');
     }

}

export const programService = new ProgramService();
