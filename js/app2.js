const photoGrid = document.querySelector('main#photoGrid');
const urlApi = new URL('https://6701a574b52042b542d844db.mockapi.io/tpUno');
const datosApi = [];
const msjError = document.querySelector('div#msjError');

//Obtengo datos de MockApi
function obtenerDatosApi() {
    urlApi.searchParams.append('orderBy', 'id')
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

//Muestro los datos
function mostrarDatos() {
    if (datosApi.length > 0) {
        msjError.style.display = "none";
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
        msjError.style.display = "block";
    }
}

//Capturo la imagen
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


inputCamara.addEventListener('change', () => {
    const imagenCapturada = URL.createObjectURL(inputCamara.files[0]);
    imgTomada.src = imagenCapturada;
    modal.showModal();
})


//Conversión a BASE64
function convertirAbase64() {
    const canvas = document.createElement('canvas')
    canvas.width = imgTomada.width
    canvas.height = imgTomada.height

    const ctx = canvas.getContext('2d')
    ctx.drawImage(imgTomada, 0, 0, imgTomada.width, imgTomada.height)

    return canvas.toDataURL('image/webp')
}

//Subo imagen
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

//Eventos varios
btnCamara.addEventListener('click', () => inputCamara.click())
btnModalCancelar.addEventListener('click', () => modal.close())
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

//FUNCIONES PRINCIPALES
obtenerDatosApi()