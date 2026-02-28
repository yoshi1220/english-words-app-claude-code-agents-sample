import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

const trimString = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class CreateWordDto {
  @Transform(trimString)
  @IsNotEmpty({ message: 'スペルを入力してください' })
  @IsString()
  @MaxLength(200, { message: 'スペルは200文字以内で入力してください' })
  spell: string;

  @Transform(trimString)
  @IsNotEmpty({ message: '意味を入力してください' })
  @IsString()
  @MaxLength(500, { message: '意味は500文字以内で入力してください' })
  meaning: string;
}
