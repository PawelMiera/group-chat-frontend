const production = 'https://mhosting.ipv64.net/groopieApi';
const development = 'http://localhost:8000/groopieApi';

const production_front = 'https://mhosting.ipv64.net/groopie';
const development_front = 'http://localhost:5173';

const production_ws = 'wss://mhosting.ipv64.net/groopieWs/';
const development_ws = 'ws://localhost:8000/groopieWs/';

export const ApiUrl = process.env.NODE_ENV === 'development' ? development : production;
export const FrontendUrl = process.env.NODE_ENV === 'development' ? development_front : production_front;
export const WsUrl = process.env.NODE_ENV === 'development' ? development_ws : production_ws;