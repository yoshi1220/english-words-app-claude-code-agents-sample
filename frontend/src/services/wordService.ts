import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

export interface CreateWordRequest {
  spell: string;
  meaning: string;
}

export interface WordResponse {
  id: number;
  spell: string;
  meaning: string;
  createdAt: string;
}

export async function createWord(data: CreateWordRequest): Promise<WordResponse> {
  const response = await axios.post<WordResponse>(`${BASE_URL}/api/words`, data);
  return response.data;
}
