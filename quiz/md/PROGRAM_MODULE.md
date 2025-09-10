# Program Module - Hierarchical Learning Structure

## Overview
The Program module implements a hierarchical learning program structure for the English learning quiz application. It allows for parent-child relationships between programs, where only leaf programs (programs without children) can contain quizzes.

## Architecture

### Entity Structure
```
Program
├── id: Long (Primary Key)
├── name: String (Required, unique per parent level)
├── description: String (Optional)
├── level: Integer (1=Beginner, 2=Intermediate, 3=Advanced)
├── isActive: Boolean (Default: true)
├── displayOrder: Integer (Default: 0)
├── parent: Program (Self-referential, optional)
├── children: List<Program> (One-to-many relationship)
├── quizzes: List<Quiz> (One-to-many, only for leaf programs)
└── BaseEntity fields (createdAt, createdBy, updatedAt, updatedBy)
```

### Validation Rules
1. **Hierarchy Validation**: Prevents circular references in parent-child relationships
2. **Unique Names**: Program names must be unique within the same parent level
3. **Quiz Constraint**: Only leaf programs (without children) can have quizzes
4. **Deletion Rules**: 
   - Cannot delete programs with children
   - Cannot delete programs with associated quizzes
5. **Business Logic**: Programs can be moved in hierarchy if no circular references are created

### Key Features

#### 1. Hierarchical Structure
- **Root Programs**: Top-level programs without parents
- **Child Programs**: Programs with parent references
- **Leaf Programs**: Programs without children (can contain quizzes)
- **Unlimited Depth**: No artificial limit on hierarchy levels

#### 2. Helper Methods
```java
boolean isLeaf()           // Check if program has no children
boolean isRoot()           // Check if program has no parent
boolean canHaveQuizzes()   // Check if program can contain quizzes (must be leaf)
int getDepth()             // Calculate depth from root level
```

#### 3. Advanced Queries
- Recursive hierarchy path calculation
- Circular reference detection
- Tree traversal operations
- Level-based filtering

## API Endpoints

### Basic CRUD Operations
- `POST /api/v1/programs` - Create new program
- `GET /api/v1/programs/{id}` - Get program by ID
- `PUT /api/v1/programs/{id}` - Update program
- `DELETE /api/v1/programs/{id}` - Delete program (leaf only)
- `GET /api/v1/programs` - Get all programs with pagination

### Hierarchy Management
- `GET /api/v1/programs/roots` - Get root programs
- `GET /api/v1/programs/{parentId}/children` - Get child programs
- `PUT /api/v1/programs/{programId}/move` - Move program to new parent
- `GET /api/v1/programs/hierarchy` - Get complete hierarchy tree
- `GET /api/v1/programs/{rootId}/tree` - Get subtree from specific root

### Filtering & Search
- `GET /api/v1/programs/level/{level}` - Get programs by difficulty level
- `GET /api/v1/programs/leaf` - Get only leaf programs
- `GET /api/v1/programs/search?name={query}` - Search by name

### Validation & Statistics
- `GET /api/v1/programs/{id}/statistics` - Get program with statistics
- `GET /api/v1/programs/{id}/can-have-quizzes` - Check quiz eligibility
- `GET /api/v1/programs/{programId}/can-be-parent/{childId}` - Validate hierarchy

### Bulk Operations
- `PUT /api/v1/programs/reorder` - Reorder multiple programs

## Database Schema

### Main Table: `programs`
```sql
CREATE TABLE programs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    level INT NOT NULL CHECK (level BETWEEN 1 AND 3),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT NOT NULL DEFAULT 0,
    parent_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by VARCHAR(255),
    
    FOREIGN KEY (parent_id) REFERENCES programs(id),
    UNIQUE KEY unique_name_per_parent (name, parent_id)
);
```

### View: `program_view`
Enhanced view with calculated fields for efficient querying:
- Hierarchy depth calculation
- Path from root to current program
- Children and quiz counts
- Level name mapping
- Leaf program identification

## Implementation Files

### Core Files
1. **Entity**: `Program.java` - JPA entity with self-referential relationships
2. **Repository**: `ProgramRepository.java` - Custom queries for hierarchy operations
3. **Service**: `ProgramService.java` - Interface defining business operations
4. **Service Impl**: `ProgramServiceImpl.java` - Business logic implementation
5. **Controller**: `ProgramController.java` - REST API endpoints
6. **Mapper**: `ProgramMapper.java` - MapStruct mapping between DTOs and entities

### DTO Classes
1. **Request**: `ProgramRequestDto.java` - Input validation and mapping
2. **Response**: `ProgramResponseDto.java` - Output data structure
3. **View**: `ProgramView.java` - Database view mapping

### Repository Classes
1. **Main**: `ProgramRepository.java` - Entity operations
2. **View**: `ProgramViewRepository.java` - View-based queries

## Usage Examples

### Creating a Hierarchy
```
English Learning Program (Root)
├── Grammar (Level 1)
│   ├── Basic Tenses (Level 1) - Leaf (can have quizzes)
│   └── Advanced Grammar (Level 2) - Leaf (can have quizzes)
├── Vocabulary (Level 1)
│   ├── Common Words (Level 1) - Leaf (can have quizzes)
│   └── Academic Vocabulary (Level 3) - Leaf (can have quizzes)
└── Speaking (Level 2)
    ├── Pronunciation (Level 2) - Leaf (can have quizzes)
    └── Conversation (Level 2) - Leaf (can have quizzes)
```

### Business Rules in Action
1. **Quiz Assignment**: Only leaf programs (Basic Tenses, Advanced Grammar, etc.) can have quizzes
2. **Program Movement**: Grammar can be moved under Speaking, but Speaking cannot be moved under Basic Tenses (circular reference)
3. **Deletion**: Cannot delete Grammar (has children), but can delete Basic Tenses (if no quizzes assigned)

## Security
All endpoints are protected with role-based permissions:
- `PROGRAM.CREATE` - Create new programs
- `PROGRAM.READ` - View programs and hierarchy
- `PROGRAM.UPDATE` - Modify programs and move in hierarchy
- `PROGRAM.DELETE` - Delete leaf programs

## Integration with Quiz System
- Quiz entity has `program_id` foreign key
- Only leaf programs can be assigned to quizzes
- Quiz creation validates program eligibility
- Cascade relationships prevent orphaned data

## Performance Considerations
1. **Indexing**: Foreign key indexes on parent_id and level
2. **View Optimization**: Pre-calculated hierarchy fields in program_view
3. **Caching**: Service-level caching for frequently accessed hierarchy data
4. **Lazy Loading**: JPA lazy loading for children and quizzes collections

This module provides a robust foundation for organizing learning content in a hierarchical structure while maintaining data integrity and providing flexible query capabilities.
