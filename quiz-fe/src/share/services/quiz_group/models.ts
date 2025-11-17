import { BaseEntity } from "../BaseService";

export enum GroupType {
  FORMAT = "FORMAT", TOPIC = "TOPIC", MOCK_TEST = "MOCK_TEST", OTHER = "OTHER"
}

export interface QuizGroup extends BaseEntity {
  name: string;
  description?: string;
  isDeleted: boolean;
  groupType: GroupType;
}

export interface QuizGroupRequest {
  name: string;
  description?: string;
}

export interface QuizGroupResponse extends QuizGroup {}

export interface QuizGroupView extends QuizGroup {
  totalMockTest?: number;
  totalFormat?: number;
  totalTopic?: number;
  programName?: string;
  programId?: number;
}