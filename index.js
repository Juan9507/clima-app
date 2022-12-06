require('dotenv').config()

const Busquedas = require("./models/busquedas");

const {
    leerInput,
    inquirerMenu,
    inquirerPausa,
    listarLugares
} = require("./helpers/inquirer");

// console.log(process.env.MAPBOX_KEY);


const main = async () => {

    const busquedas = new Busquedas()
    let opt;


    do {
        opt = await inquirerMenu();

        switch (opt) {

            case 1:
                // Mostrar mensaje
                const termino = await leerInput('Ciudad: ')
                
                // Buscar los lugarees
                const lugares = await busquedas.ciudad( termino )
                
                // Seleccionar el lugar
                const id = await listarLugares(lugares)

                if (id === '0') continue

                
                const lugarSel = lugares.find( lugar => lugar.id === id)
                
                // Guardar en DB
                busquedas.agregarHistorial( lugarSel.nombre )

                // Clima
                const clima = await busquedas.climaLugar(lugarSel.lat,lugarSel.lng)

                //Mostrar resultados
                console.clear()
                console.log('\nInformación de la ciudad\n'.green )
                console.log('Ciudad:',  lugarSel.nombre.green )
                console.log('Lat:', lugarSel.lat )
                console.log('Lng:', lugarSel.lng )
                console.log('Temperatura:', clima.temp)
                console.log('Mínima:', clima.min)
                console.log('Máxima:', clima.max)
                console.log('Como está el clima:', clima.desc.green)

                break;
            case 2:

                busquedas.historialCapitalizadoo.forEach( (lugar,i) => {
                    const idx = `${ i + 1}.`.green
                    console.log( `${ idx } ${ lugar }` )
                })

                break;

            default:
                break;
        }

        opt !== 0 && (await inquirerPausa());

    } while (opt !== 0);
};

main();