# Respuestas de la Parte 1

## 1. ¿Qué hace `??` en `req.body.titulo ?? tarea.titulo`? ¿Qué pasaría con `||` si envías `"completada": false`?

`??` (*nullish coalescing*) devuelve el valor de la izquierda **salvo que sea `null` o `undefined`**; en ese caso devuelve el de la derecha. Sirve para decir: "si el cliente no envió el campo, conserva el valor actual".

`||` en cambio devuelve el de la derecha si el de la izquierda es **cualquier valor falso** (`false`, `0`, `''`, `null`, `undefined`). Con `"completada": false`:

```js
false ?? tarea.completada   // → false   ✅ se guarda lo que envió el cliente
false || tarea.completada   // → true    ❌ si la tarea estaba completada, nunca se puede desmarcar
```

Por eso en el `PUT` usamos `??`: con `||` sería imposible marcar una tarea como **no** completada.

## 2. ¿Por qué `DELETE` responde `204` y no `200`? ¿Por qué `res.status(204).send()` no lleva JSON?

`204 No Content` significa "la operación salió bien y **no hay nada que devolver**". Después de borrar una tarea no hay recurso que mostrar, así que `204` describe mejor el resultado que `200 OK`.

Por definición del protocolo HTTP, una respuesta `204` **no puede tener cuerpo**. Si se le pasa JSON, Express lo descarta igual, por eso se usa `.send()` vacío.

## 3. ¿Qué hace `splice(indice, 1)`?

Modifica el arreglo original: a partir de la posición `indice` **elimina 1 elemento**. Así se quita la tarea del arreglo sin crear uno nuevo.

```js
const letras = ['a', 'b', 'c'];
letras.splice(1, 1);  // letras ahora es ['a', 'c']
```

Si `indice` fuera `-1` (no se encontró), `splice(-1, 1)` borraría **el último** elemento. Por eso primero se revisa `if (indice === -1)` y se responde `404`.

## 4. ¿En qué se diferencian `PUT` y `PATCH`?

- **`PUT`** reemplaza el recurso: en teoría el cliente envía la representación **completa** del recurso.
- **`PATCH`** hace una actualización **parcial**: el cliente envía solo los campos que cambian.

En esta API el `PUT` acepta cambios parciales (solo actualiza los campos que llegan), que en la práctica es lo que muchas APIs hacen. Un `PATCH /tareas/:id/completar` sería todavía más específico: una sola acción, sin body.

## 5. ¿Por qué `Number(req.params.id)` y no `parseInt(req.params.id)`?

`parseInt` lee dígitos **hasta encontrar algo que no sea número** y descarta el resto; `Number` convierte el texto **completo** o devuelve `NaN`.

```js
parseInt('1abc')  // → 1    ❌  DELETE /tareas/1abc borraría la tarea 1
Number('1abc')    // → NaN  ✅  no coincide con ningún id → 404
```

Con `Number`, un id inválido nunca se confunde con uno válido. Lo verifiqué en el `api.http` con `DELETE /tareas/1abc`, que responde `404`.
