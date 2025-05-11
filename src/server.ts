import express from "express";
import { PrismaClient } from './generated/prisma' 

const port = 3000;
const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.get("/movies", async (_, res) => {
    const movies = await prisma.movie.findMany({
        orderBy: {
            title: "asc",
        },
        include: {
            genres: true,
            languages: true
        }
    });
    res.json(movies);
});

app.post("/movies", async (req, res) => {

    const { title, genre_id, language_id, oscar_count, release_date} = req.body
    try{ 
    await prisma.movie.create({
        data: {
            title: title,
            genre_id: genre_id,
            language_id: language_id,
            oscar_count: oscar_count,
            release_date: new Date(release_date)
        }
    });
    }catch(error){
        res.status(500).send({ message: "Erro ao adicionar filme!" });
    }
    res.status(201).send("");
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});