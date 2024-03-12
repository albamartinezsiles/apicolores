require ("dotenv").config();
const express = require('express')
const cors = require('cors')
const { MongoClient, ObjectId } = require("mongodb");
const servidor = express();
const bodyParser = require('body-parser'); //permite extraer la información del cuerpo de la petición (para post, put, delete, etc)
const {leerColores,crearColor,borrarColor} = require("./db.js");

servidor.use(bodyParser.json()); //extrae la información y crea el objeto body en la petición

servidor.use(cors());


//servidor.use("/index",express.static("./index.html"));

function conectar(){
    return MongoClient.connect(process.env.URL_MONGO);
}


servidor.get("/colores", async (peticion, respuesta) => {
    //let conexion = await MongoClient.connect(process.env.URL_MONGO);

    //let coleccion = conexion.db("colores").collection("colores");

    try{
        let colores = await leerColores();
    
        respuesta.json(colores.map(({_id,r,g,b}) => {return { id: _id, r, g, b }}));
        }catch(error){
        console.log(error);
    }  

});

servidor.post("/crear-color", async (peticion, respuesta,siguiente) => {
    //la api espera un objeto que tiene r,g,b. Aqui podemos usar console.log de peticion.body para comprobar que nos llega !!
    
        let {r,g,b} = peticion.body;
        
        let valido = true;

        [r,g,b].forEach( n => valido = valido && n >= 0 && n <= 255); //esto es un bucle que recorre los elementos del array y devuelve true si todos los elementos cumplen la condición

        if (valido){
            try{
                let resultado = await crearColor({r,g,b}); //esto lo que se que estamos esperando de la peticion
                
                return respuesta.json(resultado);
            }catch(error){
                respuesta.status(500);
                return respuesta.json({error});
            }
        }
        else{
         siguiente({error : "color no válido"}); //a siguiente siempre hay que pasarle un error
        }
});

servidor.delete("/borrar/:id([a-f0-9]{24})", async (peticion, respuesta) => {


    try{
        
        let cantidad = await borrarColor(peticion.params.id); //esto lo que se que estamos esperando de la peticion        
        respuesta.json({ resultado : cantidad > 0 ? "ok" : "ko"});
    }
    catch(error){
        respuesta.status(500);
        respuesta.json(error);
    }
});

servidor.use((peticion,respuesta) => { //cualquier cosa que no encaje va a error not found!
    respuesta.status(404);
    respuesta.json({ error : "not found" });
});


servidor.use((error,peticion,respuesta,siguiente) => { //a este middleware se llega cuando se invoca el siguiente con un error
    respuesta.status(400);
    respuesta.json({ error : "petición no válida" });
});

servidor.listen(process.env.PORT)

