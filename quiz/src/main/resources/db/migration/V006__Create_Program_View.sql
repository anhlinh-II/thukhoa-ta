-- Create program_view database view
-- This view provides hierarchical information about programs including statistics

CREATE OR REPLACE VIEW program_view AS
SELECT 
    p.id,
    p.name,
    p.description,
    p.level,
    CASE 
        WHEN p.level = 1 THEN 'Beginner'
        WHEN p.level = 2 THEN 'Intermediate' 
        WHEN p.level = 3 THEN 'Advanced'
        ELSE 'Unknown'
    END as level_name,
    p.is_active,
    p.display_order,
    p.parent_id,
    parent.name as parent_name,
    p.depth,
    p.path,
    -- Count direct children
    (SELECT COUNT(*) 
     FROM program child 
     WHERE child.parent_id = p.id AND child.is_active = true) as children_count,
    -- Count quizzes directly assigned to this program
    (SELECT COUNT(*) 
     FROM quiz q 
     WHERE q.program_id = p.id AND q.is_active = true) as quiz_count,
    -- Check if this is a leaf node (no children)
    CASE 
        WHEN (SELECT COUNT(*) FROM program child WHERE child.parent_id = p.id AND child.is_active = true) = 0 
        THEN true 
        ELSE false 
    END as is_leaf,
    p.created_at,
    p.created_by,
    p.updated_at,
    p.updated_by
FROM 
    program p
    LEFT JOIN program parent ON p.parent_id = parent.id
WHERE 
    p.is_active = true
ORDER BY 
    p.path, p.display_order;
