vi.mock('../../services/wordService', () => ({
  createWord: vi.fn(),
}));

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WordRegistrationForm } from './WordRegistrationForm';
import { createWord } from '../../services/wordService';

const mockCreateWord = vi.mocked(createWord);

describe('WordRegistrationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('フォームにスペル入力・意味入力・登録ボタンが表示される', () => {
    render(<WordRegistrationForm />);

    expect(screen.getByLabelText(/スペル/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/意味/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /登録/i })).toBeInTheDocument();
  });

  it('登録成功時にAPIを呼び出して成功フィードバックを表示する', async () => {
    mockCreateWord.mockResolvedValueOnce({
      id: 1,
      spell: 'abundant',
      meaning: '豊富な',
      createdAt: '2026-02-27T00:00:00.000Z',
    });

    render(<WordRegistrationForm />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/スペル/i), 'abundant');
    await user.type(screen.getByLabelText(/意味/i), '豊富な');
    await user.click(screen.getByRole('button', { name: /登録/i }));

    expect(mockCreateWord).toHaveBeenCalledWith({
      spell: 'abundant',
      meaning: '豊富な',
    });

    await waitFor(() => {
      expect(screen.getByText(/登録しました/i)).toBeInTheDocument();
    });
  });

  it('登録成功後にフォームをクリアする', async () => {
    mockCreateWord.mockResolvedValueOnce({
      id: 1,
      spell: 'abundant',
      meaning: '豊富な',
      createdAt: '2026-02-27T00:00:00.000Z',
    });

    render(<WordRegistrationForm />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/スペル/i), 'abundant');
    await user.type(screen.getByLabelText(/意味/i), '豊富な');
    await user.click(screen.getByRole('button', { name: /登録/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/スペル/i)).toHaveValue('');
      expect(screen.getByLabelText(/意味/i)).toHaveValue('');
    });
  });

  it('APIエラー時（400）にバックエンドのエラーメッセージを表示して入力値を保持する', async () => {
    mockCreateWord.mockRejectedValueOnce({
      response: {
        status: 400,
        data: {
          statusCode: 400,
          message: ['スペルを入力してください'],
          error: 'Bad Request',
        },
      },
      isAxiosError: true,
    });

    render(<WordRegistrationForm />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/スペル/i), 'test');
    await user.type(screen.getByLabelText(/意味/i), 'テスト');
    await user.click(screen.getByRole('button', { name: /登録/i }));

    await waitFor(() => {
      expect(screen.getByText('スペルを入力してください')).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/スペル/i)).toHaveValue('test');
    expect(screen.getByLabelText(/意味/i)).toHaveValue('テスト');
  });

  it('APIエラー時（500）に汎用エラーメッセージを表示する', async () => {
    mockCreateWord.mockRejectedValueOnce({
      response: {
        status: 500,
        data: {
          statusCode: 500,
          message: 'Internal server error',
          error: 'Internal Server Error',
        },
      },
      isAxiosError: true,
    });

    render(<WordRegistrationForm />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/スペル/i), 'test');
    await user.type(screen.getByLabelText(/意味/i), 'テスト');
    await user.click(screen.getByRole('button', { name: /登録/i }));

    await waitFor(() => {
      expect(screen.getByText('登録に失敗しました')).toBeInTheDocument();
    });
  });

  describe('バリデーション', () => {
    it('スペルが空の場合エラーが表示される', async () => {
      render(<WordRegistrationForm />);
      const user = userEvent.setup();

      await user.type(screen.getByLabelText(/意味/i), '豊富な');
      await user.click(screen.getByRole('button', { name: /登録/i }));

      await waitFor(() => {
        expect(screen.getByText('スペルを入力してください')).toBeInTheDocument();
      });
    });

    it('意味が空の場合エラーが表示される', async () => {
      render(<WordRegistrationForm />);
      const user = userEvent.setup();

      await user.type(screen.getByLabelText(/スペル/i), 'abundant');
      await user.click(screen.getByRole('button', { name: /登録/i }));

      await waitFor(() => {
        expect(screen.getByText('意味を入力してください')).toBeInTheDocument();
      });
    });

    it('スペルが空白のみの場合エラーが表示される', async () => {
      render(<WordRegistrationForm />);
      const user = userEvent.setup();

      await user.type(screen.getByLabelText(/スペル/i), '   ');
      await user.type(screen.getByLabelText(/意味/i), '豊富な');
      await user.click(screen.getByRole('button', { name: /登録/i }));

      await waitFor(() => {
        expect(screen.getByText('スペルを入力してください')).toBeInTheDocument();
      });
    });

    it('スペルが200文字を超える場合エラーが表示される', async () => {
      render(<WordRegistrationForm />);

      fireEvent.change(screen.getByLabelText(/スペル/i), { target: { value: 'a'.repeat(201) } });
      fireEvent.change(screen.getByLabelText(/意味/i), { target: { value: '豊富な' } });
      await userEvent.click(screen.getByRole('button', { name: /登録/i }));

      await waitFor(() => {
        expect(screen.getByText('スペルは200文字以内で入力してください')).toBeInTheDocument();
      });
    });

    it('意味が500文字を超える場合エラーが表示される', async () => {
      render(<WordRegistrationForm />);

      fireEvent.change(screen.getByLabelText(/スペル/i), { target: { value: 'abundant' } });
      fireEvent.change(screen.getByLabelText(/意味/i), { target: { value: 'a'.repeat(501) } });
      await userEvent.click(screen.getByRole('button', { name: /登録/i }));

      await waitFor(() => {
        expect(screen.getByText('意味は500文字以内で入力してください')).toBeInTheDocument();
      });
    });

    it('バリデーションエラーがある場合APIが呼び出されない', async () => {
      render(<WordRegistrationForm />);
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: /登録/i }));

      await waitFor(() => {
        expect(screen.getByText('スペルを入力してください')).toBeInTheDocument();
      });

      expect(mockCreateWord).not.toHaveBeenCalled();
    });
  });
});
