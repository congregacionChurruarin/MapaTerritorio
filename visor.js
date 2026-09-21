const URL =
"https://script.google.com/macros/s/AKfycbwEABkKEpSezvJ82on1MLBSkwXULYt12PKgbzD1ujdph9BhS8cL3oHrmJnO0tV66IOupQ/exec";


// ========================================
// ELEMENTOS
// ========================================

const visor =
    document.getElementById("visor");

const capturaZoom =
    document.getElementById("capturaZoom");

const objetoSVG1 =
    document.getElementById("svgMapa1");

const objetoSVG2 =
    document.getElementById("svgMapa2");

const mapaTransformado1 =
    document.getElementById("mapaTransformado1");

const mapaTransformado2 =
    document.getElementById("mapaTransformado2");

const mapaPlano1 =
    document.getElementById("mapaPlano1");

const mapaPlano2 =
    document.getElementById("mapaPlano2");

const botonPlano1 =
    document.getElementById("botonPlano1");

const botonPlano2 =
    document.getElementById("botonPlano2");


// ========================================
// SVG
// ========================================

let svg1 = null;
let svg2 = null;

let datosManzanas = [];


// ========================================
// PLANO ACTIVO
// ========================================

let planoActivo = 1;


// ========================================
// ZOOM PLANO 1
// ========================================

let zoom1 = 1;
let desplazamientoX1 = 0;
let desplazamientoY1 = 0;


// ========================================
// ZOOM PLANO 2
// ========================================

let zoom2 = 1;
let desplazamientoX2 = 0;
let desplazamientoY2 = 0;


// ========================================
// OBTENER DATOS DEL PLANO ACTIVO
// ========================================

function obtenerSVG() {

    return planoActivo === 1
        ? svg1
        : svg2;
}


function obtenerMapaTransformado() {

    return planoActivo === 1
        ? mapaTransformado1
        : mapaTransformado2;
}


function obtenerZoom() {

    return planoActivo === 1
        ? zoom1
        : zoom2;
}


function obtenerDesplazamientoX() {

    return planoActivo === 1
        ? desplazamientoX1
        : desplazamientoX2;
}


function obtenerDesplazamientoY() {

    return planoActivo === 1
        ? desplazamientoY1
        : desplazamientoY2;
}


function establecerTransformacion(
    nuevoZoom,
    nuevoX,
    nuevoY
) {

    if (planoActivo === 1) {

        zoom1 = nuevoZoom;
        desplazamientoX1 = nuevoX;
        desplazamientoY1 = nuevoY;

    } else {

        zoom2 = nuevoZoom;
        desplazamientoX2 = nuevoX;
        desplazamientoY2 = nuevoY;

    }

    aplicarTransformacion();
}


// ========================================
// APLICAR TRANSFORMACIÓN
// ========================================

function aplicarTransformacion() {

    const mapa =
        obtenerMapaTransformado();

    const zoom =
        obtenerZoom();

    const x =
        obtenerDesplazamientoX();

    const y =
        obtenerDesplazamientoY();

    mapa.style.transform =
        `translate(${x}px, ${y}px) scale(${zoom})`;
}


// ========================================
// CARGAR PLANO 1
// ========================================

objetoSVG1.addEventListener("load", () => {

    svg1 =
        objetoSVG1.contentDocument;

    console.log(
        "PLANO 1 CARGADO:",
        svg1
    );

    if (svg1) {

        actualizarNombresCalles(svg1);

        if (!datosManzanas.length) {
            cargarColores();
        } else {
            colorearPlano(svg1, 1);
        }
    }

});


// ========================================
// CARGAR PLANO 2
// ========================================

objetoSVG2.addEventListener("load", () => {

    svg2 =
        objetoSVG2.contentDocument;

    console.log(
        "PLANO 2 CARGADO:",
        svg2
    );

    if (svg2) {

        actualizarNombresCalles(svg2);

        if (datosManzanas.length) {
            colorearPlano(svg2, 2);
        }
    }

});


