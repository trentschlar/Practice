import arcpy
import os

# === USER PARAMETERS ===
out_gdb = r"Y:\Regulatory\Default.gdb"   # Change this to your geodatabase
out_fc = "Layout_Extents"                 # Name of output feature class

# === SETUP ===
aprx = arcpy.mp.ArcGISProject("CURRENT")
arcpy.env.overwriteOutput = True

# Create the feature class in a known SR (WGS84 here, change if desired)
sr = arcpy.SpatialReference(4326)
out_fc_path = os.path.join(out_gdb, out_fc)

if arcpy.Exists(out_fc_path):
    arcpy.Delete_management(out_fc_path)

arcpy.CreateFeatureclass_management(
    out_path=out_gdb,
    out_name=out_fc,
    geometry_type="POLYGON",
    spatial_reference=sr
)

# Add fields
arcpy.AddField_management(out_fc_path, "LayoutName", "TEXT", field_length=100)
arcpy.AddField_management(out_fc_path, "MapFrame", "TEXT", field_length=100)
arcpy.AddField_management(out_fc_path, "MapSR", "TEXT", field_length=100)

# === INSERT EXTENTS ===
with arcpy.da.InsertCursor(out_fc_path, ["SHAPE@", "LayoutName", "MapFrame", "MapSR"]) as cursor:
    for layout in aprx.listLayouts():
        for mapframe in layout.listElements("MAPFRAME_ELEMENT"):
            extent = mapframe.camera.getExtent()

            # Force a valid arcpy.SpatialReference
            raw_sr = mapframe.map.spatialReference
            map_sr = arcpy.SpatialReference(raw_sr.factoryCode)

            # Build polygon
            array = arcpy.Array([
                arcpy.Point(extent.XMin, extent.YMin),
                arcpy.Point(extent.XMin, extent.YMax),
                arcpy.Point(extent.XMax, extent.YMax),
                arcpy.Point(extent.XMax, extent.YMin),
                arcpy.Point(extent.XMin, extent.YMin)
            ])
            polygon = arcpy.Polygon(array, map_sr)

            cursor.insertRow([polygon, layout.name, mapframe.name, map_sr.name])

print(f"✅ Done! Feature class created at: {out_fc_path}")
