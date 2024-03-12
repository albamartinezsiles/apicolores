const { MongoClient, ObjectId } = require("mongodb");

function conectar(){
    return MongoClient.connect(process.env.URL_MONGO);
} //esto retorna una conexión. 

function leerColores(){
    //queremos que salga un array con los colores o algo que me indique que ha ocurrido un error
    return new Promise(async (fulfil, reject) => {
        try {
            let conexion = await conectar(); // conectamos con la bd
            let coleccion = conexion.db("colores").collection("colores"); // seleccionamos la colección
            let colores = await coleccion.find({}).toArray(); // leemos los colores y los convertimos en array
            
            conexion.close(); // cerramos la conexión
            
            fulfil(colores); //respondemos devolviendo los colores

        
            }catch (error) {
                reject({error : "error en bd"}); //si caigo en el catch no hay conexion
            }
    });
}

function crearColor(color){
    return new Promise(async (fulfil, reject) => {
        try {
            let conexion = await conectar(); // conectamos con la bd
            let coleccion = conexion.db("colores").collection("colores"); // seleccionamos la colección
            let {insertedId} = await coleccion.insertOne(color);
            
            conexion.close(); // cerramos la conexión
            
            fulfil( {id : insertedId} ); //si la promesa se cumple devolvemos el id del color insertado

        
            }catch (error) {
                reject({error : "error en bd"}); 
            }
    });
}

function borrarColor(id){
    return new Promise(async (fulfil, reject) => {
        try {
            let conexion = await conectar();
            let coleccion = conexion.db("colores").collection("colores");
            let {deletedCount} = await coleccion.deleteOne({_id : new ObjectId(id)});
            conexion.close();
            fulfil( deletedCount );
        } catch (error) {
            console.error("Error en función borrarColor:", error); // Añade este punto de depuración
            reject(error);
        }
    });
}


module.exports = {leerColores,crearColor,borrarColor}; //exportamos las funciones para que puedan ser usadas en otros archivos.