import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import routes from './routes/routes.js'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import { authMiddleware } from './middlewares/auth.js'

const app = new Hono()

// middleware
app.use('*',cors({
    origin: ['http://103.217.145.5'], // atau '*', jika ingin mengizinkan semua asal
    allowMethods: ['GET,HEAD,PUT,PATCH,POST,DELETE'],
    allowHeaders: ['Content-Type', 'Authorization'],
  }
));
app.use(secureHeaders());
if(process.env.HONO_ENV !== 'production'){
  app.use(logger());
}

app.use(prettyJSON( { space: 4}));

// protect bagian ini
app.use('/v1/data/*', authMiddleware);

app.route('/v1', routes)

const port = 3001
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
