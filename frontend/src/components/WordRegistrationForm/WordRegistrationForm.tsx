import { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
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
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <TextField
        id="spell"
        label="スペル"
        fullWidth
        margin="normal"
        error={!!errors.spell}
        helperText={errors.spell?.message}
        slotProps={{
          inputLabel: { shrink: true },
          formHelperText: errors.spell ? { role: 'alert' } : {},
        }}
        {...register('spell', {
          required: 'スペルを入力してください',
          maxLength: { value: 200, message: 'スペルは200文字以内で入力してください' },
          validate: (value) => value.trim() !== '' || 'スペルを入力してください',
        })}
      />
      <TextField
        id="meaning"
        label="意味"
        fullWidth
        margin="normal"
        error={!!errors.meaning}
        helperText={errors.meaning?.message}
        slotProps={{
          inputLabel: { shrink: true },
          formHelperText: errors.meaning ? { role: 'alert' } : {},
        }}
        {...register('meaning', {
          required: '意味を入力してください',
          maxLength: { value: 500, message: '意味は500文字以内で入力してください' },
          validate: (value) => value.trim() !== '' || '意味を入力してください',
        })}
      />
      <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
        登録
      </Button>
      {successMessage && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {successMessage}
        </Alert>
      )}
      {errorMessage.length > 0 && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {errorMessage.map((msg, i) => (
            <div key={i}>{msg}</div>
          ))}
        </Alert>
      )}
    </Box>
  );
}
