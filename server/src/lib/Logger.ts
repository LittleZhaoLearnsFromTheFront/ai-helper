import Pino from 'pino';
import Config from './Config.ts';

const loggers: { [name: string]: Pino.Logger } = {};

export default {
    of(name = 'default', options?: Pino.LoggerOptions) {
        if (!loggers[name]) {
            loggers[name] = Pino({
                level: Config.logger.level,
                ...options
            })
        }
        return loggers[name];
    }
}