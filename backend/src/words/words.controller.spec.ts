import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { WordsController } from './words.controller';
import { WordsService } from './words.service';
import { Word } from './word.entity';
import { CreateWordDto } from './dto/create-word.dto';

describe('WordsController', () => {
  let controller: WordsController;
  let service: WordsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WordsController],
      providers: [
        {
          provide: WordsService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<WordsController>(WordsController);
    service = module.get<WordsService>(WordsService);
  });

  describe('create', () => {
    it('should return the created word with 201 status', async () => {
      const createWordDto: CreateWordDto = {
        spell: 'abundant',
        meaning: '豊富な',
      };
      const createdWord: Word = {
        id: 1,
        spell: 'abundant',
        meaning: '豊富な',
        createdAt: new Date('2026-02-27T00:00:00.000Z'),
      };

      jest.spyOn(service, 'create').mockResolvedValue(createdWord);

      const result = await controller.create(createWordDto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.create).toHaveBeenCalledWith(createWordDto);
      expect(result).toEqual(createdWord);
    });
  });

  describe('validation', () => {
    let app: INestApplication;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [WordsController],
        providers: [
          {
            provide: WordsService,
            useValue: {
              create: jest.fn(),
            },
          },
        ],
      }).compile();

      app = module.createNestApplication();
      app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          transform: true,
          forbidNonWhitelisted: true,
        }),
      );
      await app.init();
    });

    afterEach(async () => {
      await app.close();
    });

    it('should return 400 when body is empty', () => {
      return request(app.getHttpServer())
        .post('/api/words')
        .send({})
        .expect(400)
        .expect((res) => {
          const body = res.body as { message: string[] };
          expect(body.message).toContain('スペルを入力してください');
          expect(body.message).toContain('意味を入力してください');
        });
    });

    it('should return 400 when spell is whitespace only', () => {
      return request(app.getHttpServer())
        .post('/api/words')
        .send({ spell: '   ', meaning: '豊富な' })
        .expect(400)
        .expect((res) => {
          const body = res.body as { message: string[] };
          expect(body.message).toContain('スペルを入力してください');
        });
    });

    it('should return 400 when spell exceeds 200 characters', () => {
      return request(app.getHttpServer())
        .post('/api/words')
        .send({ spell: 'a'.repeat(201), meaning: '豊富な' })
        .expect(400)
        .expect((res) => {
          const body = res.body as { message: string[] };
          expect(body.message).toContain(
            'スペルは200文字以内で入力してください',
          );
        });
    });

    it('should return 400 when meaning exceeds 500 characters', () => {
      return request(app.getHttpServer())
        .post('/api/words')
        .send({ spell: 'abundant', meaning: 'あ'.repeat(501) })
        .expect(400)
        .expect((res) => {
          const body = res.body as { message: string[] };
          expect(body.message).toContain('意味は500文字以内で入力してください');
        });
    });
  });
});
