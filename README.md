# Sitio web educativo · UNIFSLB

Página web educativa sobre la Universidad Nacional Intercultural Fabiola Salazar Leguía de Bagua.

- **Autor:** Juan Roberto
- **Curso / docente:** _(completar)_
- **Año:** 2026
- **Enlace publicado:** _(pegar aquí el enlace de GitHub Pages o Netlify)_

## Estructura
```
index.html      Página principal (inicio, identidad, noticias)
contacto.html   Canales de contacto
style.css       Estilos (variables, modo oscuro, responsive)
script.js       Saludo, tema oscuro, menú móvil, filtros, visor de imágenes con flechas
imagenes/       Recursos gráficos
```

## Cómo publicar (GitHub Pages)
1. Crear un repositorio y subir todo el contenido de esta carpeta.
2. En *Settings → Pages*, elegir la rama `main` y la carpeta `/ (root)`.
3. Copiar el enlace generado y pegarlo arriba.

## Imágenes
Todas están en `imagenes/` en formato WebP, en dos tamaños (640 px para celular y 1070 px para laptop) mediante `srcset`.
Se recortó la barra de marca inferior de las fotos para que encuadren mejor; el punto de enfoque de cada tarjeta se ajusta con `--enfoque` en `index.html`.
`hero.webp` se generó desde una imagen pequeña: si consigues una versión más grande (1600 px o más), reemplázala para mayor nitidez.
Fuente: página oficial de la UNIFSLB en Facebook.

## Accesibilidad y validación
Idioma declarado, texto alternativo en imágenes, enlace "Saltar al contenido", foco visible, navegación por teclado,
contraste mínimo 4.5:1 y respeto a `prefers-reduced-motion`. Validar en https://validator.w3.org/ antes de entregar.
