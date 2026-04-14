import { BaseEntity } from "../BaseService";

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
     childrenCount?: number;
     quizGroupCount?: number;
     isLeaf?: boolean;
     depth?: number;
     path?: string;
}