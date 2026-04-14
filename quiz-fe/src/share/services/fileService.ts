import apiClient from './api';

export const fileService = {
  // upload returns the path string
  upload: async (file: File, storageType: string, folder?: string, filename?: string) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('storageType', storageType);
    if (folder) fd.append('folder', folder);
    if (filename) fd.append('filename', filename);

    const response = await apiClient.post('/files/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  delete: async (path: string) => {
    const response = await apiClient.delete('/files', { params: { path } });
    return response.data;
  },

  // returns blob for download
  download: async (path: string) => {
    const response = await apiClient.get('/files/download', { params: { path }, responseType: 'blob' });
    return response.data;
  }
};

export default fileService;
