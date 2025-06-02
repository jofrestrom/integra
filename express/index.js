const express = require('express');
const oracledb = require('oracledb');
const cors = require('cors');
const app = express();

const corsOptions = {
  origin: 'http://127.0.0.1:5502', // Permitir solo este origen
  methods: 'GET,POST, PUT', // Métodos permitidos
  allowedHeaders: 'Content-Type,Authorization' // Encabezados permitidos
};

app.use(cors(corsOptions));

const port = 3000;
const dbConfig = {
    user: 'apiexpress',
    password: 'apiexpress',
    connectString: 'localhost:1521/orcl'
};
const API_KEY = 'ElFierrazo';
function validarApiKey(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== API_KEY) {
        return res.status(401).json({ error: "API KEY incorrecta o no entregada" });
    }
    next();
}
app.use(express.json());
app.get('/', (req, res) => {
    res.status(200).json({ "mensaje": "Hola express 2" });
});
app.get('/productos', async (req, res) => {
    let cone;
    try {
        cone = await oracledb.getConnection(dbConfig);
        const result = await cone.execute("SELECT * FROM productos");
        res.json(result.rows.map(row => ({
            id_p: row[0],
            nombre: row[1],
            marca: row[2],
            precio: row[3],
            descripcion: row[4],
            tipo: row[5],
            stock: row[6]
        })));
    } catch (ex) {
        res.status(500).json({ error: ex.message });
    } finally {
        if (cone) await cone.close();
    }
});
app.get('/boleta', validarApiKey, async (req, res) => {
    let cone;
    try {
        cone = await oracledb.getConnection(dbConfig);
        const result = await cone.execute("SELECT * FROM boleta");
        res.json(result.rows.map(row => ({
            id_boleta: row[0],
            rut: row[1],
            id_produc: row[2],
            descripcion_produc: row[3],
            feha_vent: row[4],
            hora_ven: row[5],
            precio_total: row[6]
        })));
    } catch (ex) {
        res.status(500).json({ error: ex.message });
    } finally {
        if (cone) await cone.close();
    }
});
// Obtener producto por ID
app.get('/Productos/:id_p', async (req, res) => {
    let cone;
    const id_p = parseInt(req.params.id_p);
    try {
        cone = await oracledb.getConnection(dbConfig);
        const result = await cone.execute(
            'SELECT id_p, nombre, marca, precio, descripcion, tipo, stock, imagen FROM productos WHERE id_p = :id_p',
            [id_p],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        if (result.rows.length === 0) {
            res.status(404).json({ mensaje: "Producto no encontrado" });
        } else {
            const row = result.rows[0];
            const imagenBase64 = row.IMAGEN ? Buffer.from(row.IMAGEN).toString('base64') : null;
            res.json({
                id_p: row.ID_P,
                nombre: row.NOMBRE,
                marca: row.MARCA,
                precio: row.PRECIO,
                descripcion: row.DESCRIPCION,
                tipo: row.TIPO,
                stock: row.STOCK,
                imagen: imagenBase64
            });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (cone) cone.close();
    }
});
app.get('/ventas/por-mes', async (req, res) => {
  let cone;
  try {
    cone = await oracledb.getConnection(dbConfig);
    const result = await cone.execute(`
      SELECT TO_CHAR(fecha_vent, 'MM-YYYY') AS MES, SUM(precio_total) AS TOTAL
      FROM boleta
      GROUP BY TO_CHAR(fecha_vent, 'MM-YYYY')
      ORDER BY MES
    `);
    res.json(result.rows.map(row => ({
      mes: row[0],
      total: row[1]
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (cone) cone.close();
  }
});


app.get('/solicitudes', async (req, res) => {
  let cone;
  try {
    cone = await oracledb.getConnection(dbConfig);
    const result = await cone.execute("SELECT * FROM solicitudes_stock");
    res.json(result.rows.map(r => ({
      id: r[0],
      producto: r[1],
      vendedor: r[2],
      cantidad: r[3],
      estado: r[4]
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (cone) cone.close();
  }
});
app.get('/solicitudes/v', async (req, res) => {
  const vendedor = req.query.vendedor;
  let cone;
  try {
    cone = await oracledb.getConnection(dbConfig);
    const result = await cone.execute(`
      SELECT * FROM solicitudes_stock WHERE vendedor = :vendedor
    `, [vendedor]);
    res.json(result.rows.map(r => ({
      id: r[0],
      producto: r[1],
      vendedor: r[2],
      cantidad: r[3],
      estado: r[4]
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (cone) cone.close();
  }
});


app.put('/solicitudes/aprobar/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  let cone;
  try {
    cone = await oracledb.getConnection(dbConfig);

    await cone.execute(`
      UPDATE solicitudes_stock SET estado = 'Aprobado' WHERE id = :id
    `, [id]);

    // Opcional: actualizar stock real aquí

    await cone.commit();
    res.json({ mensaje: "Solicitud aprobada" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (cone) cone.close();
  }
});

app.put('/solicitudes/rechazar/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  let cone;
  try {
    cone = await oracledb.getConnection(dbConfig);

    await cone.execute(`
      UPDATE solicitudes_stock SET estado = 'Rechazado' WHERE id = :id
    `, [id]);

    await cone.commit();
    res.json({ mensaje: "Solicitud rechazada" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (cone) cone.close();
  }
});

app.post('/solicitud/stock', async (req, res) => {
  const { producto, vendedor, cantidad } = req.body;
  let cone;
  try {
    cone = await oracledb.getConnection(dbConfig);
    await cone.execute(`
      INSERT INTO solicitudes_stock (id, producto, vendedor, cantidad, estado)
      VALUES (solicitudes_seq.NEXTVAL, :producto, :vendedor, :cantidad, 'Pendiente')
    `, { producto, vendedor, cantidad }, { autoCommit: true });
    res.status(201).json({ mensaje: "Solicitud registrada" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (cone) cone.close();
  }
});


//obtener producto por nombre
app.get('/Productos/n/:nombre_p/', async (req, res) => {
    let cone;
    const nombre_p = String(req.params.nombre_p);
    try {
        cone = await oracledb.getConnection(dbConfig);
        const result = await cone.execute(
            'SELECT * FROM productos WHERE lower(nombre) LIKE lower(:nombre_p)', [`${nombre_p}%`]
        );
        if (result.rows.length === 0) {
            res.status(404).json({ mensaje: "Producto no encontrado" });
        } else {
            // Si deseas devolver todos los productos que coinciden, puedes hacer un bucle
            const productos = result.rows.map(row => ({
                id_p: row[0],
                nombre: row[1],
                marca: row[2],
                precio: row[3],
                descripcion: row[4],
                tipo: row[5],
                stock: row[6]
            }));
            res.json(productos); // Devuelve todos los productos que coinciden
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (cone) cone.close();
    }
});


// Obtener boleta por ID
app.get('/boleta/:id', async (req, res) => {
    let cone;
    const id_b = parseInt(req.params.id);
    try {
        cone = await oracledb.getConnection(dbConfig);
        const result = await cone.execute(
            'SELECT * FROM boleta WHERE id_boleta = :id_b', [id_b]
        );
        if (result.rows.length === 0) {
            res.status(404).json({ mensaje: "Boleta no encontrada" });
        } else {
            const row = result.rows[0];
            res.json({
                id_boleta: row[0],
                rut: row[1],
                id_produc: row[2],
                descripcion_produc: row[3],
                feha_vent: row[4],
                hora_ven: row[5],
                precio_total: row[6]
            });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (cone) cone.close();
    }
});

// Actualizar producto
app.put('/Productos/update/:id_p', async (req, res) => {
    let cone;
    const id_p = parseInt(req.params.id_p);
    const { nombre, marca, precio, descripcion, tipo, stock } = req.body;
    try {
        cone = await oracledb.getConnection(dbConfig);
        const result = await cone.execute(
            `UPDATE productos
            SET nombre = :nombre, marca = :marca, precio = :precio, descripcion = :descripcion, tipo = :tipo, stock = :stock
            WHERE id_p = :id_p`,
            { id_p, nombre, marca, precio, descripcion, tipo, stock },
            { autoCommit: true }
        );
        if (result.rowsAffected === 0) {
            res.status(404).json({ mensaje: "Producto no encontrado" });
        } else {
            res.json({ mensaje: 'Producto actualizado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (cone) cone.close();
    }
});

// Añadir producto
app.post('/productoS/add/', async (req, res) => {
    let cone;
    const { id_p, nombre, marca, precio, descripcion, tipo, stock, imagen } = req.body;

    try {
        cone = await oracledb.getConnection(dbConfig);

        // Convertir base64 a Buffer si se recibe así
        let bufferImagen = null;
        if (imagen) {
            bufferImagen = Buffer.from(imagen, 'base64'); // asume que imagen es un base64 string
        }

        await cone.execute(
            `INSERT INTO productos
             (id_p, nombre, marca, precio, descripcion, tipo, stock, imagen)
             VALUES(:id_p, :nombre, :marca, :precio, :descripcion, :tipo, :stock, :imagen)`,
            { id_p, nombre, marca, precio, descripcion, tipo, stock, imagen: bufferImagen },
            { autoCommit: true }
        );

        res.status(201).json({ mensaje: "Producto creado" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (cone) cone.close();
    }
});


// Añadir boleta
app.post('/boleta/add', async (req, res) => {
    let cone;
    const { id_boleta, rut, id_produc, descripcion_produc, fecha_vent, hora_ven, precio_total } = req.body;
    try {
        cone = await oracledb.getConnection(dbConfig);
        await cone.execute(
            `INSERT INTO boleta
             VALUES(:id_boleta, :rut, :id_produc, :descripcion_produc, :fecha_vent, :hora_ven, :precio_total)`,
            { id_boleta, rut, id_produc, descripcion_produc, fecha_vent, hora_ven, precio_total },
            { autoCommit: true }
        );
        res.status(201).json({ mensaje: "Boleta creada" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (cone) cone.close();
    }
});

// Eliminar producto
app.delete('/productos/delete/:id_p', async (req, res) => {
    let cone;
    const id_p = parseInt(req.params.id_p);
    try {
        cone = await oracledb.getConnection(dbConfig);
        const result = await cone.execute(
            `DELETE FROM productos
            WHERE id_p = :id_p`,
            [id_p],
            { autoCommit: true }
        );
        if (result.rowsAffected === 0) {
            res.status(404).json({ mensaje: "Producto no encontrado" });
        } else {
            res.json({ mensaje: "Producto eliminado" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (cone) cone.close();
    }
});

app.listen(port, () => {
    console.log(`API escuchando en puerto ${port}`);
});
