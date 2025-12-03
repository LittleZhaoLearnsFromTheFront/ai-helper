import 'dotenv/config';
import express from "express"
import Config from "./lib/Config.ts"
import Logger from "./lib/Logger.ts";
import aiRoutes from "./routes/ai.ts";
import cors from 'cors'

const logger = Logger.of('express');
const app = express()

// 跨域
app.use(cors({
    origin: '*', // 允许所有域名访问
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // 允许的请求方法
    allowedHeaders: ['Content-Type', 'X-User'], // 允许的请求头
    credentials: true // 允许携带凭证
}))
// 中间件 - JSON 解析，添加错误处理
app.use(express.json({
    limit: '10mb',
    strict: true
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 健康检查
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!req.headers['x-user']) return res.status(401).json({
        success: false,
        error: 'Unauthorized'
    });
    (req as any)['user'] = req.headers['x-user'];
    next();
})

// AI 路由
app.use('/api/ai', aiRoutes);

// 错误处理中间件（必须在所有路由之后）
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    // 处理 JSON 解析错误（body-parser 的错误）
    if (err instanceof SyntaxError || (err.type === 'entity.parse.failed')) {
        logger?.error({
            error: err.message,
            stack: err.stack,
            type: err.type || 'SyntaxError',
            body: (err as any).body ? String((err as any).body).substring(0, 200) : undefined
        }, 'JSON parse error');

        return res.status(400).json({
            success: false,
            error: 'Invalid JSON format',
            message: err.message || 'JSON parse error',
            details: 'Please check your JSON syntax. Common issues:\n' +
                '1. Use double quotes for property names: {"key": "value"} not {\'key\': \'value\'}\n' +
                '2. Remove trailing commas: {"key": "value"} not {"key": "value",}\n' +
                '3. Ensure all strings are properly quoted\n' +
                '4. Check for unclosed brackets or braces'
        });
    }

    // 处理其他错误
    logger?.error({ error: err.message, stack: err.stack }, 'Unhandled error');
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal server error'
    });
});

// 启动服务器
app.listen(Config.server.port, () => {
    logger?.info(`${Config.server.port}端口已启用`)
    logger?.info(`健康检查: /health`)
    logger?.info(`AI API: /api/ai`)
})