// ========================================
// CARGAR GOOGLE SHEETS
// ========================================

function cargarColores() {

    console.log(
        "Consultando Google Sheets..."
    );

    fetch(URL + "?t=" + Date.now())

        .then(r => {

            console.log(
                "HTTP:",
                r.status
            );

            if (!r.ok) {

                throw new Error(
                    "Error HTTP: " + r.status
                );

            }

            return r.json();

        })

        .then(datos => {

            console.log(
                "DATOS RECIBIDOS:",
                datos
            );

            datosManzanas =
                Array.isArray(datos)
                    ? datos
                    : [];

            console.log(
                "MANZANAS CARGADAS:",
                datosManzanas.length
            );

            console.log(
                "PRIMERA MANZANA:",
                datosManzanas[0]
            );


            // Colorear los dos planos

            if (svg1) {
                colorearPlano(svg1, 1);
            }

            if (svg2) {
                colorearPlano(svg2, 2);
            }

        })

        .catch(error => {

            console.error(
                "ERROR GOOGLE SHEETS:",
                error
            );

        });
}


// ========================================
// COLOREAR UN PLANO
// ========================================

function colorearPlano(svg, numeroPlano) {

    if (!svg) return;

    const manzanasSVG =
        Array.from(
            svg.querySelectorAll(
                "path[data-manzana]"
            )
        );

    // Guardar cuántas veces ya usamos cada nombre
    const usados = {};

    datosManzanas.forEach(fila => {

        const id =
            String(fila.manzana || "")
                .trim()
                .toUpperCase()
                .replace(/\s+/g, "");

        if (!id) return;


        // Buscar TODAS las manzanas con ese nombre
        const coincidencias =
            manzanasSVG.filter(elem => {

                const nombreSVG =
                    String(
                        elem.getAttribute(
                            "data-manzana"
                        ) || ""
                    )
                        .trim()
                        .toUpperCase()
                        .replace(/\s+/g, "");

                return nombreSVG === id;

            });


        if (!coincidencias.length) return;


        // Número de aparición de esta manzana
        const indice =
            usados[id] || 0;

        usados[id] = indice + 1;


        // Si hay varias iguales, usar la correspondiente
        const manzana =
            coincidencias[
                Math.min(
                    indice,
                    coincidencias.length - 1
                )
            ];


        let color;

        if (numeroPlano === 1) {

            color =
                fila.color || "#ffffff";

        } else {

            color =
                fila.grupos || "#ffffff";

        }


        manzana.style.fill = color;

    });

}


// ========================================
// CAMBIAR DE PESTAÑA
// ========================================

botonPlano1.addEventListener(
    "click",
    function() {

        planoActivo = 1;

        mapaPlano1.classList.remove(
            "oculto"
        );

        mapaPlano2.classList.add(
            "oculto"
        );

        botonPlano1.classList.add(
            "activa"
        );

        botonPlano2.classList.remove(
            "activa"
        );

        aplicarTransformacion();

    }
);


botonPlano2.addEventListener(
    "click",
    function() {

        planoActivo = 2;

        mapaPlano1.classList.add(
            "oculto"
        );

        mapaPlano2.classList.remove(
            "oculto"
        );

        botonPlano1.classList.remove(
            "activa"
        );

        botonPlano2.classList.add(
            "activa"
        );

        aplicarTransformacion();

    }
);


// ========================================
// RUEDA DEL MOUSE
// ========================================

