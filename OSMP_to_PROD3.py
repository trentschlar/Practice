import arcpy
import datetime

# === CONFIGURATION ===
arcpy.env.overwriteOutput = True

# Source database
source_gdb = r"E:\Database\DatabaseConnections\OSMP\OSA@OSMPGIS_OSMPProd.sde"
source_trails = f"{source_gdb}\\OsmpProd.OSMP.trailTrailsData\\OsmpProd.OSMP.trailTrails"

# DEV output (testing target)
dev_gdb_trails = r"Y:\Catalog\Catalog.gdb\TrailsOSMP_"
dev_gdb_closures = r"Y:\Catalog\Catalog.gdb\TrailClosures"

# Backup location
backup_gdb = r"Y:\Catalog\Catalog.gdb"  # Update this!
date_str = datetime.datetime.now().strftime("%Y%m%d")
backup_trails = f"{backup_gdb}\\TrailsOSMP_Backup_{date_str}"
backup_closures = f"{backup_gdb}\\TrailClosures_Backup_{date_str}"

# Definition query for active trails
def_query = ("CURRENT_TIMESTAMP BETWEEN DateFrom AND DateTo "
             "AND TrailName <> 'Network Connector Segment' AND Display = 'Yes'")

# === BACKUP STEP ===
print("Backing up DEV feature class and table...")
arcpy.CopyFeatures_management(dev_gdb_trails, backup_trails)
arcpy.CopyRows_management(dev_gdb_closures, backup_closures)

# === TRAILS UPDATE ===
print("Filtering source trails...")
filtered_source = "filtered_source_trails"
arcpy.MakeFeatureLayer_management(source_trails, filtered_source, def_query)

# === TRAILS UPDATE ===
print("Filtering source trails...")
filtered_source = "filtered_source_trails"
arcpy.MakeFeatureLayer_management(source_trails, filtered_source, def_query)

print("Updating TrailsOSMP feature class in DEV...")
arcpy.MakeFeatureLayer_management(dev_gdb_trails, "trails_view")
arcpy.DeleteFeatures_management("trails_view")

arcpy.Append_management(
    inputs=filtered_source,
    target=dev_gdb_trails,
    schema_type="NO_TEST"
)

# === TRAIL CLOSURES SYNC ===
print("Syncing TrailClosures table in DEV...")

# Apply definition query to source trails for closure logic
filtered_source_for_closures = "filtered_source_for_closures"
arcpy.MakeFeatureLayer_management(source_trails, filtered_source_for_closures, def_query)

# Build SEGMENTID → RID lookup from filtered source
source_dict = {}
with arcpy.da.SearchCursor(filtered_source_for_closures, ["SEGMENTID", "RID"]) as cursor:
    for segid, rid in cursor:
        if segid:  # skip NULLs
            source_dict[segid] = rid

# Load all existing closures
closure_lookup = {}
duplicates_to_delete = set()
orphans_to_delete = set()

with arcpy.da.SearchCursor(dev_gdb_closures, ["OBJECTID", "SEGMENTID", "RID"]) as cursor:
    for oid, segid, rid in cursor:
        if not segid or segid not in source_dict:
            orphans_to_delete.add(oid)
        else:
            if segid not in closure_lookup:
                closure_lookup[segid] = [(oid, rid)]
            else:
                closure_lookup[segid].append((oid, rid))

# Find duplicate SEGMENTIDs (keep only one)
for segid, records in closure_lookup.items():
    if len(records) > 1:
        sorted_records = sorted(records, key=lambda x: x[0])  # sort by OBJECTID
        for dup in sorted_records[1:]:
            duplicates_to_delete.add(dup[0])

# Prepare inserts and RID updates
closures_to_insert = []
closures_to_update = []

for segid, source_rid in source_dict.items():
    if segid not in closure_lookup:
        closures_to_insert.append((segid, source_rid))
    else:
        oid, existing_rid = sorted(closure_lookup[segid], key=lambda x: x[0])[0]
        if existing_rid != source_rid:
            closures_to_update.append((oid, source_rid))

# Delete orphaned and duplicate rows
oids_to_delete = list(orphans_to_delete.union(duplicates_to_delete))
if oids_to_delete:
    print(f"Deleting {len(oids_to_delete)} orphaned or duplicate TrailClosures...")
    oid_field = arcpy.Describe(dev_gdb_closures).OIDFieldName
    where_clause = f"{oid_field} IN ({','.join(map(str, oids_to_delete))})"
    arcpy.MakeTableView_management(dev_gdb_closures, "closures_to_delete", where_clause)
    arcpy.DeleteRows_management("closures_to_delete")
else:
    print("No orphaned or duplicate TrailClosures to delete.")

# Insert new closures with cleaning
if closures_to_insert:
    print(f"Inserting {len(closures_to_insert)} new TrailClosures (after cleaning)...")

    # Get SEGMENTID max length
    segid_field = arcpy.ListFields(dev_gdb_closures, "SEGMENTID")[0]
    max_len = segid_field.length if segid_field.type == "String" else 255

    with arcpy.da.InsertCursor(dev_gdb_closures, ["SEGMENTID", "RID"]) as cursor:
        for segid, rid in closures_to_insert:
            if segid is None or rid is None:
                continue
            segid = str(segid).strip()
            if len(segid) > max_len:
                print(f"❌ Skipping SEGMENTID too long: {segid}")
                continue
            cursor.insertRow([segid, rid])
else:
    print("No new TrailClosures to insert.")
 # Update RID values that are out of sync
if closures_to_update:
    print(f"Updating {len(closures_to_update)} TrailClosures with corrected RIDs...")
    with arcpy.da.UpdateCursor(dev_gdb_closures, ["OBJECTID", "RID"]) as cursor:
        for row in cursor:
            oid = row[0]
            for target_oid, correct_rid in closures_to_update:
                if oid == target_oid:
                    row[1] = correct_rid
                    cursor.updateRow(row)
                    break
else:
    print("No TrailClosures needed RID updates.")

# === VALIDATION ===
trail_count = int(arcpy.GetCount_management(dev_gdb_trails)[0])
closure_count = int(arcpy.GetCount_management(dev_gdb_closures)[0])
print(f"Record counts — TrailsOSMP: {trail_count}, TrailClosures: {closure_count}")
print("✅ DEV update complete. Validate in Trail Closures app if needed.")
