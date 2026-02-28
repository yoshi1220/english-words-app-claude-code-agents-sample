import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WordsService } from './words.service';
import { Word } from './word.entity';

describe('WordsService', () => {
  let service: WordsService;
  let repository: Repository<Word>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WordsService,
        {
          provide: getRepositoryToken(Word),
          useValue: {
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WordsService>(WordsService);
    repository = module.get<Repository<Word>>(getRepositoryToken(Word));
  });

  describe('create', () => {
    it('should save and return the word entity', async () => {
      const createWordDto = { spell: 'abundant', meaning: '豊富な' };
      const savedWord = {
        id: 1,
        spell: 'abundant',
        meaning: '豊富な',
        createdAt: new Date('2026-02-27T00:00:00.000Z'),
      };

      jest.spyOn(repository, 'save').mockResolvedValue(savedWord as Word);

      const result = await service.create(createWordDto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.save).toHaveBeenCalledWith(createWordDto);
      expect(result).toEqual(savedWord);
    });

    it('should create separate records for the same spell with different meanings', async () => {
      const dto1 = { spell: 'run', meaning: '走る' };
      const dto2 = { spell: 'run', meaning: '経営する' };
      const saved1 = { id: 1, ...dto1, createdAt: new Date() } as Word;
      const saved2 = { id: 2, ...dto2, createdAt: new Date() } as Word;

      jest
        .spyOn(repository, 'save')
        .mockResolvedValueOnce(saved1)
        .mockResolvedValueOnce(saved2);

      await service.create(dto1);
      await service.create(dto2);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.save).toHaveBeenCalledTimes(2);
    });

    it('should throw an exception when the database operation fails', async () => {
      jest.spyOn(repository, 'save').mockRejectedValue(new Error('DB error'));

      await expect(
        service.create({ spell: 'test', meaning: 'テスト' }),
      ).rejects.toThrow('DB error');
    });
  });
});
