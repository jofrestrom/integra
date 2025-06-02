import oracledb

def get_conexion():
    conexion = oracledb.connect(
        user = "api_fast",
        password = "api_fast",
        dsn = "localhost:1521/orcl"
        
    )
    return conexion