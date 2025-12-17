import { loadEnv } from './config/env.js';
import app from './server/app.js';

const env = loadEnv();
const port = env.PORT;

app.listen(port, () => {
console.log (`Server running on port ${port}`);
});
