const production = 'https://mhosting.ipv64.net/api';
const development = 'http://192.168.0.107:8000/api';

const production_front = 'https://mhosting.ipv64.net/api';
const development_front = 'http://192.168.0.107:5173';

const production_ws = 'https://mhosting.ipv64.net/api';
const development_ws = 'ws://192.168.0.107:8000/api/ws/chat';

export const ApiUrl = process.env.NODE_ENV === 'development' ? development : production;
export const FrontendUrl = process.env.NODE_ENV === 'development' ? development_front : production_front;
export const WsUrl = process.env.NODE_ENV === 'development' ? development_ws : production_ws;