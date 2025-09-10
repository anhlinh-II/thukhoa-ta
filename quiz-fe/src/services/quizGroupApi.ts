const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

export interface QuizGroup {
  id: number;
  programId: number;
  name: string;
  description: string;
  slug: string;
  groupType: string;
  displayOrder: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  createdBy: string | null;
  updatedAt: string;
  updatedBy: string | null;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

class QuizGroupApi {
  private baseUrl = `${API_BASE_URL}/quiz-groups`;

  async getAll(): Promise<QuizGroup[]> {
    const response = await fetch(`${this.baseUrl}/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<QuizGroup[]> = await response.json();
    return data.result;
  }

  async getAllPaged(page: number = 0, size: number = 10): Promise<PageResponse<QuizGroup>> {
    const response = await fetch(`${this.baseUrl}/paged?page=${page}&size=${size}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<PageResponse<QuizGroup>> = await response.json();
    return data.result;
  }

  async getById(id: number): Promise<QuizGroup> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<QuizGroup> = await response.json();
    return data.result;
  }

  async getByProgramId(programId: number): Promise<QuizGroup[]> {
    const response = await fetch(`${this.baseUrl}/program/${programId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<QuizGroup[]> = await response.json();
    return data.result;
  }

  async getBySlug(slug: string): Promise<QuizGroup> {
    const response = await fetch(`${this.baseUrl}/slug/${slug}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<QuizGroup> = await response.json();
    return data.result;
  }

  async create(data: Partial<QuizGroup>): Promise<QuizGroup> {
    const response = await fetch(`${this.baseUrl}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<QuizGroup> = await response.json();
    return result.result;
  }

  async update(id: number, data: Partial<QuizGroup>): Promise<QuizGroup> {
    const response = await fetch(`${this.baseUrl}/edit/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<QuizGroup> = await response.json();
    return result.result;
  }

  async softDelete(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/soft-delete/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  async checkSlugExists(slug: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/slug-exists/${slug}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<boolean> = await response.json();
    return data.result;
  }
}

// Export singleton instance
export const quizGroupApi = new QuizGroupApi();