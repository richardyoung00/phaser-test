import Peer from 'peerjs';

export default class Connection {
    constructor() {
        this.isHosting = null
        this.guestConnections = {}
        this.hostConnection = null
        this.peerId = generateId()
        this.hostId = null

        this.peer = new Peer(this.peerId, {
            host: 'richard-peerjs-server.herokuapp.com',
            port: 443,
            path: '/',
            secure: true
        });

        this.peer.on('open', id => {
            this.peerId = id
            console.log('Connection to server established. ID is: ' + id);
        });

        this.peer.on('error', err => {
            console.log('Error1: ', err);
            console.log('reconnecting');
            // todo reconnect
            this.peer.disconnect()
            this.peer.reconnect()
        });
    }

    async beginHosting() {
        console.error("hosting")
        this.isHosting = true
        this.hostId = this.peerId
        this.peer.on('connection', async (connection) => {
            this.guestConnections[connection.peer] = connection

            connection.send("hello from host")

            console.log('Connecting to peer ' + connection.peer);
            await this.setupConnectionHandlers(connection)
            //todo handle connection close

            if (this.onGuestConnected) {
                this.onGuestConnected(connection.peer, connection.metadata)
            }
        });
    }

    async connectToHost(hostId, metadata) {
        this.isHosting = false
        console.log("connecting to " + hostId)
        this.hostConnection = this.peer.connect(hostId, {metadata});

        this.hostConnection.send("hello from guest")
        this.hostId = this.hostConnection.peer
        console.log("waiting for connection...")
        await this.setupConnectionHandlers(this.hostConnection)
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

    sendToAllGuests(data) {
        if (!this.isHosting) {
            throw new Error("Cannot send data to guest if you are not the host")
        }
        for (let peerId of Object.keys(this.guestConnections)) {
            if (this.guestConnections[peerId].open) {
                this.guestConnections[peerId].send(data);
            }

        }

    }

    async ensureConnectionOpen(conn) {
        return new Promise((resolve, reject) => {
            if (conn.open) {
                resolve()
            }
            console.log(conn)
            conn.on('open', function () {
                console.log("Connection open")
                resolve()
            });

            conn.on('error', function (error) {
                console.error('Connection error', error);
                reject()
            });

            this.peer.on('error', err => {
                console.error(err);
                reject()
            });
        })
    }

    async setupConnectionHandlers(conn) {
        await this.ensureConnectionOpen(conn)

        conn.on('data', (data) => {
            console.log(data)
            if (this.onMessage) {
                this.onMessage(data)
            }
        });



        conn.on('close', () => {
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