capturaZoom.addEventListener(
    "wheel",
    function(e) {

        e.preventDefault();

        const rect =
            visor.getBoundingClientRect();

        const mouseX =
            e.clientX - rect.left;

        const mouseY =
            e.clientY - rect.top;


        const zoomActual =
            obtenerZoom();

        const xActual =
            obtenerDesplazamientoX();

        const yActual =
            obtenerDesplazamientoY();


        const mapaX =
            (mouseX - xActual) /
            zoomActual;

        const mapaY =
            (mouseY - yActual) /
            zoomActual;


        let nuevoZoom;

        if (e.deltaY < 0) {

            nuevoZoom =
                zoomActual * 1.15;

        } else {

            nuevoZoom =
                zoomActual / 1.15;

        }


        nuevoZoom =
            Math.max(
                0.5,
                Math.min(500, nuevoZoom)
            );


        const nuevoX =
            mouseX -
            mapaX * nuevoZoom;

        const nuevoY =
            mouseY -
            mapaY * nuevoZoom;


        establecerTransformacion(
            nuevoZoom,
            nuevoX,
            nuevoY
        );

    },
    { passive: false }
);


// ========================================
// ARRASTRE
// ========================================

let arrastrando = false;

let inicioX = 0;
let inicioY = 0;


capturaZoom.addEventListener(
    "mousedown",
    function(e) {

        arrastrando = true;

        inicioX =
            e.clientX -
            obtenerDesplazamientoX();

        inicioY =
            e.clientY -
            obtenerDesplazamientoY();

        clicInicialX =
            e.clientX;

        clicInicialY =
            e.clientY;

    }
);


capturaZoom.addEventListener(
    "mousemove",
    function(e) {

        if (!arrastrando)
            return;


        const nuevoX =
            e.clientX - inicioX;

        const nuevoY =
            e.clientY - inicioY;


        establecerTransformacion(
            obtenerZoom(),
            nuevoX,
            nuevoY
        );

    }
);


capturaZoom.addEventListener(
    "mouseup",
    function(e) {

        arrastrando = false;


        const diferenciaX =
            Math.abs(
                e.clientX -
                clicInicialX
            );

        const diferenciaY =
            Math.abs(
                e.clientY -
                clicInicialY
            );


        if (
            diferenciaX <= 5 &&
            diferenciaY <= 5
        ) {

            detectarManzana(
                e.clientX,
                e.clientY,
                e.clientX,
                e.clientY
            );

        }

    }
);


capturaZoom.addEventListener(
    "mouseleave",
    function() {

        arrastrando = false;

    }
);


// ========================================
// TOUCH
// ========================================

let dedos = new Map();

let distanciaInicial = 0;

let zoomInicial = 1;

let centroInicialX = 0;
let centroInicialY = 0;

let mapaCentroX = 0;
let mapaCentroY = 0;


capturaZoom.addEventListener(
    "touchstart",
    function(e) {

        e.preventDefault();

        dedos.clear();

        for (
            let i = 0;
            i < e.touches.length;
            i++
        ) {

            dedos.set(
                i,
                {
                    x: e.touches[i].clientX,
                    y: e.touches[i].clientY
                }
            );

        }


        if (e.touches.length === 1) {

            arrastrando = true;

            inicioX =
                e.touches[0].clientX -
                obtenerDesplazamientoX();

            inicioY =
                e.touches[0].clientY -
                obtenerDesplazamientoY();

        }


        if (e.touches.length === 2) {

            arrastrando = false;

            const dedo1 =
                dedos.get(0);

            const dedo2 =
                dedos.get(1);


            distanciaInicial =
                distanciaEntreDedos(
                    dedo1,
                    dedo2
                );


            zoomInicial =
                obtenerZoom();


            const rect =
                visor.getBoundingClientRect();


            centroInicialX =
                (
                    dedo1.x +
                    dedo2.x
                ) / 2 -
                rect.left;


            centroInicialY =
                (
                    dedo1.y +
                    dedo2.y
                ) / 2 -
                rect.top;


            mapaCentroX =
                (
                    centroInicialX -
                    obtenerDesplazamientoX()
                ) /
                obtenerZoom();


            mapaCentroY =
                (
                    centroInicialY -
                    obtenerDesplazamientoY()
                ) /
                obtenerZoom();

        }

    },
    { passive: false }
);


