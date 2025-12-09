-- Add quiz_group_count to programs_view
-- This allows filtering programs that don't have any quiz groups

CREATE OR REPLACE VIEW programs_view AS
SELECT 
    p.id,
    p.name,
    p.description,
    p.slug,
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
    p.image_url,
    (SELECT COUNT(*) 
     FROM programs child 
     WHERE child.parent_id = p.id AND child.is_deleted = false) as children_count,
    (SELECT COUNT(*) 
     FROM quiz_group qg 
     WHERE qg.program_id = p.id AND qg.is_deleted = false) as quiz_group_count,
    CASE 
        WHEN (SELECT COUNT(*) FROM programs child WHERE child.parent_id = p.id AND child.is_deleted = false) = 0 
        THEN true 
        ELSE false 
    END as is_leaf,
    p.created_at,
    p.created_by,
    p.updated_at,
    p.updated_by
FROM 
    programs p
    LEFT JOIN programs parent ON p.parent_id = parent.id
WHERE 
    p.is_deleted = false
ORDER BY 
    p.path, p.display_order;
