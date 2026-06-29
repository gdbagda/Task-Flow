import { useCallback, useState } from 'react';
import axiosInstance from '../api/axios';
import type { Board, BoardFormData } from '../types';
import { extractErrorMessage } from '../utils/helpers';

export const useBoards = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBoards = useCallback(async (archived = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await axiosInstance.get('/boards', {
        params: { archived },
      });
      setBoards(data.boards);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createBoard = useCallback(async (formData: BoardFormData): Promise<Board> => {
    const { data } = await axiosInstance.post('/boards', formData);
    setBoards((prev) => [data.board, ...prev]);
    return data.board;
  }, []);

  const updateBoard = useCallback(
    async (id: string, formData: Partial<BoardFormData>): Promise<Board> => {
      const { data } = await axiosInstance.put(`/boards/${id}`, formData);
      setBoards((prev) =>
        prev.map((b) => (b._id === id ? data.board : b))
      );
      return data.board;
    },
    []
  );

  const deleteBoard = useCallback(async (id: string): Promise<void> => {
    await axiosInstance.delete(`/boards/${id}`);
    setBoards((prev) => prev.filter((b) => b._id !== id));
  }, []);

  const archiveBoard = useCallback(async (id: string): Promise<Board> => {
    const { data } = await axiosInstance.patch(`/boards/${id}/archive`);
    setBoards((prev) => prev.filter((b) => b._id !== id));
    return data.board;
  }, []);

  return {
    boards,
    isLoading,
    error,
    fetchBoards,
    createBoard,
    updateBoard,
    deleteBoard,
    archiveBoard,
  };
};