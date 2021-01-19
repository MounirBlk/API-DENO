import {Context, send} from "https://deno.land/x/oak/mod.ts"

export const staticFileMiddleware = async (ctx: Context, next: Function) => {
    const path = `${Deno.cwd()}/public${ctx.request.url.pathname}`;
    if (await fileExists(path) || (ctx.request.url.pathname === '' || ctx.request.url.pathname ==='/')) {
        await send(ctx, ctx.request.url.pathname, {
            root: `${Deno.cwd()}/public`,
            index: "index.html"
        })
    } else if(ctx.response.status >= 400){
        const pathErrorFile: string = `${Deno.cwd()}/public/error.html`;
        const imageBuf: any = await Deno.readFile(pathErrorFile);
        ctx.response.body = imageBuf;
        ctx.response.headers.set('Content-Type', 'text/html');        
    }
    await next();
}

async function fileExists(path: string) {
    try {
        const stats = await Deno.lstat(path);
        return stats && stats.isFile;
    } catch(e) {
        if (e && e instanceof Deno.errors.NotFound) {
            return false;
        } else {
            throw e;
        }
    }
}