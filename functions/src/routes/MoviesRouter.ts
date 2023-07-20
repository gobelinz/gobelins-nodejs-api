import { Router, Request, Response } from "express";
import { HttpStatuses } from "../model/Enum";
import { Validator } from "./middlewares/Validator";

export function moviesRouter(store: FirebaseFirestore.Firestore): Router {
	const router: Router = Router();
	const colName: string = "movies";
	const validator: Validator = new Validator();

	router.get("/", async (req: Request, res: Response) => {
		try {
			const moviesQuerySnapshot = await store.collection(colName).get();
			const movies: unknown[] = [];
			moviesQuerySnapshot.forEach(
				(doc) => {
					movies.push({
						id: doc.id,
						...doc.data(),
					});
				}
			);
			res.status(HttpStatuses.OK).json(movies);
		} catch (error) {
			res.status(HttpStatuses.InternalServerError).send(error);
		}
	});

	router.get("/:movieId", async (req: Request, res: Response) => {
		const movieId = req.params.movieId;

		try {
			const movieDocumentSnapshot = await store.collection(colName).doc(movieId).get();
			if (!movieDocumentSnapshot.exists) {
				res.status(HttpStatuses.NotFound);
			}
			res.status(HttpStatuses.OK).json({ id: movieDocumentSnapshot.id, ...movieDocumentSnapshot.data() });
		} catch (error) {
			res.status(HttpStatuses.InternalServerError).send(error)
		}
	});

	router.post("/", validator.createUpdateMovieValidationRules(), validator.validate, async (req: Request, res: Response) => {
		const movie = {
			name: req.body.name,
			author: req.body.author,
			img: req.body.img,
			video: req.body.video,
			category: req.body.category,
			description: req.body.description,
			likes: Math.floor(Math.random() * 100),
			dislikes: Math.floor(Math.random() * 100)
		}

		try {
			const documentReference = await store.collection(colName).add(movie);
			res.status(HttpStatuses.Created).json({ id: documentReference.id, ...movie });
		} catch (error) {
			res.status(HttpStatuses.InternalServerError).send(error);
		}
	})

	router.patch("/:movieId", validator.createUpdateMovieValidationRules(), validator.validate, async (req: Request, res: Response) => {
		const movieId = req.params.movieId;
		const movie = {
			name: req.body.name,
			author: req.body.author,
			img: req.body.img,
			video: req.body.video,
			category: req.body.category,
			description: req.body.description,
		}
		try {
			await store.collection(colName).doc(movieId).update(movie);
			const updatedMovie = await store.collection(colName).doc(movieId).get()
			res.status(HttpStatuses.OK).json({ id: updatedMovie.id, ...updatedMovie.data() })
		} catch (error) {
			res.status(HttpStatuses.InternalServerError).send(error);
		}
	})

	router.patch("/:movieId/like", async (req: Request, res: Response) => {
		const movieId = req.params.movieId;
		try {
			const movie = await store.collection(colName).doc(movieId).get()
			if (!movie.exists) {
				res.status(HttpStatuses.NotFound);
			} else {
				const updatedMovie = { ...movie.data() }
				updatedMovie.likes += 1;
				await store.collection(colName).doc(movieId).update(updatedMovie);
				res.status(HttpStatuses.OK).json({ id: movieId, ...updatedMovie })
			}

		} catch (error) {
			res.status(HttpStatuses.InternalServerError).send(error);
		}
	})

	router.patch("/:movieId/dislike", async (req: Request, res: Response) => {
		const movieId = req.params.movieId;
		try {
			const movie = await store.collection(colName).doc(movieId).get()
			if (!movie.exists) {
				res.status(HttpStatuses.NotFound);
			} else {
				const updatedMovie = { ...movie.data() }
				updatedMovie.dislikes += 1;
				await store.collection(colName).doc(movieId).update(updatedMovie);
				res.status(HttpStatuses.OK).json({ id: movieId, ...updatedMovie })
			}

		} catch (error) {
			res.status(HttpStatuses.InternalServerError).send(error);
		}
	})

	router.delete("/:movieId", async (req: Request, res: Response) => {
		try {
			await store.collection(colName).doc(req.params.movieId).delete()
			res.status(HttpStatuses.NoContent).send("Movie successfully deleted")
		} catch (error) {
			res.status(HttpStatuses.InternalServerError).send(error);
		}
	})

	return router;
}
