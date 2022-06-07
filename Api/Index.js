const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cassandra = require('cassandra-driver');

const app = express();

//Crear cliente de Cassandra con 3 nodos
const client = new cassandra.Client({
    contactPoints: ['127.0.0.1:9042', '127.0.0.1:9142', '127.0.0.1:9242'],
    localDataCenter: 'datacenter1',
    keyspace: 'test'
});

app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );
app.use(bodyParser.json());
app.use(cors());

var port = process.env.PORT || 3000;
var host = process.env.PORT || '0.0.0.0';



app.get("/", (req, res) => {
    res.send("Y aqui estamos de vuelta!!!");
  });

app.post("create", (req, res) => {
  console.log("Creando receta");
  var nombre = req.body.nombre;
  var apellido = req.body.apellido;
  var rut = req.body.rut;
  var email = req.body.email;
  var fecha_nacimiento = req.body.fecha_nacimiento;
  var comentario = req.body.comentario;
  var farmacos = req.body.farmacos;
  var doctor = req.body.doctor;
  //Si el paciente no existe, debera crearlo junto a la receta unica.
  client.execute(`SELECT * FROM paciente WHERE rut = ${rut}`, (err, result) => {
    if (err) {
      console.log(err);
      res.send("Error");
    } else {
      if (result.rows.length == 0) {
        client.execute(
          //Se inserta el paciente y la receta en distintas tablas.
          `INSERT INTO paciente (rut, nombre, apellido, email, fecha_nacimiento) VALUES (${rut}, '${nombre}', '${apellido}', '${email}', '${fecha_nacimiento}')`,
          (err, result) => {
            if (err) {
              console.log(err);
              res.send("Error");
            } else {
              console.log("Paciente creado");
              client.execute(
                //Inserta receta en base al id del paciente
                `INSERT INTO receta (id_paciente, comentario, farmacos, doctor) VALUES (${rut}, '${comentario}', '${farmacos}', '${doctor}')`,
                (err, result) => {
                  if (err) {
                    console.log(err);
                    res.send("Error");
                  } else {
                    console.log("Receta creada");
                    res.send("Receta creada");
                  }
                }
              );
            }
          }
        );
      } else {
        console.log("Paciente ya existe");
        client.execute(
          //Inserta receta en base al id del paciente
          `INSERT INTO receta (id_paciente, comentario, farmacos, doctor) VALUES (${rut}, '${comentario}', '${farmacos}', '${doctor}')`,
          (err, result) => {
            if (err) {
              console.log(err);
              res.send("Error");
            } else {
              console.log("Receta creada");
              res.send("Receta creada");
            }
          }
        );
      }
    }
  }
  );
});
app.post("/edit", (req, res) => {
  console.log("Editando receta");
  var id = req.body.id;
  var comentario = req.body.comentario;
  var farmacos = req.body.farmacos;
  var doctor = req.body.doctor;
  //Este metodo debera enviar los datos a editar de la receta, siendo necesario el id de este  ́ultimo
  client.execute(
    `UPDATE receta SET comentario = '${comentario}', farmacos = '${farmacos}', doctor = '${doctor}' WHERE  id_paciente = ${id}`,
    (err, result) => {
      if (err) {
        console.log(err);
        res.send("Error");
      } else {
        res.send("Paciente editado");
      }
    }
  );
});


app.post("/delete", (req, res) => {
  console.log("Eliminando receta");
  var id = req.body.id;
  //Se elimina receta
  client.execute(
    `DELETE FROM receta WHERE id = ${id}`,
    (err, result) => {
      if (err) {
        console.log(err);
        res.send("Error");
      } else {
        res.send("Receta eliminada");
      }
    }
  );
});

  //Se crea el puerto
  app.listen(port,host, () => {
    console.log(`API run in: http://localhost:${port}.`);
  });