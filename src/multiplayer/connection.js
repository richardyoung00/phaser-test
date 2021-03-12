import Peer from 'peerjs';

export default class Connection {
    constructor() {
        this.isHosting = null
        this.guestConnections = {}
        this.hostConnection = null
        this.peerId = generateId()
        this.hostId = null

        this.peer = new Peer(this.peerId, {
            host: '192.168.0.126',
            port: 9000,
            path: '/myapp'
        });

        this.peer.on('open', id => {
            this.peerId = id
            console.log('Connection to server established. ID is: ' + id);
        });

        this.peer.on('error', err => {
            console.log('Error: ', err);
        });
    }

    async beginHosting() {
        this.isHosting = true
        this.hostId = this.peerId
        this.peer.on('connection', async (connection) => {
            this.guestConnections[connection.peer] = connection

            console.log('A guest has joined');
            await this.setupConnectionHandlers(connection)
            //todo handle connection close

            if (this.onGuestConnected) {
                this.onGuestConnected(connection.peer, connection.metadata)
            }
        });
    }

    async connectToHost(peerId, metadata) {
        this.isHosting = false
        console.log("connecting to " + peerId)
        this.hostConnection = this.peer.connect(peerId, {metadata});
        this.hostId = this.hostConnection.peer
        console.log("done")
        await this.setupConnectionHandlers()
        //todo handle connection close
        if (this.onConnectedToHost) {
            this.onConnectedToHost(this.hostConnection.peer, this.hostConnection.metadata)
        }
    }

    sendToHost(data) {
        if (this.isHosting) {
            throw new Error("Cannot send data to host if you are hosting")
        }
        this.hostConnection.send(data);
    }

    sendToGuest(peerId, data) {
        if (!this.isHosting) {
            throw new Error("Cannot send data to guest if you are not the host")
        }
        this.guestConnections[peerId].send(data);
    }

    async setupConnectionHandlers(conn) {
        await new Promise((resolve) => {
            conn.on('open', function () {
                console.log("Connection open")
                resolve()
            });
        })

        conn.on('data', function (data) {
            console.log('Received', data);
        });

        conn.on('error', function (error) {
            console.error('Connection error', error);
        });

        conn.on('close', function () {
            console.error('Connection closed');
        });

        // this.conn.send('Hello from ' + this.peer.id);
    }

}

function generateId(length = 6) {
    let result = '';
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

