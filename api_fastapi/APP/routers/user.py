from fastapi import APIRouter, HTTPException
from APP.BD import get_conexion

#vamos a crear la variable para las rutas:
router = APIRouter(
    prefix="/usuarios",
    tags=["Usuarios"]
)

#endpoints: GET, GET, POST, PUT, DELETE, PATCH
@router.get("/")
def obtener_usuarios(): #Usuarios en general
    try:
        cone = get_conexion()
        cursor = cone.cursor()
        cursor.execute("SELECT rut,nombre, apellido,correo, contra, telefono, tipo FROM USUARIOS")
        usuarios = []
        for rut, nombre, apellido, email, contra, telefono, tipo in cursor:
            usuarios.append({
                "rut": rut,
                "nombre": nombre,
                "apellido": apellido,
                "correo": email,
                "contra": contra,
                "telefono": telefono,
                "tipo": tipo
            })
        cursor.close()
        cone.close()
        return usuarios
    except Exception as ex:
        raise HTTPException(status_code=500, detail=str(ex))

@router.get("/{rut_buscar}")#usuario por rut
def obtener_usuario(rut_buscar: str):
    try:
        cone = get_conexion()
        cursor = cone.cursor()
        cursor.execute("SELECT rut,nombre, apellido,correo, contra, telefono, tipo FROM USUARIOS WHERE rut = :rut"
                       ,{"rut": rut_buscar})
        usuario = cursor.fetchone()
        cursor.close()
        cone.close()
        if not usuario:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        return {
            "rut": rut_buscar,
            "nombre": usuario[1],
            "apellido": usuario[2],
            "correo": usuario[3],
            "contra": usuario[4],
            "telefono": usuario[5],
            "tipo": usuario[6]
        }
    except Exception as ex:
        raise HTTPException(status_code=500, detail=str(ex))
    
@router.get("/get/{correo_buscar}")#usuario por correo
def obtener_usuario(correo_buscar: str):
    try:
        cone = get_conexion()
        cursor = cone.cursor()
        cursor.execute("SELECT rut,nombre, apellido,correo, contra, telefono FROM USUARIOS WHERE correo = :rut"
                       ,{"rut": correo_buscar})
        usuario = cursor.fetchone()
        cursor.close()
        cone.close()
        if not usuario:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        return {
            "rut": usuario[0],
            "nombre": usuario[1],
            "apellido": usuario[2],
            "correo": correo_buscar,
            "contra": usuario[4],
            "telefono": usuario[5],
            "tipo": usuario[6]
        }
    except Exception as ex:
        raise HTTPException(status_code=500, detail=str(ex))
    
@router.post("/")#añadir usuarios
def agregar_usuario(rut:str, nombre:str, email:str, apellido:str, contra:str, cell:str, tipo:bool):
    try:
        cone = get_conexion()
        cursor = cone.cursor()
        cursor.execute("""
            INSERT INTO Usuarios
            VALUES(:rut,:nombre, :apellido,:correo, :contra, :telefono, :tipo)
        """,{"rut":rut, "nombre":nombre, "apellido":apellido, "correo": email, "contra":contra, "telefono":cell, "tipo":tipo})
        cone.commit()
        cursor.close()
        cone.close()
        return {"mensaje": "Alumno agregado con éxito"}
    except Exception as ex:
        raise HTTPException(status_code=500, detail=str(ex))

@router.put("/{rut_actualizar}")
def actualizar_usuario(rut_actualizar:int, nombre:str, email:str, apellido: str, contra:str, telefono:str, tipo:bool):
    try:
        cone = get_conexion()
        cursor = cone.cursor()
        cursor.execute("""
                UPDATE Usuarios
                SET nombre = :nombre, 
                    apellido = :apellido
                    email = :correo
                    contra = :contra
                    telefono = :telefono
                    tipo = :tipo
                WHERE rut = :rut
        """, {"nombre":nombre, "apellido":apellido, "email":email, "contra":contra, "telefono":telefono, "rut":rut_actualizar, "tipo":tipo})
        if cursor.rowcount==0:
            cursor.close()
            cone.close()
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        cone.commit()
        cursor.close()
        cone.close()
        return {"mensaje": "Usuario actualizado con éxito"}
    except Exception as ex:
        raise HTTPException(status_code=500, detail=str(ex))

@router.delete("/{rut_eliminar}")
def eliminar_usuario(rut_eliminar: int):
    try:
        cone = get_conexion()
        cursor = cone.cursor()
        cursor.execute("DELETE FROM Usuarios WHERE rut = :rut"
                       ,{"rut": rut_eliminar})
        if cursor.rowcount==0:
            cursor.close()
            cone.close()
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        cone.commit()
        cursor.close()
        cone.close()
        return {"mensaje": "Usuario eliminado con éxito"}
    except Exception as ex:
        raise HTTPException(status_code=500, detail=str(ex))


from typing import Optional

@router.patch("/{rut_actualizar}")
def actualizar_parcial(rut_actualizar:int, nombre:Optional[str]=None, email:Optional[str]=None):
    try:
        if not nombre and not email:
            raise HTTPException(status_code=400, detail="Debe enviar al menos 1 dato")
        cone = get_conexion()
        cursor = cone.cursor()

        campos = []
        valores = {"rut": rut_actualizar}
        if nombre:
            campos.append("nombre = :nombre")
            valores["nombre"] = nombre
        if email:
            campos.append("email = :email")
            valores["email"] = email

        cursor.execute(f"UPDATE Usuarios SET {', '.join(campos)} WHERE rut = :rut"
                       ,valores)
        if cursor.rowcount==0:
            cursor.close()
            cone.close()
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        cone.commit()
        cursor.close()
        cone.close()        
        return {"mensaje": "Usuario actualizado con éxito"}
    except Exception as ex:
        raise HTTPException(status_code=500, detail=str(ex))
