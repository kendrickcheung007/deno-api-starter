import { Hono } from 'https://deno.land/x/hono@v3.3.0/mod.ts'
import { serveStatic } from 'https://deno.land/x/hono@v3.3.0/middleware.ts'

const app = new Hono()

app.get('/', (c) => c.text('Hello Deno!'))

// 静态服务
app.use('/static/*', serveStatic({ root: './' }))

Deno.serve(app.fetch)