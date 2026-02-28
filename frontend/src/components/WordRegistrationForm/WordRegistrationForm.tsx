import { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { createWord } from '../../services/wordService';
import type { CreateWordRequest } from '../../services/wordService';

export function WordRegistrationForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateWordRequest>();
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string[]>([]);

  const onSubmit = async (data: CreateWordRequest) => {
    // 1. 前回のフィードバックをクリア
    setSuccessMessage('');
    setErrorMessage([]);

    try {
      // 2. API呼び出し
      await createWord(data);
      // 3. 成功時: メッセージ表示してフォームをクリア
      setSuccessMessage('登録しました');
      reset();
    } catch (error) {
      // 4. エラー時: 400レスポンスのメッセージ配列を表示、それ以外は汎用エラーを表示
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        const messages = error.response.data?.message;
        if (Array.isArray(messages)) {
          setErrorMessage(messages);
        } else {
          setErrorMessage(['登録に失敗しました']);
        }
      } else {
        setErrorMessage(['登録に失敗しました']);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="spell">スペル</label>
        <input
          id="spell"
          {...register('spell', {
            required: 'スペルを入力してください',
            maxLength: { value: 200, message: 'スペルは200文字以内で入力してください' },
            validate: (value) => value.trim() !== '' || 'スペルを入力してください',
          })}
        />
        {errors.spell && <p role="alert">{errors.spell.message}</p>}
      </div>
      <div>
        <label htmlFor="meaning">意味</label>
        <input
          id="meaning"
          {...register('meaning', {
            required: '意味を入力してください',
            maxLength: { value: 500, message: '意味は500文字以内で入力してください' },
            validate: (value) => value.trim() !== '' || '意味を入力してください',
          })}
        />
        {errors.meaning && <p role="alert">{errors.meaning.message}</p>}
      </div>
      <button type="submit">登録</button>
      {successMessage && <p>{successMessage}</p>}
      {errorMessage.length > 0 && (
        <div>
          {errorMessage.map((msg, i) => (
            <p key={i}>{msg}</p>
          ))}
        </div>
      )}
    </form>
  );
}
