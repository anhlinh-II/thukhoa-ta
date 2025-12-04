-- Add quiz_name column to quiz_battles table
ALTER TABLE quiz_battles
ADD COLUMN quiz_name VARCHAR(500);

-- Update existing battles with quiz names from quiz_mock_test
UPDATE quiz_battles qb
SET quiz_name = (
    SELECT exam_name 
    FROM quiz_mock_test qmt 
    WHERE qmt.id = qb.quiz_id
)
WHERE qb.quiz_name IS NULL;

-- Set default name for any battles that still don't have a name
UPDATE quiz_battles
SET quiz_name = CONCAT('Quiz #', quiz_id)
WHERE quiz_name IS NULL;
