import apiClient from './api';

export async function getReviewQuestion(userId: number, optionsCount = 4) {
  const resp = await apiClient.post('/user-vocabulary/review/question', { userId, optionsCount });
  console.log('getReviewQuestion response', resp);
  return resp.data;
}

export default { getReviewQuestion };
