const production = 'https://mhosting.ipv64.net/api';
const development = 'http://localhost:8000/api';

const production_front = 'https://mhosting.ipv64.net/api';
const development_front = 'http://localhost:5173';

export const ApiUrl = process.env.NODE_ENV === 'development' ? development : production;
export const FrontendUrl = process.env.NODE_ENV === 'development' ? development_front : production_front;