capturaZoom.addEventListener(
    "touchmove",
    function(e) {

        e.preventDefault();


        if (
            e.touches.length === 1 &&
            arrastrando
        ) {

            const nuevoX =
                e.touches[0].clientX -
                inicioX;

            const nuevoY =
                e.touches[0].clientY -
                inicioY;


            establecerTransformacion(
                obtenerZoom(),
                nuevoX,
                nuevoY
            );

            return;

        }


        if (e.touches.length === 2) {

            const dedo1 = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };

            const dedo2 = {
                x: e.touches[1].clientX,
                y: e.touches[1].clientY
            };


            const distanciaActual =
                distanciaEntreDedos(
                    dedo1,
                    dedo2
                );


            if (
                distanciaInicial === 0
            )
                return;


            let nuevoZoom =
                zoomInicial *
                (
                    distanciaActual /
                    distanciaInicial
                );


            nuevoZoom =
                Math.max(
                    0.5,
                    Math.min(500, nuevoZoom)
                );


            const rect =
                visor.getBoundingClientRect();


            const centroActualX =
                (
                    dedo1.x +
                    dedo2.x
                ) / 2 -
                rect.left;


            const centroActualY =
                (
                    dedo1.y +
                    dedo2.y
                ) / 2 -
                rect.top;


            const nuevoX =
                centroActualX -
                mapaCentroX *
                nuevoZoom;


            const nuevoY =
                centroActualY -
                mapaCentroY *
                nuevoZoom;


            establecerTransformacion(
                nuevoZoom,
                nuevoX,
                nuevoY
            );

        }

    },
    { passive: false }
);


capturaZoom.addEventListener(
    "touchend",
    function(e) {

        if (
            e.changedTouches.length === 1 &&
            e.touches.length === 0
        ) {

            const dedo =
                e.changedTouches[0];


            const diferenciaX =
                Math.abs(
                    dedo.clientX -
                    inicioX -
                    obtenerDesplazamientoX()
                );


            const diferenciaY =
                Math.abs(
                    dedo.clientY -
                    inicioY -
                    obtenerDesplazamientoY()
                );


            if (
                diferenciaX < 10 &&
                diferenciaY < 10
            ) {

                detectarManzana(
                    dedo.clientX,
                    dedo.clientY,
                    dedo.clientX,
                    dedo.clientY
                );

            }

        }


        if (e.touches.length === 0) {

            arrastrando = false;

            distanciaInicial = 0;

            dedos.clear();

        }


        if (e.touches.length === 1) {

            arrastrando = true;

            inicioX =
                e.touches[0].clientX -
                obtenerDesplazamientoX();

            inicioY =
                e.touches[0].clientY -
                obtenerDesplazamientoY();

        }

    },
    { passive: false }
);


// ========================================
// DISTANCIA ENTRE DEDOS
// ========================================

function distanciaEntreDedos(a, b) {

    const dx =
        b.x - a.x;

    const dy =
        b.y - a.y;

    return Math.sqrt(
        dx * dx +
        dy * dy
    );

}


// ========================================
// NOMBRES DE CALLES
// ========================================

function actualizarNombresCalles(svg) {

    if (!svg) return;

    const elementosCalle =
        svg.querySelectorAll(
            ".nombreCalle"
        );

    console.log(
        "NOMBRES DE CALLES ENCONTRADOS:",
        elementosCalle.length
    );

    elementosCalle.forEach(elem => {

        elem.style.display = "";

    });

}


// ========================================
// DETECTAR MANZANA
// ========================================

