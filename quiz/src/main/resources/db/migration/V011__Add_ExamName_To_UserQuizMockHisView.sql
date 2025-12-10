-- Add exam_name to user_quiz_mock_his_view by joining with quiz_mock_test table
DROP VIEW IF EXISTS user_quiz_mock_his_view;

CREATE VIEW user_quiz_mock_his_view AS
SELECT 
    h.id,
    h.user_id,
    h.quiz_mock_test_id,
    h.score,
    h.total_questions,
    h.correct_count,
    h.created_at,
    h.time_spent,
    h.quiz_type,
    qmt.exam_name
FROM user_quiz_mock_his h
LEFT JOIN quiz_mock_test qmt ON h.quiz_mock_test_id = qmt.id;
