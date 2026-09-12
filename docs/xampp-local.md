# Acceso local mediante localhost o IP

La web ya usa rutas relativas y no contiene una IP o host fijo. Para una URL con subruta, cree `apps/web/.env.local` a partir del ejemplo con `NEXT_PUBLIC_BASE_PATH=/bodas` y ejecute Next en el puerto 3000; Nest se mantiene en 3001.

Para exponerlo con Apache/XAMPP como `http://localhost/bodas` o `http://192.168.1.130/bodas`, habilite `proxy_module` y `proxy_http_module` en `C:\xampp\apache\conf\httpd.conf` y añada este bloque al final:

```apache
ProxyPass        /bodas http://127.0.0.1:3000/bodas
ProxyPassReverse /bodas http://127.0.0.1:3000/bodas
```

Después reinicie Apache y arranque: `npm run dev:api` y `npm run dev:web`. La IP funciona para dispositivos en la misma red mientras el firewall permita Apache (puerto 80). No se debe usar una IP privada como URL de producción.
