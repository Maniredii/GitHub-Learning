const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface GitExecuteResponse {
  output: string;
  newState: any;
  error?: string;
}

export interface RepositoryState {
  id: string;
  workingDirectory: Record<string, { content: string; modified: boolean }>;
  stagingArea: Record<string, { content: string; modified: boolean }>;
  commits: any[];
  branches: any[];
  head: string;
  remotes: any[];
}

export const gitApi = {
  async executeCommand(
    repositoryId: string,
    command: string
  ): Promise<GitExecuteResponse> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/git/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ repositoryId, command }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to execute command');
    }

    return response.json();
  },

  async getRepository(repositoryId: string): Promise<{ state: RepositoryState }> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/git/repository/${repositoryId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get repository');
    }

    return response.json();
  },

  async createRepository(initialFiles?: any): Promise<{ repositoryId: string; state: RepositoryState }> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/git/repository/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ initialFiles }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to create repository');
    }

    return response.json();
  },

  async getFileContent(
    repositoryId: string,
    filePath: string
  ): Promise<{ content: string; modified: boolean }> {
    const repository = await this.getRepository(repositoryId);
    const file = repository.state.workingDirectory[filePath];
    
    if (!file) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    return file;
  },

  async updateFileContent(
    repositoryId: string,
    filePath: string,
    content: string
  ): Promise<{ state: RepositoryState }> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/git/repository/${repositoryId}/file`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ filePath, content }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to update file');
    }

    return response.json();
  },
};
