var express = require('express');

var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// default options
app.use(fileUpload());


app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // tipos de colección
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleccion no es valida',
            errors: { message: 'DTipo de coleccion no es valida' }
        });

    }



    if (!req.files) {

        return res.status(400).json({
            ok: false,
            mensaje: 'Error no hay un archivo',
            errors: { message: 'Debe de seleccionar una image' }
        });
    }


    // obtener nombre del archivo

    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // solo estas extenciones son validas
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'extensión no válida',
            errors: { message: 'El archivo debe ser en formato png, jpg, gif, jpeg' }
        });

    }

    // Nombre de archivo personalizado
    // 283134763284612-832.ext
    var nombreArchivo = ` ${ id }-${ new Date().getMilliseconds()}.${ extensionArchivo}`;

    // Mover el archivo del temporal al nuevo directorio

    var path = `./uploads/${ tipo }/${ nombreArchivo }`;

    archivo.mv(path, err => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });

        }
        subirPorTipo(tipo, id, nombreArchivo, res)
    })
});

function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Usuario que hemos creado no existe jaja ajaj no existe ',
                    errors: { message: 'Usuario no existe' }
                });
            }
            console.log('estoy aqui 3333333');
            var pathViejo = './uploads/usuarios/' + usuario.img;

            // si existe image anterior, la borra
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, (err) => {
                    if (err) throw err;
                    console.log('Eliminado correctamente', pathViejo);
                });
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {

                usuarioActualizado.password = ':)';

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario Actualizado',
                    usuario: usuarioActualizado
                });
            })

        });


    }
    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {

            if (!medico) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Medico no existe ',
                    errors: { message: 'Medico no existe' }
                });
            }

            var pathViejo = './uploads/medicos/' + medico.img;

            // si existe image anterior, la borra
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, (err) => {
                    if (err) throw err;
                    console.log('Eliminado correctamente', pathViejo);
                });
            }

            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico Actualizado',
                    usuario: medicoActualizado
                });
            })

        });
    }
    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Hospital no existe ',
                    errors: { message: 'Hospital no existe' }
                });
            }

            var pathViejo = './uploads/hospitales/' + hospital.img;

            // si existe image anterior, la borra
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, (err) => {
                    if (err) throw err;
                    console.log('Eliminado correctamente', pathViejo);
                });
            }

            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital Actualizado',
                    usuario: hospitalActualizado
                });
            })

        });
    }
}






module.exports = app;