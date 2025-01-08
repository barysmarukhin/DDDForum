import { PrismaClient } from '@prisma/client';
import StudentsController from './controllers/students';
import StudentsService from './services/students';
import Server from './server';
import Database from './database';
import { errorHandler } from './shared/errors';


const prisma = new PrismaClient();
const database = new Database(prisma);

const studentsService = new StudentsService(database);
const studentsController = new StudentsController(studentsService, errorHandler);

const server = new Server(studentsController);

export default server;
