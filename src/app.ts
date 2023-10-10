import Fastify from 'fastify';
import fastifyHttpProxy from '@fastify/http-proxy';
import dotenv from 'dotenv';
dotenv.config();

const app = Fastify();

app.register(fastifyHttpProxy, {
    upstream: 'https://storage.googleapis.com/img.hideo54.com',
});

app.listen({
    host: '::',
    port: Number(process.env.PORT) || 8080,
});
