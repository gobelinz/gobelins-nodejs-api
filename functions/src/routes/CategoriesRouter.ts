import { Router, Request, Response } from "express";
import { HttpStatuses } from "../model/Enum";
import { Validator } from "./middlewares/Validator"

export function categoriesRouter(store: FirebaseFirestore.Firestore): Router {
    const router: Router = Router();
    const colName: string = "categories";
    const validator:Validator = new Validator();

    router.get("/", async (req: Request, res: Response) => {
        try {
            const categoriesQuerySnapshot = await store.collection(colName).get();
            const categories: unknown[] = [];
            categoriesQuerySnapshot.forEach(
                (doc) => {
                    categories.push({
                        id: doc.id,
                        ...doc.data(),
                    });
                }
            );
            res.status(HttpStatuses.OK).json(categories);
        } catch (error) {
            res.status(HttpStatuses.InternalServerError).send(error);
        }
    });

    router.get("/:categoryId", async (req: Request, res: Response) => {
        const categoryId = req.params.categoryId;

        try {
            const categoryDocumentSnapshot = await store.collection(colName).doc(categoryId).get();
            if (!categoryDocumentSnapshot.exists) {
                res.status(HttpStatuses.NotFound);
            }
            res.status(HttpStatuses.OK).json({ id: categoryDocumentSnapshot.id, ...categoryDocumentSnapshot.data() });
        } catch (error) {
            res.status(HttpStatuses.InternalServerError).send(error)
        }
    });

    router.post("/", validator.createUpdateCategoryValidationRules(), validator.validate, async (req: Request, res: Response) => {
        const name = req.body.name;
        try {
            const documentReference = await store.collection(colName).add({ name: name });
            res.status(HttpStatuses.Created).json({ id: documentReference.id, name: name });
        } catch (error) {
            res.status(HttpStatuses.InternalServerError).send(error);
        }
    })

    router.put("/:categoryId", validator.createUpdateCategoryValidationRules(), validator.validate, async (req: Request, res: Response) => {
		const categoryId = req.params.categoryId;
        const name = req.body.name;
        try {
            await store.collection(colName).doc(categoryId).update({ name: name });
            const updatedCategory = await store.collection(colName).doc(categoryId).get()
            res.status(HttpStatuses.OK).json({ id: updatedCategory.id, ...updatedCategory.data() })
        } catch (error) {
            res.status(HttpStatuses.InternalServerError).send(error);
        }
	})

    router.delete("/:categoryId", async (req: Request, res: Response) => {
        try {
            await store.collection(colName).doc(req.params.categoryId).delete()
            res.status(HttpStatuses.NoContent).send("Category successfully deleted")
        } catch (error) {
            res.status(HttpStatuses.InternalServerError).send(error);
        }
    })

    return router;
}