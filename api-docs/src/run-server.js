import app from './app';
import cfg from './config/config';

const startup = async () => {
    app.listen(cfg.HTTP_PORT, () => console.log(`API Docs Server listening on port ${cfg.HTTP_PORT}.`))
}

console.log('API Docs Server started at ' + new Date());
startup();