function detectarManzana(
    clientX,
    clientY,
    posicionX = null,
    posicionY = null
) {

    const svg =
        obtenerSVG();

    if (!svg) return;


    const svgElement =
        svg.documentElement;

    if (!svgElement) return;


    const rectVisor =
        visor.getBoundingClientRect();


    const xVisor =
        clientX -
        rectVisor.left;

    const yVisor =
        clientY -
        rectVisor.top;


    const xMapa =
        (
            xVisor -
            obtenerDesplazamientoX()
        ) /
        obtenerZoom();


    const yMapa =
        (
            yVisor -
            obtenerDesplazamientoY()
        ) /
        obtenerZoom();


    const punto =
        svgElement.createSVGPoint();


    const rectSVG =
        svgElement.getBoundingClientRect();


    punto.x =
        xMapa +
        rectSVG.left -
        rectVisor.left;

    punto.y =
        yMapa +
        rectSVG.top -
        rectVisor.top;


    const elementos =
        svg.querySelectorAll(
            "path[data-manzana]"
        );


    for (
        const manzana of elementos
    ) {

        const matriz =
            manzana.getScreenCTM();

        if (!matriz) continue;


        const puntoLocal =
            punto.matrixTransform(
                matriz.inverse()
            );


        if (
            manzana.isPointInFill &&
            manzana.isPointInFill(
                puntoLocal
            )
        ) {

            const nombre =
                manzana.getAttribute(
                    "data-manzana"
                );


            console.log(
                "MANZANA CORRECTA:",
                nombre
            );


            mostrarInformacionManzana(
                nombre,
                posicionX !== null
                    ? posicionX
                    : clientX,
                posicionY !== null
                    ? posicionY
                    : clientY
            );


            return;

        }

    }


    console.log(
        "NO SE ENCONTRÓ MANZANA"
    );

}


// ========================================
// MOSTRAR INFORMACIÓN
// ========================================

function mostrarInformacionManzana(
    nombre,
    posicionX = null,
    posicionY = null
) {

    console.log(
        "================================"
    );

    console.log(
        "MANZANA CLIC:",
        nombre
    );

    console.log(
        "CANTIDAD DE DATOS:",
        datosManzanas.length
    );

    console.log(
        "================================"
    );


    if (!datosManzanas.length) {

        console.log(
            "LOS DATOS DE GOOGLE SHEETS TODAVÍA NO ESTÁN CARGADOS"
        );

        return;

    }


    const manzanaClic =
        String(nombre || "")
            .trim()
            .toUpperCase()
            .replace(/\s+/g, "");


    const dato =
        datosManzanas.find(fila => {

            const manzanaPlanilla =
                String(fila.manzana || "")
                    .trim()
                    .toUpperCase()
                    .replace(/\s+/g, "");

            return (
                manzanaPlanilla ===
                manzanaClic
            );

        });


    console.log(
        "DATO ENCONTRADO:",
        dato
    );


    if (!dato) {

        console.log(
            "NO SE ENCONTRÓ LA MANZANA:",
            manzanaClic
        );

        return;

    }


    let ventana =
        document.getElementById(
            "infoManzana"
        );


    if (!ventana) {

        ventana =
            document.createElement("div");

        ventana.id =
            "infoManzana";

        document.body.appendChild(
            ventana
        );

    }


    if (
        posicionX !== null &&
        posicionY !== null
    ) {

        ventana.style.position =
            "fixed";

        ventana.style.left =
            (
                posicionX + 10
            ) + "px";

        ventana.style.top =
            (
                posicionY + 10
            ) + "px";

    }


    ventana.innerHTML = `

        <div class="cerrarInfo"
             onclick="cerrarInformacion()">
            ×
        </div>

        <h3>
            MANZANA ${dato.manzana}
        </h3>

        <p>
            <b>Asignado a:</b><br>
            ${dato.responsable || "-"}
        </p>

        <p>
            <b>Fecha inicio:</b><br>
            ${dato.fechaInicio || "-"}
        </p>

        <p>
            <b>Última fecha:</b><br>
            ${dato.ultimaFecha || "-"}
        </p>

    `;

}


// ========================================
// CERRAR INFORMACIÓN
// ========================================

function cerrarInformacion() {

    const ventana =
        document.getElementById(
            "infoManzana"
        );

    if (ventana) {

        ventana.remove();

    }

}


// ========================================
// VARIABLES PARA CLIC
// ========================================

let clicInicialX = 0;
let clicInicialY = 0;
