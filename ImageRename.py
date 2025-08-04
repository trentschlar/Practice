import os
import arcpy
import csv

# --- CONFIG ---
photo_folder = r"E:\MapFiles\Trails\UniversalAccess\CharacteristicPhotosSegmentID"
fc_path = r"E:\Database\DatabaseConnections\OSMP\OSA@OSMPGIS_OSMPProd.sde\OsmpProd.OSMP.trailTrailsData\OsmpProd.OSMP.trailTrails"
output_log = os.path.join(photo_folder, "rename_log.csv")

# --- STEP 1: Build RID to SegmentID lookup from the feature class ---
print("Building RID to SegmentID lookup...")
rid_to_segmentid = {}
fields = ["RID", "SEGMENTID"]

with arcpy.da.SearchCursor(fc_path, fields) as cursor:
    for row in cursor:
        rid = str(row[0]).strip()
        segmentid = str(row[1]).strip()
        if rid and segmentid:
            rid_to_segmentid[rid] = segmentid

print(f"Found {len(rid_to_segmentid)} RID → SegmentID mappings.")

# --- STEP 2: Process files and rename ---
print("Renaming files...")
renamed_files = []
skipped_files = []

for filename in os.listdir(photo_folder):
    if not filename.lower().endswith("_character.jpg"):
        continue
    
    rid = filename.split("_")[0].strip()
    old_path = os.path.join(photo_folder, filename)

    if rid in rid_to_segmentid:
        segmentid = rid_to_segmentid[rid]
        new_filename = f"{segmentid}_Character.jpg"
        new_path = os.path.join(photo_folder, new_filename)

        # Rename file
        os.rename(old_path, new_path)
        renamed_files.append((filename, new_filename))
    else:
        skipped_files.append(filename)

# --- STEP 3: Write log ---
print(f"Writing log to {output_log}...")
with open(output_log, "w", newline="") as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(["Old Filename", "New Filename"])
    for old_name, new_name in renamed_files:
        writer.writerow([old_name, new_name])

print(f"✔ Renamed {len(renamed_files)} files.")
if skipped_files:
    print(f"⚠ Skipped {len(skipped_files)} files with unmatched RIDs:")
    for file in skipped_files:
        print(f"  - {file}")
else:
    print("No files were skipped.")

print("Done.")
