import express from 'express';
import { CreateStudentDTO, StudentID } from '../dtos/students';
import { parseForResponse } from '../shared/utils';
import { ErrorHandler } from '../shared/errors';

import { StudentsService } from '../services';

class StudentsController {
	private router: express.Router;

	constructor(
		private studentsService: StudentsService,
		private errorHandler: ErrorHandler
	) {
		this.router = express.Router();
		this.setupRouter();
		this.setupErrorHandler();
	}

	private setupRouter() {
		this.router.post("/", this.createStudent);
		this.router.get('/', this.getAllStudents);
	}

	private setupErrorHandler() {
		this.router.use(this.errorHandler);
	}

	getRouter() {
		return this.router;
	}

	private createStudent = async (
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			const dto = CreateStudentDTO.fromRequest(req.body);
			const data = await this.studentsService.createStudent(dto);
			res.status(201).json({
				error: undefined,
				data: parseForResponse(data),
				success: true,
			});
		} catch (error) {
			next(error);
		}
	}

	private getAllStudents = async (
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			const data = await this.studentsService.getAllStudents();
			res.status(200).json({ error: undefined, data: data, success: true });
		} catch (error) {
			next(error);
		}
	}

	private async getStudent(
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) {
		try {
			const dto = StudentID.fromRequestParams(req.params);
			const data = await this.studentsService.getStudent(dto);

			res.status(200).json({
				error: undefined,
				data: parseForResponse(data),
				success: true,
			});
		} catch (error) {
			next(error);
		}
	}

	private async getAssignments(
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) {
		try {
			const dto = StudentID.fromRequestParams(req.params);
			const data = await this.studentsService.getAssignments(dto);

			res.status(200).json({
				error: undefined,
				data: parseForResponse(data),
				success: true,
			});
		} catch (error) {
			next(error);
		}
	}

	private async getGrades(
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) {
		try {
			const dto = StudentID.fromRequestParams(req.params);

			const data = await this.studentsService.getGrades(dto);

			res.status(200).json({
				error: undefined,
				data: parseForResponse(data),
				success: true,
			});
		} catch (error) {
			next(error);
		}
	}
}

export default StudentsController;
