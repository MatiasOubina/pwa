const photoGrid = document.querySelector('main#photoGrid');
const urlApi = new URL('https://6701a574b52042b542d844db.mockapi.io/tpUno');
const datosApi = [];
const cardModelo = document.querySelector('div#cardModelo');


/********************
 *                  *
 * Datos desde API  *
 *                  *
 ********************/

function obtenerDatosApi() {
    urlApi.searchParams.append('orderBy', 'id')
    urlApi.searchParams.append('order', 'desc');
    fetch(urlApi)
        .then((respuesta) => {
            if (respuesta.status === 200) {
                return respuesta.json()
            } else {
                throw new Error("No se pudo obtener los datos")
            }
        })
        .then((datos) => datosApi.push(...datos))
        .then(() => mostrarDatos())
}

/***********************
 *                     *
 *  Muesta de datos    *
 *                     *
 ***********************/
function mostrarDatos() {
    if (datosApi.length > 0) {
        cardModelo.style.display = "none";
        photoGrid.innerHTML = "";

        datosApi.forEach(foto => {
            const card = `<div class="photo-card">
                            <img src="${foto.url}" title="${foto.title}" />
                            <p>Fecha: ${new Date(foto.date).toLocaleString()}</p>
                            <h2>${foto.title}</h2>
                          </div>
            `
            photoGrid.innerHTML += card;
        });
    } else {
        cardModelo.style.display = "block";
    }
}

/************************
 *                      *
 *  Captura de imagen   *
 *                      *
 ************************/
const btnCamara = document.querySelector('button#capturaImg');
const imgTomada = document.querySelector('img#imgTomada');
const modal = document.querySelector('dialog');
const btnModalCancelar = document.querySelector('button#btnCancelar')
const btnGuardarImg = document.querySelector('button#btnGuardar')

const inputCamara = document.createElement('input')
inputCamara.type = 'file'
inputCamara.id = 'inputFile'
inputCamara.accept = '.png, .jpg, .webp'
inputCamara.capture = 'environment'


/************************
 *                      *
 *  Conversion BASE 64  *
 *                      *
 ************************/
function convertirAbase64() {
    const canvas = document.createElement('canvas')
    canvas.width = imgTomada.width
    canvas.height = imgTomada.height

    const ctx = canvas.getContext('2d')
    ctx.drawImage(imgTomada, 0, 0, imgTomada.width, imgTomada.height)

    return canvas.toDataURL('image/webp')
}

/*******************
 *                 *
 *  Subida Imagen  *
 *                 *
 *******************/
function subirImg() {
    const fecha = new Date();

    const nuevaImagen = {
        url: convertirAbase64(),
        title: document.querySelector('#tituloImg').value,
        date: fecha.toLocaleString('es-AR'),
    }

    const opciones = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaImagen)
    }

    fetch(urlApi, opciones)
        .then((respuesta) => {
            if (respuesta.status === 201) {
                document.querySelector('#tituloImg').value = "";
                return respuesta.json()
            } else {
                throw new Error("No se pudo subir la imagen")
            }
        })
        .then((dato) => {
            datosApi.push(dato)
            datosApi.sort((a, b) => b.id - a.id);
            mostrarDatos()
        })
}

/********************
 *                  *
 *  Eventos varios  *
 *                  *
 ********************/


//Evento cuando se activa la cámara
btnCamara.addEventListener('click', () => inputCamara.click())

//Evento cuando se captura la imagen
inputCamara.addEventListener('change', () => {
    const imagenCapturada = URL.createObjectURL(inputCamara.files[0]);
    imgTomada.src = imagenCapturada;
    modal.showModal();
})

//Evento para cerrar el modal
btnModalCancelar.addEventListener('click', () => modal.close())

//Evento para guardar la imagen
btnGuardarImg.addEventListener('click', function (event) {
    event.preventDefault()

    const titulo = document.querySelector('#tituloImg').value.trim();
    const mensajeError = document.getElementById('mensajeError');

    if (titulo === "") {
        mensajeError.style.display = "block";
    } else {
        mensajeError.style.display = "none";
        subirImg()
        modal.close()
    }

})

//Evento para cuando se pierde conexión a internet
window.addEventListener('offline', () => {
    btnGuardarImg.disabled = true;
    btnGuardarImg.classList.add('button-disabled');
})

//Evento para cuando se reestablece la conexión a internet
window.addEventListener('online', () => {
    btnGuardarImg.disabled = false;
    btnGuardarImg.classList.remove('button-disabled');

})

/************************
 *                      *
 *  Función Principal   *
 *                      *
 ************************/
obtenerDatosApi()