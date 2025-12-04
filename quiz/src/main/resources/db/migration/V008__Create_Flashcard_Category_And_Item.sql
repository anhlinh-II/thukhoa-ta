-- V008: Create Flashcard Category and Item tables for user-created flashcards

-- Flashcard Category table
CREATE TABLE flashcard_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(50) DEFAULT '#3b82f6',
    icon VARCHAR(50) DEFAULT 'folder',
    card_count INT DEFAULT 0,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by VARCHAR(255),
    INDEX idx_flashcard_category_user_id (user_id),
    INDEX idx_flashcard_category_name (name)
);

-- Flashcard Item table
CREATE TABLE flashcard_item (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    front_content TEXT NOT NULL,
    back_content TEXT NOT NULL,
    front_image VARCHAR(500),
    back_image VARCHAR(500),
    audio_url VARCHAR(500),
    tags VARCHAR(500),
    difficulty INT DEFAULT 0,
    review_count INT DEFAULT 0,
    correct_count INT DEFAULT 0,
    last_reviewed_at TIMESTAMP NULL,
    next_review_at TIMESTAMP NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by VARCHAR(255),
    FOREIGN KEY (category_id) REFERENCES flashcard_category(id) ON DELETE CASCADE,
    INDEX idx_flashcard_item_category_id (category_id),
    INDEX idx_flashcard_item_user_id (user_id),
    INDEX idx_flashcard_item_next_review (next_review_at)
);

-- Create view for flashcard_category
CREATE OR REPLACE VIEW flashcard_category_view AS
SELECT 
    fc.id,
    fc.user_id,
    fc.name,
    fc.description,
    fc.color,
    fc.icon,
    fc.card_count,
    fc.is_public,
    fc.created_at,
    fc.created_by,
    fc.updated_at,
    fc.updated_by
FROM flashcard_category fc;

-- Create view for flashcard_item
CREATE OR REPLACE VIEW flashcard_item_view AS
SELECT 
    fi.id,
    fi.category_id,
    fi.user_id,
    fi.front_content,
    fi.back_content,
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
