// import { BaseHooks } from './BaseHooks';
// import { 
//   QuizGroup, 
//   QuizGroupRequest, 
//   QuizGroupResponse, 
//   QuizGroupView, 
//   quizGroupService 
// } from '../services/quiz_group/quiz-group.service';

// // Quiz Group Hooks
// export class QuizGroupHooks extends BaseHooks<
//   QuizGroup,
//   QuizGroupRequest,
//   QuizGroupResponse,
//   QuizGroupView
// > {
//   constructor() {
//     super(quizGroupService, {
//       queryKeyPrefix: 'quiz-groups-base',
//       resourceName: 'Quiz Group',
//       enabledByDefault: true,
//     });
//   }

//   // Custom hooks specific to QuizGroup
//   useFindActiveGroups() {
//     return this.useFindAll(); // You can override this to call findActiveGroups()
//   }

//   useToggleStatus() {
//     return this.useUpdate(); // You can customize this for toggle status
//   }
// }

// // Create singleton instance
// export const useQuizGroupBaseHooks = () => new QuizGroupHooks();
