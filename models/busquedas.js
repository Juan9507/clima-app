const fs = require('fs')

const axios = require('axios');

class Busquedas {
    
    historial = []

    dbPath = './db/database.json'

    constructor(){
        // TODO: leer DB si exite
        this.leerDB()
    }

    get historialCapitalizadoo() {

        return this.historial.map( item => {
            
            let palabras = item.split(' ')
            palabras = palabras.map(p => p[0].toUpperCase() + p.slice(1))
            return palabras.join(' ')
            
        })
    }

    get paramsMapbox() {
        return {
            'limit': 5,
            'language': 'es',
            'access_token': process.env.MAPBOX_KEY
        }
    }

    get paramsWeather() {
        return {
            appid: process.env.OPENWEATHER_KEY,
            lang: 'es',
            units: 'metirc'
        }
    }

    async ciudad( lugar = ''){

        try {
            // petición http
            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${ lugar }.json`,
                params: this.paramsMapbox

            })

            const resp = await instance.get();

            //console.log( 'ciudad', lugar )
            // const resp = await axios.get('https://api.mapbox.com/geocoding/v5/mapbox.places/Madrid.json?limit=5&proximity=ip&types=place,postcode,address&language=es&access_token=pk.eyJ1IjoianVhbjk1MDciLCJhIjoiY2xiYjY5dXJtMDJjMDNvcXc5OGlzZjZ3biJ9.gRVoKgjB7pJe2U-F76DjHg')
            return resp.data.features.map( lugar => ({
                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1]
            }) )


        } catch (error){
            console.log(error)
            return []
            
        }
    }

    async climaLugar(lat, lon){
        try {

            // Instancia axios.create()
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: { ...this.paramsWeather, lat, lon}
            })

            // resp.data
            const resp = await instance.get();

            const { weather, main } = resp.data
        
            return {
                desc: weather[0].description,
                min: main.temp_min,
                max: main.temp_max,
                temp: main.temp
            }

            
        } catch (error) {
            console.log(error)
        }
    }

    agregarHistorial(  lugar = '' ){

        // TOOD: prevenir duplicados
        if ( this.historial.includes( lugar.toLocaleLowerCase() ) ){
            return
        }

        this.historial.unshift( lugar.toLocaleLowerCase() )

        // Grabar en DB
        this.guardarBD()

    }

    guardarBD() {

        const payload = {
            historial: this.historial
        }

        fs.writeFileSync( this.dbPath, JSON.stringify( payload ))
    }

    leerDB() {

        if( !fs.existsSync( this.dbPath )){
            return
        }

        this.historial = this.historial.splice(0,5)

        const info = fs.readFileSync( this.dbPath, { encoding: 'utf-8' })
        const  { historial } = JSON.parse( info )

        this.historial = historial 
    }
}

module.exports = Busquedas;