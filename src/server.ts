import express from "express";
import { PrismaClient } from './generated/prisma'
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../swagger.json"

const port = 3000;
const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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

        const movieWithSameTitle = await prisma.movie.findFirst({
            where: {
                title: {equals: title, mode: "insensitive"}
            }
        })

        if(movieWithSameTitle){
            return res.status(409).send({message: "Já existe um filme cadastrado com este título."})
        }

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
        return res.status(500).send({ message: "Erro ao adicionar filme." });
    }
    res.status(201).send("");
});

app.put("/movies/:id", async (req, res) => {
    const id = Number(req.params.id);
    try{ 
    const movie = await prisma.movie.findUnique({
        where: {
            id
        }
    });

    if(!movie){
        return res.status(404).send({message: "Filme não encrontrado para alteração."})
    }

    const data = {...req.body};
    data.release_date = data.release_date ? new Date(data.release_date) : undefined;
    await prisma.movie.update({
        where: {
            id
        },
        data: data
    });
    }catch(error){
        return res.status(500).send({message: "Falha ao atualizar o registro."});
    }
    res.status(200).send({mensage: "Filme atualizado com sucesso."});
});

app.delete("/movies/:id", async (req, res) => {
    const id = Number(req.params.id);
     
    try{
        const movie = await prisma.movie.findUnique({where: {id}});

        if(!movie){
            return res.status(404).send({message: "Filme não encrontrado para remoção."})
        }

         await prisma.movie.delete({where: {id}});

    }catch(error){
        return res.status(500).send({message: "Falha ao remover registro."});
    }
    res.status(200).send({message: "Filme deletado com sucesso."})
});

app.get("/movies/:genreName", async (req, res) => {
    
   try{
    const moviesFilteredByGenderName = await prisma.movie.findMany({
        include: {
            genres: true,
            languages: true
        },
        where: {
            genres: {
                name: {
                    equals: req.params.genreName,
                    mode: "insensitive"
                }
            }
        }
    });
    res.status(200).send(moviesFilteredByGenderName);
   }catch(error){
        return res.status(500).send({message: "Falha ao buscar filmes."});
   }

});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});