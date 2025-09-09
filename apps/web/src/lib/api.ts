import axios from 'axios';
import { StudentData, GroupCreationResponse, GroupStatus } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 30000,
});

export const apiClient = {
  // Инициация создания группы
  async initGroupCreation(studentData: StudentData): Promise<GroupCreationResponse> {
    const response = await api.post('/oauth/init', studentData);
    return response.data;
  },

  // Получение статуса создания группы
  async getGroupStatus(jobId: string): Promise<GroupStatus> {
    const response = await api.get(`/groups/${jobId}/status`);
    return response.data;
  },

  // Получение всех групп ученика
  async getStudentGroups(studentId: string) {
    const response = await api.get(`/groups/student/${studentId}`);
    return response.data;
  },

  // Отзыв доступа к группе
  async revokeGroupAccess(groupId: string) {
    const response = await api.delete(`/groups/${groupId}/revoke`);
    return response.data;
  },

  // Health check
  async healthCheck() {
    const response = await api.get('/health');
    return response.data;
  },
};

export default apiClient;
