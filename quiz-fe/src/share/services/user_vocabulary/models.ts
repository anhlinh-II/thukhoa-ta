import { BaseEntity, BaseResponse, BaseView } from "../BaseService";

export interface UserVocabulary extends BaseEntity {

}
export interface UserVocabularyRequest {

}


export interface UserVocabularyView extends BaseView {

}

export interface UserVocabularyResponse extends BaseResponse, UserVocabularyView {

}