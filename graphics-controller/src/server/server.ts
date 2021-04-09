
import express from "express";
import path from "path";
import http from "http";

const port: number = 3000;

class App {
    private server: http.Server;
    private port: number;

    constructor(port: number) {
        this.port = port;
        const app = express();
        app.use(express.static(path.join(__dirname, '../client')));
        app.use('/build/three.module.js', express.static(path.join(__dirname, '../../node_modules/three/build/three.module.js')));  // this line allows servers fetching requested resource for clients
        // app.use('/@tensorflow/tfjs', express.static(path.join(__dirname, '../../node_modules/@tensorflow/tfjs/dist/tf.js')));
        
        this.server = new http.Server(app);
    }

    public Start() {
        this.server.listen(this.port, () => {
            console.log(`Server listening on port ${this.port}.`);
        });
    }
}

new App(port).Start();