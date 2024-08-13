import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Global() // makes it possible for the entire app to use the database
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
