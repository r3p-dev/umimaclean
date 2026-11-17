# Writes CREATE TABLE + INSERT statements for one service-area GeoJSON file into the given table.
import json, sys
source, table, target = sys.argv[1], sys.argv[2], sys.argv[3]
features = json.load(open(source))["features"]
with open(target, "w") as out:
    out.write(f"CREATE TABLE {table} (code text PRIMARY KEY, name text, city text, geom geometry(MultiPolygon, 4326));\n")
    for feature in features:
        p = feature["properties"]
        geometry = json.dumps(feature["geometry"]).replace("'", "''")
        out.write(f"INSERT INTO {table} VALUES ('{p['code']}', '{p['name'].replace(chr(39), chr(39)*2)}', '{p['city']}', ST_Multi(ST_SetSRID(ST_GeomFromGeoJSON('{geometry}'), 4326)));\n")
print(table, len(features), "features")
