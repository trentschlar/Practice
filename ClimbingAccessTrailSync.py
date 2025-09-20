import arcpy
import sys
from datetime import datetime

def log_message(message, level="INFO"):
    """Log messages with timestamp."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {level}: {message}")

def check_field_exists(layer_path, field_name):
    """Check if a field exists in the dataset."""
    try:
        field_list = [field.name for field in arcpy.ListFields(layer_path)]
        return field_name in field_list
    except Exception as e:
        log_message(f"Error checking field {field_name}: {str(e)}", "ERROR")
        return False

def main():
    try:
        # === CONFIG ===
        hosted_url = "https://services.arcgis.com/ePKBjXrBZ2vEEgWd/arcgis/rest/services/Designated_Climbing_Access_H/FeatureServer/0"
        osmp_path = r"E:\Database\DatabaseConnections\OSMP\OSA@OSMPGIS_OSMPProd.sde\OsmpProd.OSMP.trailTrailsData\OsmpProd.OSMP.trailTrails"
        wildlife_layer_file = r"E:\Layers\Regulatory\Wildlife Closures - Current.lyrx"

        log_message("Starting Climbing Access Trail Update Process")
        log_message("=" * 60)

        # ============================================================
        # STEP 1: Append missing trails
        # ============================================================
        log_message("STEP 1: Appending missing trails from OSMPProd to hosted dataset")

        definition_query = "DateTo = '2099-12-31 00:00:00' AND TrailType = 'Climbing Access'"
        log_message(f"Using definition query: {definition_query}")

        temp_osmp = "temp_osmp_layer"
        arcpy.MakeFeatureLayer_management(osmp_path, temp_osmp, definition_query)

        osmp_segments = set()
        osmp_trail_data = {}

        if not check_field_exists(temp_osmp, "SegmentID"):
            raise Exception("SegmentID field not found in OSMP source")

        field_names = [field.name for field in arcpy.ListFields(temp_osmp)]

        with arcpy.da.SearchCursor(temp_osmp, field_names) as cursor:
            for row in cursor:
                row_dict = dict(zip(field_names, row))
                segment_id = row_dict["SegmentID"]
                osmp_segments.add(segment_id)
                osmp_trail_data[segment_id] = row_dict

        log_message(f"Found {len(osmp_segments)} climbing access trails in OSMP")

        # Hosted trails
        if not check_field_exists(hosted_url, "SegmentID"):
            raise Exception("SegmentID field not found in hosted service")

        hosted_segments = set()
        with arcpy.da.SearchCursor(hosted_url, ["SegmentID"]) as cursor:
            for row in cursor:
                if row[0] is not None:
                    hosted_segments.add(row[0])

        log_message(f"Found {len(hosted_segments)} trails in hosted service")

        # Find missing
        missing_segments = osmp_segments - hosted_segments
        if missing_segments:
            log_message(f"Found {len(missing_segments)} missing trails to append")

            missing_list = "', '".join(map(str, missing_segments))
            selection_query = f"SegmentID IN ('{missing_list}')"
            arcpy.SelectLayerByAttribute_management(temp_osmp, "NEW_SELECTION", selection_query)
            selected_count = int(arcpy.GetCount_management(temp_osmp).getOutput(0))

            if selected_count > 0:
                arcpy.Append_management(temp_osmp, hosted_url, "NO_TEST")

                if check_field_exists(hosted_url, "STATUS"):
                    with arcpy.da.UpdateCursor(hosted_url, ["SegmentID", "STATUS"]) as cursor:
                        for row in cursor:
                            if row[0] in missing_segments and (row[1] is None or row[1] == ""):
                                row[1] = "Open"
                                cursor.updateRow(row)

                log_message(f"Successfully appended {selected_count} trails with STATUS='Open'")
        else:
            log_message("No missing trails found - hosted dataset is up to date")

        arcpy.Delete_management(temp_osmp)

        # ============================================================
        # STEP 2: Identify extra trails
        # ============================================================
        log_message("=" * 60)
        log_message("STEP 2: Identifying extra trails in hosted dataset")

        extra_trails = []
        has_trail_name = check_field_exists(hosted_url, "TrailName")
        fields = ["SegmentID", "TrailName"] if has_trail_name else ["SegmentID"]

        with arcpy.da.SearchCursor(hosted_url, fields) as cursor:
            for row in cursor:
                segment_id = row[0]
                if segment_id not in osmp_segments:
                    if has_trail_name:
                        trail_name = row[1] if row[1] else "Unknown"
                    else:
                        trail_name = "Unknown"
                    extra_trails.append((segment_id, trail_name))

        if extra_trails:
            log_message(f"Found {len(extra_trails)} extra trails in hosted dataset:")
            for segment_id, trail_name in extra_trails:
                log_message(f"  SegmentID: {segment_id}, Name: {trail_name}")

            log_message("\nCommented deletion code (uncomment to delete extra trails):")
            segment_list = "', '".join([str(t[0]) for t in extra_trails])
            log_message(f"# delete_query = \"SegmentID IN ('{segment_list}')\"")
            log_message("# with arcpy.da.UpdateCursor(hosted_url, ['SegmentID'], delete_query) as cursor:")
            log_message("#     for row in cursor: cursor.deleteRow()")
        else:
            log_message("No extra trails found in hosted dataset")

        # ============================================================
        # STEP 3: Update STATUS based on wildlife closures
        # ============================================================
        log_message("=" * 60)
        log_message("STEP 3: Updating STATUS based on wildlife closures")

        closure_query = "EnactedClosure = 'Yes' AND Archived = 0"
        temp_closures = "temp_closures_layer"
        closure_count = 0
        try:
            arcpy.MakeFeatureLayer_management(wildlife_layer_file, temp_closures, closure_query)
            closure_count = int(arcpy.GetCount_management(temp_closures).getOutput(0))
            log_message(f"Found {closure_count} active wildlife closures")
        except Exception as e:
            log_message(f"Error creating closure layer: {str(e)}", "ERROR")
            log_message("Defaulting all trails to STATUS='Open'")

        trails_updated = 0
        if check_field_exists(hosted_url, "STATUS"):
            with arcpy.da.UpdateCursor(hosted_url, ["SegmentID", "TrailName", "STATUS", "SHAPE@"]) as cursor:
                for row in cursor:
                    segment_id, trail_name, current_status, trail_geom = row

                    if trail_geom is None or trail_geom.length == 0:
                        log_message(f"Trail {segment_id} has no geometry, skipping", "WARNING")
                        continue

                    new_status = "Open"
                    if closure_count > 0:
                        try:
                            trail_length = trail_geom.length
                            intersect_length = 0
                            current_date = datetime.now().date()
                            current_year = current_date.year

                            with arcpy.da.SearchCursor(temp_closures, ["SHAPE@", "Date_From", "Date_To"]) as closure_cursor:
                                for closure_row in closure_cursor:
                                    closure_geom, date_from, date_to = closure_row
                                    if not closure_geom:
                                        continue

                                    # Normalize dates
                                    if hasattr(date_from, "date"):
                                        date_from = date_from.date()
                                    if hasattr(date_to, "date"):
                                        date_to = date_to.date()

                                    if date_from.year == 2014:
                                        actual_start = datetime(current_year, date_from.month, date_from.day).date()
                                        actual_end = datetime(current_year, date_to.month, date_to.day).date()
                                    else:
                                        actual_start, actual_end = date_from, date_to

                                    if actual_start <= current_date <= actual_end:
                                        intersection = trail_geom.intersect(closure_geom, 1)
                                        if intersection and not intersection.isEmpty:
                                            intersect_length += intersection.length

                            overlap_percent = (intersect_length / trail_length) * 100 if trail_length > 0 else 0
                            new_status = "Closed" if overlap_percent >= 25.0 else "Open"

                            tname = trail_name if trail_name else f"ID:{segment_id}"
                            log_message(f"Trail '{tname}': {overlap_percent:.1f}% overlap -> {new_status}")

                        except Exception as e:
                            log_message(f"Error calculating overlap for trail {segment_id}: {str(e)}", "ERROR")
                            new_status = "Open"

                    if new_status != current_status:
                        row[2] = new_status
                        cursor.updateRow(row)
                        trails_updated += 1

        if closure_count > 0:
            arcpy.Delete_management(temp_closures)

        log_message(f"Updated STATUS for {trails_updated} trails")
        log_message("=" * 60)
        log_message("Process completed successfully!")

    except Exception as e:
        log_message(f"Error in main process: {str(e)}", "ERROR")
        sys.exit(1)

if __name__ == "__main__":
    main()



