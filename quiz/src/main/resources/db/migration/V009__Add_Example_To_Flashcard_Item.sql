-- V009: Add example column to flashcard_item table

ALTER TABLE flashcard_item ADD COLUMN example TEXT AFTER back_content;

-- Update view to include example column
CREATE OR REPLACE VIEW flashcard_item_view AS
SELECT 
    fi.id,
    fi.category_id,
    fi.user_id,
    fi.front_content,
    fi.back_content,
    fi.example,
    fi.front_image,
    fi.back_image,
    fi.audio_url,
    fi.tags,
    fi.difficulty,
    fi.review_count,
    fi.correct_count,
    fi.last_reviewed_at,
    fi.next_review_at,
    fi.sort_order,
    fi.created_at,
    fi.created_by,
    fi.updated_at,
    fi.updated_by,
    fc.name as category_name
FROM flashcard_item fi
LEFT JOIN flashcard_category fc ON fi.category_id = fc.id;
