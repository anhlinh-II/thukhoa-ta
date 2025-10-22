import { BaseEntity } from "../BaseService";

export interface QuestionGroup extends BaseEntity {
     id: number;
     title: string;
     contentHtml: string;
     mediaUrl: string;
     metadata: string;
}

export interface QuestionGroupRequest extends QuestionGroup {}

export interface QuestionGroupView extends QuestionGroup {}

export interface QuestionGroupResponse extends QuestionGroupView {}