import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as pactum from 'pactum';
import { DatabaseService } from '../src/database/database.service';
import { Authdto } from '../src/auth/dto';
describe('App e2e', () => {
  let app: INestApplication;
  let database: DatabaseService;

  beforeAll(async () => {
    // creating a testig module and importing whatever module we need.
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen('3333');

    database = app.get(DatabaseService);
    await database.cleanDB();
    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(() => {
    app.close();
  });

  // Authentication testig
  describe('Auth Test', () => {
    const dto: Authdto = {
      email: 'mohsen@yahoo.com',
      password: 'mohsen',
    };
    describe('signup', () => {
      it('should sign in', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201)
          .inspect(); // if you wanna see what is inside the request object - fun
      });
    });

    describe('signin', () => {
      it('it should sign in', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(201);
      });
      it('should throw an error', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ password: dto.password })
          .expectStatus(400);
      });
    });
  });
});
