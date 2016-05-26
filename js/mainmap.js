	var lon = 0;
	var lat = 0;
	var map, selectCtrl;
	
	//by default select all the checkboxes
	//displayAll(true, 1, 69);
	//displayAll(true, 100, 109);
	
	/* This is the array of Features which shows up on the map by default. This is used to find and compare
	against the selected filters.
	i.e. All filtered features are pushed to this array. It is initialized here, and assigned later */
	var all_featuresArray = new Array(); 
	
	/* This strings hold the respective filter criteria (Some possible future enhancement ones included)  */
	var country_string = ''; //the string holds the country name selected from the dropdown
	var state_string = ''; //the string holds the state name selected from the dropdown
	var displayed_subtopic = 'nada';//the string holds the currently displaying subtopic to make invisible on reset or additional selection
	var current_subtopic = 'nill';//the string holds the most current input selected subtopic value
	var topic_string = ''; //the string that holds the topic string used in the filter
	var subtopic_string = '';  //the string that holds the subtopic string used in the filter
	/*
	function setCumulative() {
		var nav = map.getControlsByClass("OpenLayers.Control.Navigation")[0];
		var cumulative = document.getElementById("cumulative");
		nav.handlers.wheel.cumulative = cumulative.checked;
	};
	*/	
	
	/* The main map variable declaration and the book vector declaration. Bot are global.
	The Map holds book and the book vector hold KML information, features, clusters, select controls etc. */
	var map, book; 
	
	/* The init function - called when the page finishes loading */
	function init(){
		
		/* The full extent/bounds to which the Map can be zoomed */
		var fullBounds = new OpenLayers.Bounds(-90, 0, 70, 30);
		
		/* Map variable is assigned a OpenLayers.Map */
		map = new OpenLayers.Map('map', {
			div: "map",
			controls:[
					new OpenLayers.Control.Navigation(
						{mouseWheelOptions: {interval: 100}}
					),
					new OpenLayers.Control.PanZoomBar(),
					new OpenLayers.Control.Attribution(), 
					new OpenLayers.Control.LayerSwitcher(), 
					new OpenLayers.Control.Permalink(), 
					//new OpenLayers.Control.OverviewMap()
				],
			maxExtent: fullBounds,
			projection: new OpenLayers.Projection("EPSG:900913"),
			displayProjection: new OpenLayers.Projection("EPSG:4326"),
			units: "m",
			maxResolution: 156543.0339,
			maxExtent: new OpenLayers.Bounds(-20037508, -20037508,20037508, 20037508)
			
		});
		/* This is the stylemap which styles i.e. colors, borders, etc the selected features and clusters */
		var fStyle = new OpenLayers.Style({
                    pointRadius: "${radius}",
                    fillColor: "#ffcc66",
                    fillOpacity: 0.8,
                    strokeColor: "#cc6633",
                    strokeWidth: 2,
                    strokeOpacity: 0.8,
					label:"${count}",
					fontSize: "9px",
					fontWeight: "bold",
                }, {
                    context: {
                        radius: function(feature) {
                           /* The radius of the cluster is set based on the number of features it contains*/
						   return Math.min(feature.cluster.length, 7) + 3;
                        },						
						count: function(feature) {
							/* This  displays the count of the features on the clusters */
							if (feature.cluster.length>1)
								return feature.cluster.length;
							else
								return "";							
						}
                    }
                });
		
		/* the book variable is assigned a OpenLayers.Layer.Vector */		
		
		book = new OpenLayers.Layer.Vector("book", {	
			projection: map.displayProjection,	
			strategies: [
					new OpenLayers.Strategy.Fixed(),
					/* Using the cluster strategy clusters the features that are too close into clusters. */
					new OpenLayers.Strategy.Cluster({
						//distance:20 //This value can be changed to change the distance which defines when to form clusters
					})
			],    
			protocol: new OpenLayers.Protocol.HTTP({
				/* The path to the KML files*/
				url: "./kms/geog_smallest.kml",
				//url: "georeferences_July19_2_modified.kml",
				format: new OpenLayers.Format.KML({
					extractAttributes: true,
					maxDepth: 1,					
				})					
			}),
			/* This style map says that the default style is the fstyle which is defined above, and upon selection, the one defined 
			   infront of 'select' gets activated */
			styleMap: new OpenLayers.StyleMap({
					"default": fStyle,
					"select": {
						fillColor: "#8aeeef",
						strokeColor: "#32a8a9",
					}
			})
		});
		
		/* This is an important function where once all the strategies are done loading i.e. the features are done loading, the 
		   set of features is assigned to the all_featuresArray which was initialized earlier.
		   book.strategies[i] can be selected to choose either the clusters or the features, as per the order defined in the Vector	*/
		book.events.register("loadend", this, function(){		
			all_featuresArray = book.strategies[1].features;
		});				
		
		/* These are the base layers on top of which the Vector will be displayed */
		var gmap = new OpenLayers.Layer.Google("Google Streets", {numZoomLevels: 20, sphericalMercator: true} );
		var gmap_phy =  new OpenLayers.Layer.Google("Google Hybrid",  {type: google.maps.MapTypeId.HYBRID, numZoomLevels: 20, sphericalMercator: true});
		var osm = new OpenLayers.Layer.OSM('Open Street Maps', 'http://tile.openstreetmap.org/${z}/${x}/${y}.png', {numZoomLevels: 20, sphericalMercator: true} ); 		
		var wms = new OpenLayers.Layer.WMS( "OpenLayers WMS", "http://labs.metacarta.com/wms/vmap0",{iBaseLayer: false, layers:'basic', units: "m", projection: "EPSG:4326", reproject: false, numZoomLevels: 20}, {singleTile : 'true'});
		wms.setVisibility(false);
		/* Add the above layers to the map */
		map.addLayers([ gmap, gmap_phy, osm, wms]);
		/* Add the vectors to the Map */
		map.addLayers([ book]);
	
		/* This is the simple function which generates the table content when a cluster is highlighed i.e. hovered upon by the mouse */ 
		var onHighlight = function(e) {
			  if(e.feature.cluster.length==1){
				//If a single feature, do nothing
				return;
			  }
              var hoverNode = document.getElementById("hover_table");
			  //clear the table
			  hoverNode.innerHTML = "";
			  var tbody = document.createElement('tbody');
			  var row = document.createElement('tr');
			  if(e.feature.cluster.length>1 && e.feature.cluster.length<500 ){
				for(var i=0; i<e.feature.cluster.length; i++){
					var feature = e.feature.cluster[i];
					var feature_content = "<h5>"+feature.attributes.name + "</h5>" + feature.attributes.description;					
					var cell = document.createElement('td');
					cell.innerHTML = feature_content;
					//var cont = document.createTextNode(feature_content);
					//cell.appendChild(cont);
					row.appendChild(cell);
				}
				tbody.appendChild(row);	
				hoverNode.appendChild(tbody);
			  }
			  
        };
		
		/* This is the simple function which generates the table content when a cluster is un-highlighed. 
		Right now it does nothing. But can be used to clear the table, etc. */ 
		var onUnHighlight = function(e) {
			//clear the table after some delay
			/*
			 setTimeout(function() {
				  var hoverNode = document.getElementById("hover_table");
				  hoverNode.innerHTML = "";
			  },5000);
			 */
			  
        };

		/* The is the Control.SelectFeature which binds the hover events to the above functions */
		var highlightCtrl = new OpenLayers.Control.SelectFeature(book,
		{
			hover: true, 
			highlightOnly: true, 
			renderIntent: 'temporary',
			eventListeners: {
					featurehighlighted: onHighlight,
					featureunhighlighted: onUnHighlight,
				} 
		});		
		
		/* The is the Control.SelectFeature which binds the selection events to the functions defined later in the file */
		selectCtrl = new OpenLayers.Control.SelectFeature(book,
		{
			clickout: true,
			onSelect: onFeatureSelect,
			onUnselect: onFeatureUnselect			
		});
		
		/*
		//This is an alternative way of binding the selection events to the functions
		book.events.on({
				"featureselected": onFeatureSelect,
				"featureunselected": onFeatureUnselect,
		});
		*/
		
		/* Add the Control.SelectFeature defined above and activate them */
		map.addControl(highlightCtrl);
		map.addControl(selectCtrl);
		highlightCtrl.activate();
		selectCtrl.activate();   
		
		/* Add a layer switcher to the map so that differet Vectors and BaseLayers that we added to the map can be selected 
		or deselected by the user */
		map.addControl(new OpenLayers.Control.LayerSwitcher());
		
		/* This is the initial view or the zoom level which the user sees when the application is launched 
		It uses the fullBounds defined earlier by transforming them into the spherical mercator projection */
		map.zoomToExtent(fullBounds.transform(map.displayProjection, map.getProjectionObject()));

	};
	
	/* Resets the form! */
	function formReset() {
		document.getElementById("_form").reset();
		
		if (displayed_subtopic != 'nada'){
			document.getElementById(displayed_subtopic).style.display = "none";
		}
	}
	

	
	/* Hides all the features from the map, called before applying a filter-criteria */
	function hide_features() {
		book.removeAllFeatures();		
	}	
	
	/* Shows all the features - not used as of now. */
	function show_features() {
		//remove all features from the layer
		book.removeAllFeatures()
		//add all features to the layer
		for (var i = 0; i < all_featuresArray.length; i++) {
			book.addFeatures(all_featuresArray[i])
		}
		//display on the map
		map.addLayer(book);
		//write search description and table
		write_results(all_featuresArray);
	}
	
	
	function ApplyAllCriteria(){
		/* This functinos is called when the Apply buttons are clicked by the user on selecting different filters.
		It calls the ApplyCriteria() and the ApplySubtopicCriteria() functions for the filtering purpose which are defined below. */
		
		
		/* The form on the left hand side on the page*/
		var _form = document.forms['_form'];
		
		/*The features which are filtered from the all_FeaturesArray are pushed into the featuresArray.
		This features array is eventually on added to the book layer and the user can thus see the results of his/her search.
		*/
		var featuresArray = new Array();
		featuresArray = [];
		featuresArray = ApplyCriteria(_form, featuresArray);  //ApplyCriteria Function called here
		//if the subtopic is not pending do a search by Topic AND subtopic else only search by topic NEVERMIND Handled in logic block in ApplyCriteria section
		//featuresArray = ApplySubtopicCriteria(featuresArray);

		//At this point the featuresArray contains the results, so log the number of results. 
		console.log("Results = "+featuresArray.length);

		//Add the resulting features to the Vector layer i.e. book, and add to the map, to display to the user.
		book.addFeatures(featuresArray);		
		map.addLayer(book);
		
		/* write the search description and the results table, so that the user knows what filters he had used */
//		write_results(featuresArray);
		
		/* Clear the array upon finishing displaying the results. Be ready for the next search! */
		featuresArray = [];
		
		return featuresArray;
	}	
	
	function ApplyCriteria(form, featuresArray){
		/*Be used as the basis for the searching of the topic and subtopic */
		
		/* This function takes the form on the left and side along the featuresArray as the input, filters
			using the filters in side the form and returns the resulting featuresArray */
	
	//	document.getElementById("country").setAttribute("value","0");
	//POTENTIALLY not needed depending on how the logic plays out for the search and filter.
	//subject = document.getElementById("topic").value;
		
	//subsubject = document.getElementById(subtopic_string).value;
	
		//In the department Block selection pane, clear the # of results
		/*for (k=0; k<=9; k++){
			var str = 'document.getElementById("deptResults'+k+'").innerHTML = 0;'
			eval(str);
		}*/
		//set placemarksArray to null
		featuresArray = [];	
		
		//perform the filtering
		featuresArray = searchTopicSubTopic(form, featuresArray);
		return featuresArray;

	}
	
	function ApplySubtopicCriteria(featuresArray){	
		/*This function takes the featuresArray as the input, and filters based on the sub topic selected 
		(done in the selectDept() function) returns the resulting featuresArray*/
		
		featuresArray = selectDept(featuresArray); //selects from placemarksArray and returns placemarksArray		
		return featuresArray;
	}
	
	function write_results (features) {
	/* This is a simple function which shows the user what filters were selected. Self-explanotry. */
		var search_description = '';
		var title_write='';
		
		/* Country and State Filter  - Since only used to zoom and not search, I am removing from the showing in the selectedfilter Critera
		var country_dropdown = document.getElementById("country");
		var _selectedIndex = country_dropdown.selectedIndex;
		country_string = country_dropdown.options[_selectedIndex].text;
		if(country_string == 'Select country'){
			country_string = "";
		}
				
		var states_dropdown = document.getElementById("us_states");
		_selectedIndex = states_dropdown.selectedIndex;
		state_string = states_dropdown.options[_selectedIndex].text;
		if(states_dropdown.disabled==true){
			state_string = "";
		}
		else if(_selectedIndex>0){
			country_string = state_string + ", " + country_string;
		}
		
		document.getElementById("filterCountryRow").setAttribute("style","display:block;background-color:#cccccc;");
		document.getElementById("filterCountryData").innerHTML = country_string;		
		*/
	
	
		/* Author and Advisor Filter */
	//	document.getElementById("filterAuthorRow").setAttribute("style","display:block;background-color:#cccccc;");
	//	document.getElementById("filterAuthorData").innerHTML = auth_string;
		
		/* Author Year range filter */
	//	document.getElementById("filterYearRow").setAttribute("style","display:block;background-color:#cccccc;");
	//	document.getElementById("filterYearData").innerHTML = year_string;
			
		/* Department Filter */
		/*document.getElementById("filterDeptRow").setAttribute("style","display:block;background-color:#cccccc;");
		document.getElementById("filterDeptData").innerHTML = dept_string;		
		document.getElementById("filterDeptData").setAttribute("style","height: 90px !important;overflow-y:scroll !important;");*/

	};
	
	function searchTopicSubTopic (form, featuresArray) {
	
		/* Able to search by topic and subtopic or Topic alone here!!!
		*/
	
		/* This function takes the input string from the 'Search by Topic/SubTopic' dropdowns and uses it to find matching 
			features from the all_featuresArray list, finally pushing them to featuresArray which is returned */
		/*	
		var temp_Array_all = new Array();	
		var temp_Array_selected = new Array();
		
		
		//set the featuresArray to hold all the features at this time for comparison and selection by attribute
		featuresArray = all_featuresArray;
		
		//Assign selected topic and subtopic values to the variable strings for comparison in the filter
		topic_string = topic.value;
		
		//Filter by topic only/first
		arrayCount = featureArray.length + 1;
		//cycle through the initial all arrays set and pull out only those records that are equal to topic_string value
		for (var i = 0; i < arrayCount; i++) {
			descriptionIn = featuresArray[i].data.description;
			splitTop = descriptionIn.indexOf("<table "); //Used to select the initial index value of the string for getting sliced string of description string
			splitBottom = descriptionIn.indexOf("</table>"); //Used to select the last index value of the subset setring for getting sliced string of description
			descriptionSub = descriptionIn.slice(splitTop, splitBottom);
			descriptionSub = descriptionSub.toString();
			
			//Cycle through and find the Lat, Long, Title, Subject, and SubSubject in the string and extract and assign
			itemcount = 5; //need 5 items to be extracted from the 
			for (var j = 0; j < itemcount; j++){
				if j == 0 {
					searchWord = "Lat";
					indexBottom = 20;
				} else if j == 1 {
					searchWord = "Long";
					indexBottom = 20;
				} else if j == 2 {
					searchWord = "Title";
					indexBottom = 1200;
				} else if j == 3 {
					searchWord = "Subject";
					indexBottom = 20;
				} else if j == 4 {
					searchWord = "SubSubject";
					indexBottom = 20;
				} else {
					return;
				}
				
				indexTop = descriptionSub.search(searchWord);
				indexBottom = indexTop + indexBottom;
				extractSub = descriptionSub.splice(indexTop, indexBottom);
				extractSub = extractSub.split("</td>");
				extractOne = extractSub[0];
				extractTwo = extractSub[1];
				extractSub = extractOne.concat(extractTwo);
				extractSub = extractSub.split("<td>");
				
				if j == 0 {
					latSearch = extractSub[1];
					
				} else if j == 1 {
					longSearch = extractSub[1];
					
				} else if j == 2 {
					titleSearch = extractSub[1];
					
				} else if j == 3 {
					subjectSearch latSearch = extractSub[1];
					
				} else if j == 4 {
					subsubjectSearch = extractSub[1];
					
				} else {
					return;
				}				
				
			
			}
		}*/
		//This way did not work as the content of the KML had the "Description" field as one huge string 
		//var topicFeatures = book.getFeaturesByAttribute("Subject", topic_string); // Pull value from Subject attribute
		//var topicFeatures = book.getFeaturesByAttribute("name", "North America"); //Testing if can pull from name attribute.
		
		if (current_subtopic != 'nill' || current_subtopic != 'pending'){
			subtopicID = subtopic_string;//Poor choice of naming for the subtopic string TODO: Rename the subtpic string to use for identifying the subtopic select HTML element
			subtopic_string = document.getElementById(subtopicID).value;
			// alert(subtopic_string);
			//var subtopicFeatures = book.getFeaturesByAttribute("SubSubject", subtopic_string);
			featuresArray = subtopicFeatures;
		} else{
		//if the subtopic is nill or pending the features Array is assigned the result of the the initial topics filter.
			featuresArray = topicFeatures;
		
		}
		
		
	//	else {
		
			//Split the users input by words according to space (auth_split is an array holding each word)	
			//This can be improved to trim extra spaces and so on.
		/*	var auth_split=auth_string.split(" "); 	
							
			temp_Array_all = all_featuresArray;

			for (var i = 0; i < auth_split.length; i++) {		
				for (var j = 0; j < temp_Array_all.length; j++) {	*/
					/* Search using the entire name */
					//if (temp_Array_all[j].attributes.Author.search(new RegExp(auth_split[i], "i")) != -1) {				
					/* Search using the Last name - Regular Expression */
					//if (temp_Array_all[j].attributes.Author.split(", ")[0].search(new RegExp(auth_split[i], "i")) != -1) {
					/* Search using the exact last name */
		/*			if(auth_split[i].toLowerCase() ==  temp_Array_all[j].attributes.Author.value.split(", ")[0].toLowerCase() || auth_split[i].toLowerCase() ==  temp_Array_all[j].attributes.Advisor.value.split(", ")[0].toLowerCase()){
						temp_Array_selected.push(temp_Array_all[j]); //this array holds the placemarks that meet the criteria
					}	
				}			
			}			
			featuresArray = temp_Array_selected;		
		} */
		
		return featuresArray;
	};

		
	/*function selectDept(featuresArray){
		// This functions goes through all the check boxes for the department and the suubdeparments and finds out which ones are selected 
		and finds the respective items from the all_FeaturesArray.
		I have not had the time to rewrite this function. It can be imporved. //
	
		var checked_dept = new Array(false,false,false,false,false,false,false,false,false,false);
		//This array tells if a particular department is selected or not (yes selected if even a single sub department is selected)
		
		var checked_cnt = 0;
		var dept_0 = 0;
		var dept_1 = 0;
		var dept_2 = 0;
		var dept_3 = 0;
		var dept_4 = 0;
		var dept_5 = 0;
		var dept_6 = 0;
		var dept_7 = 0;
		var dept_8 = 0;
		var dept_9 = 0;	
			
		//
		if(featuresArray.length<=0){
			featuresArray = all_featuresArray;
		}
		//
		
		var tempArray = new Array();
		var change_featuresArray = false; //flagged true if any filtering by department was performed

		dept_string = '';

		var dept_string0 = '';		
		var dept_string1 = '';		
		var dept_string2 = '';		
		var dept_string3 = '';		
		var dept_string4 = '';		
		var dept_string5 = '';		
		var dept_string6 = '';		
		var dept_string7 = '';		
		var dept_string8 = '';		
		var dept_string9 = '';
		
		var checked_dept_index = 0;
		for (i = 1; i < 70; i++) {
			
			var cBox = document.getElementById("check" + i);
			
			if(cBox.checked){
				if(i>=15 && i<=18 ) checked_dept_index=1;
				if(i>=19 && i<=20 ) checked_dept_index=2;
				if(i>=21 && i<=25 ) checked_dept_index=3;
				if(i>=26 && i<=30 ) checked_dept_index=4;
				if(i>=31 && i<=42 ) checked_dept_index=5;
				if(i>=43 && i<=46 ) checked_dept_index=6;
				if(i>=47 && i<=58 ) checked_dept_index=7;
				if(i>=59 && i<=63 ) checked_dept_index=8;
				if(i>=64 && i<=69 ) checked_dept_index=9;
					
				if(!checked_dept[checked_dept_index]){ //this should execute only # of department times.
					checked_dept[checked_dept_index] = true;
				}
				
				checked_cnt++;
				var cBoxValue = cBox.value;
					
				for (var j = 0; j < featuresArray.length; j++) {	
					
					if ( featuresArray[j].attributes.Department.value.toLowerCase() == cBoxValue.toLowerCase() ) {
							
						if (i>=1 && i<=14){
							dept_0++;														
						}else if (i>=15 && i<=18){
							dept_1++;							
						}else if (i>=19 && i<=20){
							dept_2++;							
						}else if (i>=21 && i<=25){
							dept_3++;							
						}else if (i>=26 && i<=30){
							dept_4++;							
						}else if (i>=31 && i<=42){
							dept_5++;							
						}else if (i>=43 && i<=46){
							dept_6++;							
						}else if (i>=47 && i<=58){
							dept_7++;							
						}else if (i>=59 && i<=63){
							dept_8++;							
						}else if (i>=64 && i<=69){
							dept_9++;							
						}							
						
						tempArray.push(featuresArray[j]); 
					}
				}
				change_featuresArray = true;
				
				if (i>=1 && i<=14){
					dept_string0 += ' - '+cBoxValue+'<br/>';
				}else if (i>=15 && i<=18){
					dept_string1 += ' - '+cBoxValue+'<br/>';					
				}else if (i>=19 && i<=20){
					dept_string2 += ' - '+cBoxValue+'<br/>';
				}else if (i>=21 && i<=25){
					dept_string3 += ' - '+cBoxValue+'<br/>';
				}else if (i>=26 && i<=30){
					dept_string4 += ' - '+cBoxValue+'<br/>';
				}else if (i>=31 && i<=42){
					dept_string5 += ' - '+cBoxValue+'<br/>';
				}else if (i>=43 && i<=46){
					dept_string6 += ' - '+cBoxValue+'<br/>';
				}else if (i>=47 && i<=58){
					dept_string7 += ' - '+cBoxValue+'<br/>';
				}else if (i>=59 && i<=63){
					dept_string8 += ' - '+cBoxValue+'<br/>';
				}else if (i>=64 && i<=69){
					dept_string9 += ' - '+cBoxValue+'<br/>';
				}	
				//chenge the department string which will be displayed in the Search Description				

			}
			
		}
		
		//Build the string to show in search filters
		if(checked_dept[0])
			dept_string0 = "<span><u>College of Agriculture and Life Sciences</u></span><br/>"+dept_string0;
		if(checked_dept[1])
			dept_string1 = "<span><u>College of Architecture</u></span><br/>"+dept_string1;
		if(checked_dept[2])
			dept_string2 = "<span><u>Bush School of Government & Public Service</u></span><br/>"+dept_string2;
		if(checked_dept[3])
			dept_string3 = "<span><u>Mays Business School</u></span><br/>"+dept_string3;
		if(checked_dept[4])
			dept_string4 = "<span><u>College of Education & Human Development</u></span><br/>"+dept_string4;
		if(checked_dept[5])
			dept_string5 = "<span><u>Dwight Look College of Engineering</u></span><br/>"+dept_string5;
		if(checked_dept[6])
			dept_string6 = "<span><u>College of Geosciences</u></span><br/>"+dept_string6;
		if(checked_dept[7])
			dept_string7 = "<span><u>College of Liberal Arts</u></span><br/>"+dept_string7;		
		if(checked_dept[8])
			dept_string8 = "<span><u>College of Science</u></span><br/>"+dept_string8;
		if(checked_dept[9])
			dept_string9 = "<span><u>College of Veterinary Medicine & Biomedical Sciences</u></span><br/>"+dept_string9;
		
		dept_string = dept_string0+dept_string1+dept_string2+dept_string3+dept_string4+dept_string5+dept_string6+dept_string7+dept_string8+dept_string9;
		
		//If no checkBoxes are selected, then clear the fearures array
		if(checked_cnt==0){
			featuresArray = [];
			dept_string = "No Departments selected!";
		} else if(checked_cnt==69){
		    dept_string = "All Departments Selected";
		}
		
		//Change featuresArray to include only the placemarks meeting the Department selection criteria
		if (change_featuresArray) {
			featuresArray = tempArray;			
		}
		
		for (k=0; k<=9; k++){
			var str = 'document.getElementById("deptResults'+k+'").innerHTML = dept_'+k+';'
			eval(str);
		}
		
		return featuresArray;
	
	};*/
		
	/* WHen a popup is closed, it deselcts the features. */
	function onPopupClose(evt) {
		selectCtrl.unselectAll();
	}
	
	/* This function is bound to the event that a feature is selected, and thus called when a feature is clicked upon. */
	function onFeatureSelect(feature) {
		//If the selected item is a group of features i.e. a cluster then zoom
		if(feature.cluster.length>1){
			map.setCenter(feature.geometry.getBounds().getCenterLonLat());
			/* This is crude way. A better way would be to get the distance between the two features in the cluster which are farthest
			and zoom to a level based on that distance */ 
			map.zoomIn();map.zoomIn();		
		}else{ //If the selected item is a individual feature then display information
			var feature = feature.cluster[0];
			// Since KML is user-generated, do naive protection against Javascript.
			var content = "<h4>"+feature.attributes.name + "</h4>" + feature.attributes.description;			
			
			if (content.search("<script") != -1) {
				content = "Content contained Javascript! Escaped content below.<br>" + content.replace(/</g, "&lt;");
			}						
			book.popup = new OpenLayers.Popup.FramedCloud("wms", 
								 feature.geometry.getBounds().getCenterLonLat(),
								 new OpenLayers.Size(1,1),
								 content,
								 null, true, onPopupClose);									 
			book.popup.minSize = new OpenLayers.Size(200,80);
			feature.popup = book.popup;
			map.addPopup(book.popup);			
		}
	}
	
	/* This function is bound to the event that a feature is un-selected, and thus called when the popup is closed or user clicks anywhere else on the map. */
	function onFeatureUnselect(feature) {
		var feature = feature.cluster[0];
		if(feature.popup) {
			map.removePopup(feature.popup);
			feature.popup.destroy();
			delete feature.popup;
		}
	}

	/* This function zooms to the state bounds i.e zooms upon the selcted state -for united states only.
		Code is self explnatory. The bounds for the states are obtained from the OpenStreetMaps */ 
	function ZoomState(state) {
		
		var state_bounds= new OpenLayers.Bounds(0,0,0,0);
		switch (state) {
			case "0":
				break;
			case "AL":
				state_bounds = new OpenLayers.Bounds( -92.62,36.48,-80.74,28 );
				break;
			case "AK":
				state_bounds = new OpenLayers.Bounds( -155.62,66.41,-143.74,62.34 );
				break;	
			case "AZ":
				state_bounds = new OpenLayers.Bounds( -117.7,38.19,-105.83,30.42 );
				break;	
			case "AR":
				state_bounds = new OpenLayers.Bounds( -95.1,36.68,-89.16,32.81 );
				break;	
			case "CA":
				state_bounds = new OpenLayers.Bounds( -131.18,44.51,-107.44,29.58 );
				break;	
			case "CO":
				state_bounds = new OpenLayers.Bounds( -111.55,42.3,-99.67,34.96 );
				break;					
			case "CT":
				state_bounds = new OpenLayers.Bounds( -75.57,43.31,-69.63,39.62 );
				break;			
			case "DE":
				state_bounds = new OpenLayers.Bounds( -77.95,40.57,-72.01,36.72 );
				break;	
			case "DC":
				state_bounds = new OpenLayers.Bounds( -78.34,39.77,-75.36,37.85 );
				break;	
			case "FL":
				state_bounds = new OpenLayers.Bounds( -88.07,31.84,-76.2,23.12 );
				break;	
			case "GA":
				state_bounds = new OpenLayers.Bounds( -89.05,36.39,-77.18,28.08 );
				break;	
			case "HI":
				state_bounds = new OpenLayers.Bounds( -158.36,21.74,-157.61,21.16 );
				break;	
			case "ID":
				state_bounds = new OpenLayers.Bounds( -116.99,45.4,-111.04,41.83 );
				break;					
			case "IL":
				state_bounds = new OpenLayers.Bounds( -91.23,42.4,-85.29,38.66 );
				break;			
			case "IN":
				state_bounds = new OpenLayers.Bounds( -89.41,41.66,-83.47,37.88 );
				break;
			case "IA":
				state_bounds = new OpenLayers.Bounds( -99.33,45.51,-87.45,38.19 );
				break;	
			case "KS":
				state_bounds = new OpenLayers.Bounds( -101.55,40.18,-95.61,36.31 );
				break;	
			case "KY":
				state_bounds = new OpenLayers.Bounds( -87.74,39.13,-81.8,35.2 );
				break;	
			case "LA":
				state_bounds = new OpenLayers.Bounds( -94.98,32.96,-89.04,28.73 );
				break;	
			case "ME":
				state_bounds = new OpenLayers.Bounds( -68.89,45.73,-68.83,45.69 );
				break;					
			case "MD":
				state_bounds = new OpenLayers.Bounds( -79.91,41.39,-73.97,37.59 );
				break;			
			case "MA":
				state_bounds = new OpenLayers.Bounds( -75,44.17,-69.06,40.53 );
				break;					
			case "MI":
				state_bounds = new OpenLayers.Bounds( -90.47,46.64,-78.6,39.45 );
				break;	
			case "MN":
				state_bounds = new OpenLayers.Bounds( -97.58,47.68,-91.64,44.25 );
				break;	
			case "MS":
				state_bounds = new OpenLayers.Bounds( -92.71,35.01,-86.76,30.88 );
				break;	
			case "MO":
				state_bounds = new OpenLayers.Bounds( -95.53,40.66,-89.59,36.81 );
				break;	
			case "MT":
				state_bounds = new OpenLayers.Bounds( -115.98,50,-104.11,43.25 );
				break;					
			case "NE":
				state_bounds = new OpenLayers.Bounds( -105.62,45.1,-93.74,37.73 );
				break;			
			case "NV":
				state_bounds = new OpenLayers.Bounds( -119.83,41.39,-113.88,37.59 );
				break;			
			case "NH":
				state_bounds = new OpenLayers.Bounds( -74.52,45.76,-68.57,42.22 );
				break;	
			case "NJ":
				state_bounds = new OpenLayers.Bounds( -77.7,41.94,-71.75,38.17 );
				break;	
			case "NM":
				state_bounds = new OpenLayers.Bounds( -111.96,38.18,-100.09,30.05 );
				break;	
			case "NY":
				state_bounds = new OpenLayers.Bounds( -78.82,44.93,-72.87,41.33 );
				break;	
			case "NC":
				state_bounds = new OpenLayers.Bounds( -81.3,37.18,-75.36,33.15 );
				break;					
			case "ND":
				state_bounds = new OpenLayers.Bounds( -106.24,50.71,-94.36,44.06 );
				break;			
			case "OH":
				state_bounds = new OpenLayers.Bounds( -85.66,42.08,-79.72,38.32 );
				break;			
			case "OK":
				state_bounds = new OpenLayers.Bounds( -100.24,36.95,-94.3,32.91 );
				break;	
			case "OR":
				state_bounds = new OpenLayers.Bounds( -126.52,47.61,-114.65,40.55 );
				break;	
			case "PA":
				state_bounds = new OpenLayers.Bounds( -83.54,44.74,-71.67,37.32 );
				break;				
			case "RI":
				state_bounds = new OpenLayers.Bounds( -72.89,42.58,-66.95,38.84 );
				break;	
			case "SC":
				state_bounds = new OpenLayers.Bounds( -83.92,35.67,-77.98,31.56 );
				break;								
			case "SD":
				state_bounds = new OpenLayers.Bounds( -105.56,47.62,-93.69,40.57 );
				break;			
			case "TN":
				state_bounds = new OpenLayers.Bounds( -88.95,37.81,-83.01,33.81 );
				break;	
			case "TX":
				state_bounds = new OpenLayers.Bounds( -111.95,39,-88.21,22.9 );
				break;	
			case "UT":
				state_bounds = new OpenLayers.Bounds( -117.65,43.12,-105.78,35.52 );
				break;	
			case "VT":
				state_bounds = new OpenLayers.Bounds( -78.39,47.33,-66.51,40.23 );
				break;	
			case "VA":
				state_bounds = new OpenLayers.Bounds( -81.28,39.2,-75.34,35.27 );
				break;					
			case "WA":
				state_bounds = new OpenLayers.Bounds( -126.81,50.54,-114.94,43.86 );
				break;			
			case "WV":
				state_bounds = new OpenLayers.Bounds( -82.82,39.95,-76.88,36.07 );
				break;			
			case "WI":
				state_bounds = new OpenLayers.Bounds( -92.66,46.16,-86.72,42.64 );
				break;
			case "WY":
				state_bounds = new OpenLayers.Bounds( -113.51,46.66,-101.63,39.47 );
				break;			
		}
		if(state_bounds.left !=0 && state_bounds.right !=0 && state_bounds.bottom !=0 && state_bounds.top !=0){	
			//state_bounds = state_bounds.transform(map.displayProjection, map.getProjectionObject());
			state_bounds = state_bounds.transform(new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject());
			map.zoomToExtent(state_bounds, true);
			state_bounds = new OpenLayers.Bounds(0,0,0,0);
		}
	}
	
	/* This function zooms to the province bounds i.e zooms upon the selcted province -for china only.
		Code is self explnatory. The bounds for the china are obtained from the OpenStreetMaps */ 
	function ZoomProvince(province) {
		
		var province_bounds= new OpenLayers.Bounds(0,0,0,0);
		switch (province) {
			case "0":
				break;
			case "AN":
				province_bounds = new OpenLayers.Bounds( 113.74,35.16,120.52,28.45);
				break;
			case "PE":
				province_bounds = new OpenLayers.Bounds( 115.30,41.33,117.59,39.01);
				break;
			case "CQ":
				province_bounds = new OpenLayers.Bounds( 105.09,32.93,110.37,27.61);
				break;
			case "FU":
				province_bounds = new OpenLayers.Bounds( 115.31,28.91,120.93,22.85);
				break;
			case "KA":
				province_bounds = new OpenLayers.Bounds( 92.83,44.88,109.11,30.68);
				break;
			case "KN":
				province_bounds = new OpenLayers.Bounds( 108.47,26.79,117.40,20.09);
				break;
			case "KC":
				province_bounds = new OpenLayers.Bounds( 104.45,26.88,112.85,19.90);
				break;
			case "KW":
				province_bounds = new OpenLayers.Bounds( 103.33,29.66,110.13,24.08);
				break;
			case "HA":
				province_bounds = new OpenLayers.Bounds( 108.29,20.96,111.28,17.73);
				break;
			case "HP":
				province_bounds = new OpenLayers.Bounds( 111.18,44.11,120.21,35.36);
				break;
			case "HE":
				province_bounds = new OpenLayers.Bounds( 118.87,54.82,135.00,41.67);
				break;
			case "HO":
				province_bounds = new OpenLayers.Bounds( 109.88,37.71,117.26,31.16);
				break;
			case "HH":
				province_bounds = new OpenLayers.Bounds( 108.36,33.30,116.19,29.00);
				break;
			case "HU":
				province_bounds = new OpenLayers.Bounds( 108.56,30.31,114.60,24.37);
				break;
			case "KU":
				province_bounds = new OpenLayers.Bounds( 116.27,36.50,122.03,30.06);
				break;
			case "KI":
				province_bounds = new OpenLayers.Bounds( 111.93,31.35,118.94,23.85);
				break;
			case "KR":
				province_bounds = new OpenLayers.Bounds( 120.54,46.95,131.41,39.38);
				break;
			case "LP":
				province_bounds = new OpenLayers.Bounds( 118.49,43.84,126.20,38.09);
				break;
			case "NN":
				province_bounds = new OpenLayers.Bounds( 104.06,39.57,108.66,35.00);
				break;
			case "TS":
				province_bounds = new OpenLayers.Bounds( 88.73,41.37,103.50,30.07);
				break;
			case "SS":
				province_bounds = new OpenLayers.Bounds( 105.44,40.61,113.13,30.96);
				break;
			case "SP":
				province_bounds = new OpenLayers.Bounds( 114.11,39.78,123.14,33.31);
				break;	
			case "SM":
				province_bounds = new OpenLayers.Bounds( 120.76,31.91,123.01,30.09);
				break;	
			case "SS":
				province_bounds = new OpenLayers.Bounds( 105.44,40.61,113.13,30.96);
				break;	
			case "IM":
				province_bounds = new OpenLayers.Bounds( 97.05,54.84,128.63,33.10);
				break;	
			case "SH":
				province_bounds = new OpenLayers.Bounds( 103.96,42.54,116.44,30.21);
				break;	
			case "SZ":
				province_bounds = new OpenLayers.Bounds( 97.29,34.63,108.84,25.81);
				break;	
			case "TN":
				province_bounds = new OpenLayers.Bounds( 116.35,40.35,118.35,38.29);
				break;
			case "TI":
				province_bounds = new OpenLayers.Bounds( 77.61,39.78,100.16,23.33);
				break;
			case "SU":
				province_bounds = new OpenLayers.Bounds( 72.81,52.30,97.69,28.32);
				break;
			case "YU":
				province_bounds = new OpenLayers.Bounds( 97.20,29.37,106.71,20.66);
				break;
			case "CH":
				province_bounds = new OpenLayers.Bounds( 117.50,32.37,123.30,26.35);
				break;
			case "MH":
				province_bounds = new OpenLayers.Bounds( 113.52,22.22,113.57,22.17);
				break;
			case "HK":
				province_bounds = new OpenLayers.Bounds( 113.74,22.60,114.50,22.09);
				break;	
	
		}
		if(province_bounds.left !=0 && province_bounds.right !=0 && province_bounds.bottom !=0 && province_bounds.top !=0){	
			//province_bounds = province_bounds.transform(map.displayProjection, map.getProjectionObject());
			province_bounds = province_bounds.transform(new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject());
			map.zoomToExtent(province_bounds, true);
			province_bounds = new OpenLayers.Bounds(0,0,0,0);
		}
	}
	
	/*Function used to assign a value to the subtopic field*/
	function SubtopicAssign(topic){
		switch(topic){
		
			case "A":
				window['displayed_subtopic'] = 'class_a_div';
				window['subtopic_string'] = 'class_a';
				return displayed_subtopic;
				
			case "B":
				window['displayed_subtopic'] = 'class_b_div';
				window['subtopic_string'] = 'class_b';
				return displayed_subtopic;
				
			case "C":
				window['displayed_subtopic'] = 'class_c_div';
				window['subtopic_string'] = 'class_c';
				return displayed_subtopic;
				
			case "D":
				window['displayed_subtopic'] = 'class_d_div';
				window['subtopic_string'] = 'class_d';
				return displayed_subtopic;
				
			case "E":
				//window['displayed_subtopic'] = 'class_e';
				window['displayed_subtopic'] = 'pending';
				return displayed_subtopic;
				
			case "F":
				//window['displayed_subtopic'] = 'class_f';
				window['displayed_subtopic'] = 'pending';
				return displayed_subtopic;
				
			case "G":
				window['displayed_subtopic'] = 'class_g_div';
				window['subtopic_string'] = 'class_g';
				return displayed_subtopic;
				
			case "H":
				window['displayed_subtopic'] = 'class_h_div';
				window['subtopic_string'] = 'class_h';
				return displayed_subtopic;
				
			case "I":
				//window['displayed_subtopic'] = 'class_i';
				window['displayed_subtopic'] = 'pending';
				return displayed_subtopic;
				
			case "J":
				window['displayed_subtopic'] = 'class_j_div';
				window['subtopic_string'] = 'class_j';
				return displayed_subtopic;
				
			case "K":
				window['displayed_subtopic'] = 'class_k_div';
				window['subtopic_string'] = 'class_k';
				return displayed_subtopic;
				
			case "L":
				window['displayed_subtopic'] = 'class_l_div';
				window['subtopic_string'] = 'class_l';
				return displayed_subtopic;
				
			case "M":
				window['displayed_subtopic'] = 'class_m_div';
				window['subtopic_string'] = 'class_m';
				return displayed_subtopic;
				
			case "N":
				window['displayed_subtopic'] = 'class_n_div';
				window['subtopic_string'] = 'class_n';
				return displayed_subtopic;
				
			case "O":
				//window['displayed_subtopic'] = 'class_o';
				window['displayed_subtopic'] = 'pending';
				return displayed_subtopic;
				
			case "P":
				window['displayed_subtopic'] = 'class_p_div';
				window['subtopic_string'] = 'class_p';
				return displayed_subtopic;
				
			case "Q":
				window['displayed_subtopic'] = 'class_q_div';
				window['subtopic_string'] = 'class_q';
				return displayed_subtopic;
				
			case "R":
				window['displayed_subtopic'] = 'class_r_div';
				window['subtopic_string'] = 'class_r';
				return displayed_subtopic;
				
			case "S":
				window['displayed_subtopic'] = 'class_s_div';
				window['subtopic_string'] = 'class_s';
				return displayed_subtopic;
				
			case "T":
				window['displayed_subtopic'] = 'class_t_div';
				window['subtopic_string'] = 'class_t';
				return displayed_subtopic;
				
			case "U":
				window['displayed_subtopic'] = 'class_u_div';
				window['subtopic_string'] = 'class_u';
				return displayed_subtopic;
				
			case "V":
				window['displayed_subtopic'] = 'class_v_div';
				window['subtopic_string'] = 'class_v';
				return displayed_subtopic;
				
			case "W":
				//window['displayed_subtopic'] = 'class_w';
				window['displayed_subtopic'] = 'pending';
				return displayed_subtopic;
				
			case "X":
				//window['displayed_subtopic'] = 'class_x';
				window['displayed_subtopic'] = 'pending';
				return displayed_subtopic;
				
			case "Y":
				//window['displayed_subtopic'] = 'class_y';
				window['displayed_subtopic'] = 'pending';
				return displayed_subtopic;
				
			case "Z":
				window['displayed_subtopic'] = 'class_z_div';
				window['subtopic_string'] = 'class_z';
				return displayed_subtopic;
				
		}
	}
	/*Function to set visibility of the subtopic data with the passed Topic value */
	function SubtopicVisible(topic) {
		//debugger;
		if (topic != '0'){
			if (current_subtopic == 'nill'){
				SubtopicAssign(topic);
				current_subtopic = displayed_subtopic;
				document.getElementById(current_subtopic).style.display = "block";
			}else if ((current_subtopic == displayed_subtopic) && (displayed_subtopic != 'pending')) {
				document.getElementById(displayed_subtopic).style.display = "none";
				SubtopicAssign(topic);
				current_subtopic = displayed_subtopic;
				if (displayed_subtopic!= 'pending'){
					document.getElementById(current_subtopic).style.display = "block";
				}
		} else if (topic == '0') {
			if (current_subtopic != displayed_subtopic){
				if (displayed_subtopic != 'nada' || current_subtopic != 'nill'){ 
					document.getElementById(displayed_subtopic).style.display = "none";
				}
			}
			
		} else {
			SubtopicAssign(topic);
			current_subtopic = displayed_subtopic;
			if(current_subtopic != 'pending'){
				document.getElementById(current_subtopic).style.display = "block";
				}
			}
		}
	
	
	}
	
	
	/* This function zooms to the country bounds i.e zooms upon the selcted country.
	Code is self explnatory. The bounds for the countrues  are obtained from : http://wiki.openstreetmap.org/wiki/User:Ewmjc/Country_bounds  */ 
	function ZoomCountry(country) {
		
		if(country=="US"){
			document.getElementById('us_states').disabled = false;
			document.getElementById('china').disabled = true;
		}
		else if(country=="CN"){
			document.getElementById('china').disabled = false;
			document.getElementById('us_states').disabled = true;
		}
		else{
			document.getElementById('us_states').disabled = true;
			document.getElementById('china').disabled = true;
		} 
		var bounds = new OpenLayers.Bounds(0,0,0,0);
		switch (country) {
				case "0":
					break;
	   case        "AF"          :
		bounds = new OpenLayers.Bounds(      60.566667,29.383333,74.88687131,38.483611 );		
		break;
	//Albania                     // 
	   case        "AL"          :
		bounds = new OpenLayers.Bounds(      19.266667,39.65,21.05,42.659167);		
		break;
	//Algeria                     // 
	   case        "DZ"          :
		bounds = new OpenLayers.Bounds(      -8.666667,19,13,37.116667 );
		
		break;
	//Andorra                     // 
	   case        "AD"          :
		bounds = new OpenLayers.Bounds(      1.416667,42.433333,1.783333,42.65         );		
		break;
	//Angola                      // 
	   case        "AO"          :
		bounds = new OpenLayers.Bounds(      10,-32,23.983333,-4.4                     );		
		break;
	//Anguilla                    // 
	   case        "AI"          :
		bounds = new OpenLayers.Bounds(      -63.433333,18.15,-62.916667,18.6          );		
		break;
	//Antigua and Barbuda         // 
	   case        "AG"          :
		bounds = new OpenLayers.Bounds(      -62.333333,16.916667,-61.666667,17.733333 );		
		break;
	//Argentina                   // 
	   case        "AR"          :
		bounds = new OpenLayers.Bounds(      -73.533333,-58.116667,-53.65,-21.783333   );		
		break;
	//Armenia                     // 
	   case        "AM"          :
		bounds = new OpenLayers.Bounds(      43.4425,38.894167,46.560556,41.3          );		
		break;
	//Aruba                       // 
	   case        "AW"          :
		bounds = new OpenLayers.Bounds(      -70.066667,12.416667,-69.85,12.616667     );		
		break;
	//Ashmore and Cartier Islands // 
	//   case        "AU"          :
	//    bounds = new OpenLayers.Bounds(      123.016667,-12.533333,123.533333,-12.21666);
	//    
	//    break;
	//Australia                   // 
	   case        "AU"          :
		bounds = new OpenLayers.Bounds(      112.928889,-55.05,167.983333,-9.133333    );		
		break;
	//Austria                     // 
	   case        "AT"          :
		bounds = new OpenLayers.Bounds(      1.2,46.377222,19,49.016667                );		
		break;
	//Azerbaijan                  // 
	   case        "AZ"          :
		bounds = new OpenLayers.Bounds(      44.876389,38.416667,50.858333,41.910556   );		
		break;
	//Bahamas                     // 
	   case        "BS"          :
		bounds = new OpenLayers.Bounds(      -80.483333,20,-70,29.375                  );		
		break;
	//Bahrain                     // 
	   case        "BH"          :
		bounds = new OpenLayers.Bounds(      45,25,50.823333,26.416667                 );		
		break;
	//Bangladesh                  // 
	   case        "BD"          :
		bounds = new OpenLayers.Bounds(      84,20.6,92.683333,26.5                    );		
		break;
	//Barbados                    // 
	   case        "BB"          :
		bounds = new OpenLayers.Bounds(      -59.65,13.033333,-59.416667,13.333333     );		
		break;
	//Bassas da India             // 
	//   case        "FR"          :
	 //   bounds = new OpenLayers.Bounds(      39.7,-21.416667,39.7,-21.416667           );
	//    
	//    break;
	//Belarus                     // 
	   case        "BY"          :
		bounds = new OpenLayers.Bounds(      22.55,50.716667,32.708056,56.066667       );		
		break;
	//Belgium                     // 
	   case        "BE"          :
		bounds = new OpenLayers.Bounds(      2.566667,49.516667,6.4,51.683333          );		
		break;
	//Belize                      // 
	   case        "BZ"          :
		bounds = new OpenLayers.Bounds(      -89.216944,15.9,-87.483333,18.483333      );		
		break;
	//Benin                       // 
	   case        "BJ"          :
		bounds = new OpenLayers.Bounds(      -4,6.233333,3.816667,12.3614              );		
		break;
	//Bermuda                     // 
	   case        "BM"          :
		bounds = new OpenLayers.Bounds(      -64.882778,32.246944,-64.633333,32.390556 );		
		break;
	//Bhutan                      // 
	   case        "BT"          :
		bounds = new OpenLayers.Bounds(      80,26.716667,92.033333,30                 );		
		break;
	//Bolivia                     // 
	   case        "BO"          :
		bounds = new OpenLayers.Bounds(      -69.6,-22.883333,-57.566667,-9.666667     );		
		break;
	//Bosnia and Herzegovina      // 
	   case        "BA"          :
		bounds = new OpenLayers.Bounds(      15.747222,42.558056,19.618333,45.268333   );		
		break;
	//Botswana                    // 
	   case        "BW"          :
		bounds = new OpenLayers.Bounds(      20,-26.833333,29.016667,-17.833333        );		
		break;
	//Bouvet Island               // 
	   case        "BV"          :
		bounds = new OpenLayers.Bounds(      3.285278,-54.452778,3.433889,-54.386111   );		
		break;
	//Brazil                      // 
	   case        "BR"          :
		bounds = new OpenLayers.Bounds(      -73.75,-33.733333,-28.85,5.266667         );		
		break;
	//British Indian Ocean Territo// 
	   case        "IO"          :
		bounds = new OpenLayers.Bounds(      71.265278,-7.35,72.483333,-5.233333       );		
		break;
	//British Virgin Islands      // 
	   case        "VG"          :
		bounds = new OpenLayers.Bounds(      -64.85,18.3,-64.266667,18.766667          );		
		break;
	//Brunei Darussalam           // 
	   case        "BN"          :
		bounds = new OpenLayers.Bounds(      110,-2,120,5.05                           );		
		break;
	//Bulgaria                    // 
	   case        "BG"          :
		bounds = new OpenLayers.Bounds(      22.371389,41,28.6,44.193611               );		
		break;
	//Burkina Faso                // 
	   case        "BF"          :
		bounds = new OpenLayers.Bounds(      -5.466667,9.45,2.2655,14.983333           );		
		break;
	//Burundi                     // 
	   case        "BI"          :
		bounds = new OpenLayers.Bounds(      29.023889,-4.443333,30.831389,-2.3425     );		
		break;
	//Cambodia                    // 
	   case        "KH"          :
		bounds = new OpenLayers.Bounds(      102.358333,9.916667,107.566667,17.483333  );		
		break;
	//Cameroon                    // 
	   case        "CM"          :
		bounds = new OpenLayers.Bounds(      8.483333,2.016667,16,16                   );		
		break;
	//Canada                      // 
	   case        "CA"          :
		bounds = new OpenLayers.Bounds(      -141.666667,40,-52.666667,83.116667       );		
		break;
	//Cape Verde                  // 
	   case        "CV"          :
		bounds = new OpenLayers.Bounds(      -25.366667,14.8,-22.666667,17.2           );		
		break;
	//Cayman Islands              // 
	   case        "KY"          :
		bounds = new OpenLayers.Bounds(      -81.416667,19.25,-79.716667,19.75         );		
		break;
	//Central African Republic    // 
	   case        "CF"          :
		bounds = new OpenLayers.Bounds(      14.533333,2.433333,27.216667,10.7         );		
		break;
	//Chad                        // 
	   case        "TD"          :
		bounds = new OpenLayers.Bounds(      2,7.5,24,26                               );		
		break;
	//Chile                       // 
	   case        "CL"          :
		bounds = new OpenLayers.Bounds(      -109.466667,-56.533333,-66.433333,-17.53  );		
		break;
	//China                       // 
	   case        "CN"          :
		bounds = new OpenLayers.Bounds(      74.166667,18.163056,134.672222,53.5       );		
		break;
	//Christmas Island            // 
	   case        "CX"          :
		bounds = new OpenLayers.Bounds(      105.566667,-10.566667,105.75,-10.4        );		
		break;
	//Clipperton Island           // 
	//   case        "FR"          :
	 //   bounds = new OpenLayers.Bounds(      -109.216667,10.283333,-109.216667,10.28333);
	 //   
	 //   break;
	//Cocos (Keeling) Islands     // 
	   case        "CC"          :
		bounds = new OpenLayers.Bounds(      96.816667,-12.204167,96.918056,-11.833333 );		
		break;
	//Colombia                    // 
	   case        "CO"          :
		bounds = new OpenLayers.Bounds(      -81.85,-4.214722,-66.854722,13.383333     );		
		break;
	//Comoros                     // 
	   case        "KM"          :
		bounds = new OpenLayers.Bounds(      43.226111,-13,45.316667,-11.35            );		
		break;
	//Congo (Brazzaville)         // 
	   case        "CG"          :
		bounds = new OpenLayers.Bounds(      11.166667,-4.995556,20,3.866667           );		
		break;
	//Congo (Kinshasa)            // 
	   case        "CD"          :
		bounds = new OpenLayers.Bounds(      12.266667,-13.466667,31.233333,5.133333   );		
		break;
	//Cook Islands                // 
	   case        "CK"          :
		bounds = new OpenLayers.Bounds(      -171.783333,-21.953056,-157.3375,-8.918611);		
		break;
	//Coral Sea Islands           // 
	//  case        "AU"          :
	//    bounds = new OpenLayers.Bounds(      147.1,-29.472222,159.119444,-15.5         );
	//    
	//    break;
	//Costa Rica                  // 
	   case        "CR"          :
		bounds = new OpenLayers.Bounds(      -87.1,5.5,-82.05,11.216667                );		
		break;
	//Croatia                     // 
	   case        "HR"          :
		bounds = new OpenLayers.Bounds(      13.493333,42.380278,19.383056,46.526944   );		
		break;
	//Cte d'Ivoire                // 
	   case        "CI"          :
		bounds = new OpenLayers.Bounds(      -8.538889,4.35,-2.566667,10.652222        );		
		break;
	//Cuba                        // 
	   case        "CU"          :
		bounds = new OpenLayers.Bounds(      -84.950833,19.828056,-74.135,23.265833    );		
		break;
	//Cyprus                      // 
	   case        "CY"          :
		bounds = new OpenLayers.Bounds(      32.270833,34.566667,34.6,35.7             );		
		break;
	//Czech Republic              // 
	   case        "CZ"          :
		bounds = new OpenLayers.Bounds(      12.116667,40.65,25.5,59.65                );		
		break;
	//Denmark                     // 
	   case        "DK"          :
		bounds = new OpenLayers.Bounds(      4.516667,53.583333,18,64                  );		
		break;
	//Djibouti                    // 
	   case        "DJ"          :
		bounds = new OpenLayers.Bounds(      41,10.9825,43.451944,13                   );		
		break;
	//Dominica                    // 
	   case        "DM"          :
		bounds = new OpenLayers.Bounds(      -61.483333,15.2,-61.25,15.633333          );		
		break;
	//Dominican Republic          // 
	   case        "DO"          :
		bounds = new OpenLayers.Bounds(      -71.966667,17.473056,-68.316667,19.933333 );		
		break;
	//East Timor         // 
	   case        "TP"          :
		bounds = new OpenLayers.Bounds(      125.37,-8.85,127.33,-8.4           );		
		break;
	//Ecuador                     // 
	   case        "EC"          :
		bounds = new OpenLayers.Bounds(      -92,-4.95,-75.216667,1.65                 );		
		break;
	//Egypt                       // 
	   case        "EG"          :
		bounds = new OpenLayers.Bounds(      24.7,20.383333,36.333333,31.916667        );		
		break;
	//El Salvador                 // 
	   case        "SV"          :
		bounds = new OpenLayers.Bounds(      -90.116389,13.158611,-87.657222,14.433333 );		
		break;
	//Equatorial Guinea           // 
	   case        "GQ"          :
		bounds = new OpenLayers.Bounds(      5.05,-1.483333,11.4,3.783333              );		
		break;
	//Eritrea                     // 
	   case        "ER"          :
		bounds = new OpenLayers.Bounds(      36.483333,12.383333,43.114722,18.033333   );		
		break;
	//Estonia                     // 
	   case        "EE"          :
		bounds = new OpenLayers.Bounds(      21.795833,57.521389,28.883333,59.983333   );		
		break;
	//Ethiopia                    // 
	   case        "ET"          :
		bounds = new OpenLayers.Bounds(      33.033333,3.433333,47.45,14.698889        );		
		break;
	//Europa Island               // 
	//   case        "FR"          :
	 //   bounds = new OpenLayers.Bounds(      40.366667,-22.333333,40.366667,-22.333333 );
	//    
	//    break;
	//Falkland Islands            // 
	   case        "FK"          :
		bounds = new OpenLayers.Bounds(      -61.433333,-52.966667,-57.666667,-50.96666);
		break;
	//Faroe Islands               // 
	   case        "FO"          :
		bounds = new OpenLayers.Bounds(      -7.8,61.333333,-6.25,62.4                 );		
		break;
	//Fiji                        // 
	   case        "FJ"          :
		bounds = new OpenLayers.Bounds(      180,-21.016667,-179.983333,-12.466667     );		
		break;
	//Finland                     // 
	   case        "FI"          :
		bounds = new OpenLayers.Bounds(      18,58.83,32,70.083333                     );		
		break;
	//France                      // 
	   case        "FR"          :
		bounds = new OpenLayers.Bounds(      5.13,41.33,9.53,51.08                     );		
		break;
	//French Guiana               // 
	   case        "GF"          :
		bounds = new OpenLayers.Bounds(      -60,2.166667,-51.65,5.75                  );		
		break;
	//French Polynesia            // 
	   case        "PF"          :
		bounds = new OpenLayers.Bounds(      180,-27.916667,-179.8,16.633333           );		
		break;
	//French Southern Lands       // 
	   case        "TF"          :
		bounds = new OpenLayers.Bounds(      50.233333,-50.016667,77.6,-37.783333      );		
		break;
	//Gabon                       // 
	   case        "GA"          :
		bounds = new OpenLayers.Bounds(      8.7,-3.9,14.483333,2.283333               );		
		break;
	//Gambia                      // 
	   case        "GM"          :
		bounds = new OpenLayers.Bounds(      -16.816944,7,-4,13.816667                 );		
		break;
	//Gaza Strip                  // 
	   case        ""            :
		bounds = new OpenLayers.Bounds(      34.221389,31.216667,34.533333,31.566667   );		
		break;
	//Georgia                     // 
	   case        "GE"          :
		bounds = new OpenLayers.Bounds(      40.013056,41.15,46.635556,43.570556       );		
		break;
	//Germany                     // 
	   case        "DE"          :
		bounds = new OpenLayers.Bounds(      5.9,47.266667,15.033333,55.05             );		
		break;
	//Ghana                       // 
	   case        "GH"          :
		bounds = new OpenLayers.Bounds(      -4,4.733333,1.192778,11.15                );		
		break;
	//Gibraltar                   // 
	   case        "GI"          :
		bounds = new OpenLayers.Bounds(      -5.35,36.1,-5.333333,36.15                );		
		break;
	//Glorioso Islands            // 
	//   case        "FR"          :
	 //   bounds = new OpenLayers.Bounds(      47.3,-11.566667,47.366667,-11.5           );
	 //   
	 //   break;
	//Greece                      // 
	   case        "GR"          :
		bounds = new OpenLayers.Bounds(      19.381667,34.8,29.648056,44               );		
		break;
	//Greenland                   // 
	   case        "GL"          :
		bounds = new OpenLayers.Bounds(      -73.05,51.7,-12.133333,83.666667          );		
		break;
	//Grenada                     // 
	   case        "GD"          :
		bounds = new OpenLayers.Bounds(      -61.8,11.983333,-61.25,12.666667          );		
		break;
	//Guadeloupe                  // 
	   case        "GP"          :
		bounds = new OpenLayers.Bounds(      -63.15,15,-61,18.116667                   );		
		break;
	//Guatemala                   // 
	   case        "GT"          :
		bounds = new OpenLayers.Bounds(      -92.583333,13.751111,-87.05,17.816667     );		
		break;
	//Guernsey                    // 
	   case        "GG"          :
		bounds = new OpenLayers.Bounds(      -2.7,49.401111,-2.158056,49.733333        );		
		break;
	//Guinea                      // 
	   case        "GN"          :
		bounds = new OpenLayers.Bounds(      -15.366667,7,-4,12.633333                 );		
		break;
	//Guinea-Bissau               // 
	   case        "GW"          :
		bounds = new OpenLayers.Bounds(      -16.651944,5,-4,12.683333                 );		
		break;
	//Guyana                      // 
	   case        "GY"          :
		bounds = new OpenLayers.Bounds(      -61.233333,1.316667,-56,8.433333          );		
		break;
	//Haiti                       // 
	   case        "HT"          :
		bounds = new OpenLayers.Bounds(      -74.483333,18.016667,-71.633333,20.083333 );		
		break;
	//Heard and McDonald Islands  // 
	   case        "HM"          :
		bounds = new OpenLayers.Bounds(      72.566667,-53.2,73.85,-52.9               );		
		break;
	//Honduras                    // 
	   case        "HN"          :
		bounds = new OpenLayers.Bounds(      -89.333333,13.016667,-82.5,17.45          );		
		break;
	//Hong Kong SAR               // 
	   case        "HK"          :
		bounds = new OpenLayers.Bounds(      113.833333,22.15,114.433333,22.566667     );		
		break;
	//Hungary                     // 
	   case        "HU"          :
		bounds = new OpenLayers.Bounds(      16.183333,45.75,22.866667,48.983333       );		
		break;
	//Iceland                     // 
	   case        "IS"          :
		bounds = new OpenLayers.Bounds(      -24.533333,63.3,-13.2,66.566667           );		
		break;
	//India                       // 
	   case        "IN"          :
		bounds = new OpenLayers.Bounds(      67.016667,6.755556,97.35,35.95583333      );		
		break;
	//Indonesia                   // 
	   case        "ID"          :
		bounds = new OpenLayers.Bounds(      94.970278,-11,141.016667,10.616667        );	
		break;
	//Iran                        // 
	   case        "IR"          :
		bounds = new OpenLayers.Bounds(      27.4455,25.05,62,39.7754                  );		
		break;
	//Iraq                        // 
	   case        "IQ"          :
		bounds = new OpenLayers.Bounds(      38.800871,28.866667,48.833333,37.352778   );		
		break;
	//Ireland                     // 
	   case        "IE"          :
		bounds = new OpenLayers.Bounds(      -10.680833,51.425556,-6.0025,55.433333    );		
		break;
	//Isle of Man                 // 
	   case        "IM"          :
		bounds = new OpenLayers.Bounds(      -4.833333,54.033333,-4.316667,54.4        );		
		break;
	//Israel                      // 
	   case        "IL"          :
		bounds = new OpenLayers.Bounds(      34.283333,29.516667,35.666667,33.286111   );		
		break;
	//Italy                       // 
	   case        "IT"          :
		bounds = new OpenLayers.Bounds(      1.35,35.483333,20.433333,48.533333        );		
		break;
	//Jamaica                     // 
	   case        "JM"          :
		bounds = new OpenLayers.Bounds(      -78.366667,17,-70,18.533333               );		
		break;
	//Jan Mayen Island            // 
	   case        "SJ"          :
		bounds = new OpenLayers.Bounds(      -9.071944,70.826389,-7.933056,71.157778   );		
		break;
	//Japan                       // 
	   case        "JP"          :
		bounds = new OpenLayers.Bounds(      122.933333,20.416667,154,45.520833        );		
		break;
	//Jersey                      // 
	   case        "JE"          :
		bounds = new OpenLayers.Bounds(      -2.253889,49.112778,-1.927778,49.305833   );		
		break;
	//Jordan                      // 
	   case        "JO"          :
		bounds = new OpenLayers.Bounds(      34.9875,29,38.883333,33.002222            );		
		break;
	//Juan de Nova Island         // 
	 //  case        "FR"          :
	//    bounds = new OpenLayers.Bounds(      42.75,-17.05,42.75,-17.05                 );
	 //   
	 //   break;
	//Kazakhstan                  // 
	   case        "KZ"          :
		bounds = new OpenLayers.Bounds(      46.589722,40.416667,90,55.330556          );		
		break;
	//Kenya                       // 
	   case        "KE"          :
		bounds = new OpenLayers.Bounds(      27.433333,-4.716667,41.85838348,4.883333  );
		
		break;
	//Kiribati                    // 
	   case        "KI"          :
		bounds = new OpenLayers.Bounds(      179.716667,-10.3,-174.533333,4.716667     );
		
		break;
	//Kuwait                      // 
	   case        "KW"          :
		bounds = new OpenLayers.Bounds(      45,25,49.410556,30.069444                 );
		
		break;
	//Kyrgyzstan                  // 
	   case        "KG"          :
		bounds = new OpenLayers.Bounds(      69.333333,39.25,80.115833,43.016667       );
		
		break;
	//Laos                        // 
	   case        "LA"          :
		bounds = new OpenLayers.Bounds(      100.095833,13.933333,107.633333,22.5      );
		
		break;
	//Latvia                      // 
	   case        "LV"          :
		bounds = new OpenLayers.Bounds(      20.966667,55.7,28.2,58.066667             );
		
		break;
	//Lebanon                     // 
	   case        "LB"          :
		bounds = new OpenLayers.Bounds(      35.103611,33.078333,36.592778,34.69       );
		
		break;
	//Lesotho                     // 
	   case        "LS"          :
		bounds = new OpenLayers.Bounds(      24,-30.666667,29.316667,-28.616667        );
		
		break;
	//Liberia                     // 
	   case        "LR"          :
		bounds = new OpenLayers.Bounds(      -11.472222,4.328333,-4,9.5                );
		
		break;
	//Libya                       // 
	   case        "LY"          :
		bounds = new OpenLayers.Bounds(      5,20.8,25.5,33.15                         );
		
		break;
	//Liechtenstein               // 
	   case        "LI"          :
		bounds = new OpenLayers.Bounds(      9.5,47.05,9.75,47.233333                  );
		
		break;
	//Lithuania                   // 
	   case        "LT"          :
		bounds = new OpenLayers.Bounds(      21,53,27,56.441667                        );
		
		break;
	//Luxembourg                  // 
	   case        "LU"          :
		bounds = new OpenLayers.Bounds(      5.742778,49.460833,6.505833,50.181667     );
		
		break;
	//Macau                       // 
	   case        "MO"          :
		bounds = new OpenLayers.Bounds(      113.531389,22.1125,113.592222,22.216389   );
		
		break;
	//Macedonia                   // 
	   case        "MK"          :
		bounds = new OpenLayers.Bounds(      20.459167,40.866667,23.033333,42.373056   );
		
		break;
	//Madagascar                  // 
	   case        "MG"          :
		bounds = new OpenLayers.Bounds(      43.183333,-25.6,50.483333,-11.95          );
		
		break;
	//Malawi                      // 
	   case        "MW"          :
		bounds = new OpenLayers.Bounds(      32.716667,-17.15,37,-5                    );
		
		break;
	//Malaysia                    // 
	   case        "MY"          :
		bounds = new OpenLayers.Bounds(      99.641277,0.85,120,7.383333               );
		
		break;
	//Maldives                    // 
	   case        "MV"          :
		bounds = new OpenLayers.Bounds(      72.583333,-0.7,73.7,7.1                   );
		
		break;
	//Mali                        // 
	   case        "ML"          :
		bounds = new OpenLayers.Bounds(      -12.55,10.15,13,26                        );
		
		break;
	//Malta                       // 
	   case        "MT"          :
		bounds = new OpenLayers.Bounds(      14.185556,35.783889,14.575,36.081944      );
		
		break;
	//Marshall Islands            // 
	   case        "MH"          :
		bounds = new OpenLayers.Bounds(      160.8,4.566667,172.8,19.316667            );
		
		break;
	//Martinique                  // 
	   case        "MQ"          :
		bounds = new OpenLayers.Bounds(      -61.966667,14.383333,-60.816667,14.866667 );
		
		break;
	//Mauritania                  // 
	   case        "MR"          :
		bounds = new OpenLayers.Bounds(      -17.079444,14.73827339,13,26.9            );
		
		break;
	//Mauritius                   // 
	   case        "MU"          :
		bounds = new OpenLayers.Bounds(      56.6,-20.516667,72.466667,-5.25           );
		
		break;
	//Mayotte                     // 
	   case        "YT"          :
		bounds = new OpenLayers.Bounds(      45.024444,-12.993889,45.288611,-12.641389 );
		
		break;
	//Mexico                      // 
	   case        "MX"          :
		bounds = new OpenLayers.Bounds(      -119.921667,14.55,-86.716667,32.983333    );
		
		break;
	//Micronesia                  // 
	   case        "FM"          :
		bounds = new OpenLayers.Bounds(      137.425,1.026389,163.034444,10.093611     );
		
		break;
	//Moldova                     // 
	   case        "MD"          :
		bounds = new OpenLayers.Bounds(      26.672222,45.481667,30.096111,48.467222   );
		
		break;
	//Monaco                      // 
	   case        "MC"          :
		bounds = new OpenLayers.Bounds(      7.4,43.716667,7.439444,43.745833          );
		
		break;
	//Mongolia                    // 
	   case        "MN"          :
		bounds = new OpenLayers.Bounds(      87.783333,41.55,119.916667,52.1           );
		
		break;
	//Montenegro                  // 
	   case        "ME"          :
		bounds = new OpenLayers.Bounds(      18.438056,41.864167,20.3425,43.547778     );
		
		break;
	//Montserrat                  // 
	   case        "MS"          :
		bounds = new OpenLayers.Bounds(      -62.233333,16.666667,-62.15,16.816667     );
		
		break;
	//Morocco                     // 
	   case        "MA"          :
		bounds = new OpenLayers.Bounds(      -13.1,5.51,2,36.21                        );
		
		break;
	//Mozambique                  // 
	   case        "MZ"          :
		bounds = new OpenLayers.Bounds(      30.231389,-26.857222,40.845278,15.033333  );
		
		break;
	//Myanmar                     // 
	   case        "MM"          :
		bounds = new OpenLayers.Bounds(      92.190833,6,102,28.35                     );
		
		break;
	//Namibia                     // 
	   case        "NA"          :
		bounds = new OpenLayers.Bounds(      12.016667,-28.933333,25.25,-16.983333     );
		
		break;
	//Nauru                       // 
	   case        "NR"          :
		bounds = new OpenLayers.Bounds(      166.916667,-0.55,166.95,-0.5              );
		
		break;
	//Nepal                       // 
	   case        "NP"          :
		bounds = new OpenLayers.Bounds(      80,26.45,88.183333,30.45                  );
		
		break;
	//Netherlands                 // 
	   case        "NL"          :
		bounds = new OpenLayers.Bounds(      3.133333,50.75,7.2,53.583333              );
		
		break;
	//Netherlands Antilles        // 
	   case        "AN"          :
		bounds = new OpenLayers.Bounds(      -69.166667,12.016667,-62.933333,18.05     );
		
		break;
	//New Caledonia               // 
	   case        "NC"          :
		bounds = new OpenLayers.Bounds(      158.246667,-22.783333,172.05,-18.016667   );
		
		break;
	//New Zealand                 // 
	   case        "NZ"          :
		bounds = new OpenLayers.Bounds(      179.066667,-52.616667,-178.9,-29.216667   );
		
		break;
	//Nicaragua                   // 
	   case        "NI"          :
		bounds = new OpenLayers.Bounds(      -87.684167,10.716667,-82.566667,15        );
		
		break;
	//Niger                       // 
	   case        "NE"          :
		bounds = new OpenLayers.Bounds(      0.233333,11.716667,16,26                  );
		
		break;
	//Nigeria                     // 
	   case        "NG"          :
		bounds = new OpenLayers.Bounds(      2.716667,4.266667,14.65,13.866667         );
		
		break;
	//Niue                        // 
	   case        "NU"          :
		bounds = new OpenLayers.Bounds(      -169.916667,-19.1,-169.783333,-18.933333  );
		
		break;
	//Norfolk Island              // 
	   case        "NF"          :
		bounds = new OpenLayers.Bounds(      167.95,-29.05,167.95,-29.05               );
		
		break;
	//North Korea                 // 
	   case        "KP"          :
		bounds = new OpenLayers.Bounds(      124.1875,37.6775,130.672222,43.003889     );
		
		break;
	//Norway                      // 
	   case        "NO"          :
		bounds = new OpenLayers.Bounds(      3.033333,56.15,31.166667,71.181944        );
		
		break;
	//Oman                        // 
	   case        "OM"          :
		bounds = new OpenLayers.Bounds(      45,16.633333,59.838056,26.505             );
		
		break;
	//Pakistan                    // 
	   case        "PK"          :
		bounds = new OpenLayers.Bounds(      60.866667,23.966667,77.800014,37.0837107  );
		
		break;
	//Palau                       // 
	   case        "PW"          :
		bounds = new OpenLayers.Bounds(      131.175,2.898333,134.716389,8.166667      );
		
		break;
	//Panama                      // 
	   case        "PA"          :
		bounds = new OpenLayers.Bounds(      -82.95,7.213333,-77.283333,9.65           );
		
		break;
	//Papua New Guinea            // 
	   case        "PG"          :
		bounds = new OpenLayers.Bounds(      120,-11.65,159.483333,-0.733333           );
		
		break;
	//Paracel Islands             // 
	   case        "CN"          :
		bounds = new OpenLayers.Bounds(      106.7,6.183333,117.816667,20.7            );
		
		break;
	//Paraguay                    // 
	   case        "PY"          :
		bounds = new OpenLayers.Bounds(      -62.633333,-27.533333,-54.35,-19.333333   );
		
		break;
	//Peru                        // 
	   case        "PE"          :
		bounds = new OpenLayers.Bounds(      -81.358333,-18.333333,-68.833333,4.626667 );
		
		break;
	//Philippines                 // 
	   case        "PH"          :
		bounds = new OpenLayers.Bounds(      116.65,4.588889,126.604444,21.113056      );
		
		break;
	//Pitcairn                    // 
	   case        "PN"          :
		bounds = new OpenLayers.Bounds(      -130.733333,-25.066667,-124.783333,-23.916);
		
		break;
	//Poland                      // 
	   case        "PL"          :
		bounds = new OpenLayers.Bounds(      14,45.5,26.5,54.833333                    );
		
		break;
	//Portugal                    // 
	   case        "PT"          :
		bounds = new OpenLayers.Bounds(      -31.266667,30.033333,-5,42.15             );
		
		break;
	//Qatar                       // 
	   case        "QA"          :
		bounds = new OpenLayers.Bounds(      50.680556,24.284722,52.75,26.441111       );
		
		break;
	//Republic of Korea           // 
	   case        "KR"          :
		bounds = new OpenLayers.Bounds(      124.612222,33.1175,131.866667,38.586667   );
		
		break;
	//Reunion                     // 
	   case        "RE"          :
		bounds = new OpenLayers.Bounds(      55.216667,-21.366667,57,-20               );
		
		break;
	//Romania                     // 
	   case        "RO"          :
		bounds = new OpenLayers.Bounds(      19,43.666667,29.65,48.25                  );
		
		break;
	//Russian Federation          // 
	   case        "RU"          :
		bounds = new OpenLayers.Bounds(      19.655556,38.7,147.172222,86.216667       );
		
		break;
	//Rwanda                      // 
	   case        "RW"          :
		bounds = new OpenLayers.Bounds(      28.866667,-2.8,37,5                       );
		
		break;
	//Saint Helena                // 
	   case        "SH"          :
		bounds = new OpenLayers.Bounds(      -14.416667,-40.4,-5.633333,-7.9           );
		
		break;
	//Saint Kitts and Nevis       // 
	   case        "KN"          :
		bounds = new OpenLayers.Bounds(      -62.85,17.1,-62.516667,17.416667          );
		
		break;
	//Saint Lucia                 // 
	   case        "LC"          :
		bounds = new OpenLayers.Bounds(      -61.066667,13.7,-60.866667,14.1           );
		
		break;
	//Saint Pierre and Miquelon   // 
	   case        "PM"          :
		bounds = new OpenLayers.Bounds(      -56.405278,46.748333,-56.120556,47.139722 );
		
		break;
	//Saint Vincent and the Grenad// 
	   case        "VC"          :
		bounds = new OpenLayers.Bounds(      -61.433333,12.533333,-61.116667,13.366667 );
		
		break;
	//Samoa                       // 
	   case        "WS"          :
		bounds = new OpenLayers.Bounds(      -172.816667,-14.05,-171,-13.433333        );		
		break;
	//San Marino                  // 
	   case        "SM"          :
		bounds = new OpenLayers.Bounds(      12.416667,43.908333,12.5,43.966667        );		
		break;
	//Sao Tome and Principe       // 
	   case        "ST"          :
		bounds = new OpenLayers.Bounds(      6.466667,-0.016667,7.483333,1.733333      );		
		break;
	//Saudi Arabia                // 
	   case        "SA"          :
		bounds = new OpenLayers.Bounds(      34.566667,5,55.166667,32.2                );		
		break;
	//Senegal                     // 
	   case        "SN"          :
		bounds = new OpenLayers.Bounds(      -17.682778,12.336667,-11.37802139,16.66666);		
		break;
	//Serbia                      // 
	   case        "RS"          :
		bounds = new OpenLayers.Bounds(      18.928889,41.866667,22.966667,46.155556   );		
		break;
	//Serbia and Montenegro       // 
	   case        "CS"          :
		bounds = new OpenLayers.Bounds(      19.223056,42.556111,20.75,43.75           );		
		break;
	//Seychelles                  // 
	   case        "SC"          :
		bounds = new OpenLayers.Bounds(      46.216667,-10.216667,56.266667,-3.716667  );		
		break;
	//Sierra Leone                // 
	   case        "SL"          :
		bounds = new OpenLayers.Bounds(      -13.316667,5,-4,10                        );		
		break;
	//Singapore                   // 
	   case        "SG"          :
		bounds = new OpenLayers.Bounds(      102,1.159444,104.4075,4                   );		
		break;
	//Slovakia                    // 
	   case        "SK"          :
		bounds = new OpenLayers.Bounds(      17,45.5,26.5,49.6                         );		
		break;
	//Slovenia                    // 
	   case        "SI"          :
		bounds = new OpenLayers.Bounds(      13.426667,45.083333,17.466667,46.866667   );		
		break;
	//Solomon Islands             // 
	   case        "SB"          :
		bounds = new OpenLayers.Bounds(      155.516667,-12.883333,170.2,-5.166667     );		
		break;
	//Somalia                     // 
	   case        "SO"          :
		bounds = new OpenLayers.Bounds(      41,-1.659429696,51.4,11.983333            );		
		break;
	//South Africa                // 
	   case        "ZA"          :
		bounds = new OpenLayers.Bounds(      16.466667,-34.833333,32.883333,-22.133333 );		
		break;
	//South Georgia and South Sand// 
	   case        "GS"          :
		bounds = new OpenLayers.Bounds(      -38.305,-59.466667,-26.333333,-53.970278  );		
		break;
	//Spain                       // 
	   case        "ES"          :
		bounds = new OpenLayers.Bounds(      -18.166667,27.633333,4.333333,43.916667   );		
		break;
	//Spratly Islands             // 
	   case        ""            :
		bounds = new OpenLayers.Bounds(      111.916667,7.883333,116.9,16.966667       );		
		break;
	//Sri Lanka                   // 
	   case        "LK"          :
		bounds = new OpenLayers.Bounds(      79.516667,5.916667,81.866667,9.833333     );		
		break;
	//Sudan                       // 
	   case        "SD"          :
		bounds = new OpenLayers.Bounds(      31.36,22.07,28.360,9.47    );		
		break;
	//South Sudan                       // 
	   case        "SS"          :
		bounds = new OpenLayers.Bounds(      32.80,12.15,32.18,3.511    );		
		break;
	//Suriname                    // 
	   case        "SR"          :
		bounds = new OpenLayers.Bounds(      -60,2.1,-53.983333,6                      );		
		break;
	//Svalbard                    // 
	   case        "SJ"          :
		bounds = new OpenLayers.Bounds(      10.5,74.35,32.583333,80.816667            );		
		break;
	//Swaziland                   // 
	   case        "SZ"          :
		bounds = new OpenLayers.Bounds(      30.783333,-27.316667,32.133333,-25.783333 );		
		break;
	//Sweden                      // 
	   case        "SE"          :
		bounds = new OpenLayers.Bounds(      10.958333,46.758333,25,69.033333          );		
		break;
	//Switzerland                 // 
	   case        "CH"          :
		bounds = new OpenLayers.Bounds(      6,45.366667,10.5,49.866667                );		
		break;
	//Syria                       // 
	   case        "SY"          :
		bounds = new OpenLayers.Bounds(      35.6,32,42.337778,37.280278               );		
		break;
	//Taiwan                      // 
	   case        "TW"          :
		bounds = new OpenLayers.Bounds(      118.1152556,21.733333,122.107778,26.389444);		
		break;
	//Tajikistan                  // 
	   case        "TJ"          :
		bounds = new OpenLayers.Bounds(      67.416667,36.716667,75,40.9               );	
		break;
	//Tanzania                    // 
	   case        "TZ"          :
		bounds = new OpenLayers.Bounds(      29.583333,-11.7,40.433333,0.833333        );		
		break;
	//Thailand                    // 
	   case        "TH"          :
		bounds = new OpenLayers.Bounds(      97.366667,5.616667,105.766667,20.442778   );		
		break;
	//Timor-Leste                 // 
	   case        "TL"          :
		bounds = new OpenLayers.Bounds(      124.085556,-9.469722,127.336667,-7.597222 );		
		break;
	//Togo                        // 
	   case        "TG"          :
		bounds = new OpenLayers.Bounds(      -4,6.131944,1.816667,11.103889            );		
		break;
	//Tokelau                     // 
	   case        "TK"          :
		bounds = new OpenLayers.Bounds(      -172.516667,-9.433333,-171.183333,-8.53333);		
		break;
	//Tonga                       // 
	   case        "TO"          :
		bounds = new OpenLayers.Bounds(      -176.2,-22.333333,-150,-15.566667         );		
		break;
	//Trinidad and Tobago         // 
	   case        "TT"          :
		bounds = new OpenLayers.Bounds(      -74,10.033333,-60.5,20                    );		
		break;
	//Tromelin Island             // 
	//   case        "FR"          :
	//    bounds = new OpenLayers.Bounds(      54.416667,-15.866667,54.416667,-15.866667 );
	 //   
	//    break;
	//Tunisia                     // 
	   case        "TN"          :
		bounds = new OpenLayers.Bounds(      7,26,13,37.566667                         );		
		break;
	//Turkey                      // 
	   case        "TR"          :
		bounds = new OpenLayers.Bounds(      25,35.819444,44.8,42.1                    );		
		break;
	//Turkmenistan                // 
	   case        "TM"          :
		bounds = new OpenLayers.Bounds(      52.5,35.216667,66.65,42.566667            );		
		break;
	//Turks and Caicos Islands    // 
	   case        "TC"          :
		bounds = new OpenLayers.Bounds(      -72.466667,21.116667,-71.083333,21.95     );		
		break;
	//Tuvalu                      // 
	   case        "TV"          :
		bounds = new OpenLayers.Bounds(      176.116667,-10.75,179.883333,-5.65        );		
		break;
	//Uganda                      // 
	   case        "UG"          :
		bounds = new OpenLayers.Bounds(      29.583333,-1.433333,34.95,4.166667        );		
		break;
	//Ukraine                     // 
	   case        "UA"          :
		bounds = new OpenLayers.Bounds(      20.933333,37.8,68.85,63.4                 );		
		break;
	//United Arab Emirates        // 
	   case        "AE"          :
		bounds = new OpenLayers.Bounds(      45,22.166667,58,26.133333                 );		
		break;
	//United Kingdom              // 
	   case        "GB"          :
		bounds = new OpenLayers.Bounds(      -13.65,49.866667,2.866667,61.5 );		
		break;
	//United States               // 
	   case        "US"            :
		bounds = new OpenLayers.Bounds(      -130,30.1896,-79.7633, 45.0174   );		
		break;
	//Uruguay                     // 
	   case        "UY"          :
		bounds = new OpenLayers.Bounds(      -58.5,-35.033333,-53.266667,-30.183333    );		
		break;
	//Uzbekistan                  // 
	   case        "UZ"          :
		bounds = new OpenLayers.Bounds(      56.083333,35.266667,80.383333,48.583333   );		
		break;
	//Vanuatu                     // 
	   case        "VU"          :
		bounds = new OpenLayers.Bounds(      166.016667,-20.25,170.216667,-13.066667   );		
		break;
	//Vatican City                // 
	   case        "VA"          :
		bounds = new OpenLayers.Bounds(      12.45,41.9,12.45,41.9                     );		
		break;
	//Venezuela                   // 
	   case        "VE"          :
		bounds = new OpenLayers.Bounds(      -73.16,0.766667,-59.966667,15.7           );		
		break;
	//Viet Nam                    // 
	   case        "VN"          :
		bounds = new OpenLayers.Bounds(      102.216667,8.383333,109.466667,23.666667  );		
		break;
	//Wallis and Futuna Islands   // 
	   case        "WF"          :
		bounds = new OpenLayers.Bounds(      -178.183333,-14.35,-176.083333,-13.183333 );		
		break;
	//West Bank                   // 
	   case        ""            :
		bounds = new OpenLayers.Bounds(      34.083333,31.35,35.933333,32.545556       );		
		break;
	//Western Sahara              // 
	   case        "EH"          :
		bounds = new OpenLayers.Bounds(      -17.110556,20.8,-8.666667,27.666667       );		
		break;
	//Yemen                       // 
	   case        "YE"          :
		bounds = new OpenLayers.Bounds(      41.833333,12.1,54.533333,27.695278        );		
		break;
	//Zambia                      // 
	   case        "ZM"          :
		bounds = new OpenLayers.Bounds(      22,-18.05,39.283333,5                     );		
		break;
	//Zimbabwe                    // 
	   case        "ZW"          :
		bounds = new OpenLayers.Bounds(      25.333333,-22.316667,33.05,-15.6          );
		break;	
		}
		if(bounds.left !=0 && bounds.right !=0 && bounds.bottom !=0 && bounds.top !=0){	
			bounds = bounds.transform(map.displayProjection, map.getProjectionObject());
			map.zoomToExtent(bounds);
			bounds = new OpenLayers.Bounds(0,0,0,0);
		}
}

/*function checkAll(currentBox, num){
	// Based on the num (the Department), select all the sub-departments.
	   The displayAll do the actual checking and the de-checking of the checkBoxes - defined in the HTML file //
	var chStart = -1; 
	var chEnd = -1;
	var chMain = -1;
	switch(num){
		case 0:
				chStart=1; chEnd=14; chMain=100;
				break;
		case 1:
				chStart=15; chEnd=18; chMain=101;
				break;
		case 2:
				chStart=19; chEnd=20; chMain=102;
				break;
		case 3:
				chStart=21; chEnd=25; chMain=103;
				break;
		case 4:
				chStart=26; chEnd=30; chMain=104;
				break;
		case 5:
				chStart=31; chEnd=42; chMain=105;
				break;
		case 6:
				chStart=43; chEnd=46; chMain=106;
				break;
		case 7:
				chStart=47; chEnd=48; chMain=107;
				break;
		case 8:
				chStart=59; chEnd=63; chMain=108;
				break;
		case 9:
				chStart=64; chEnd=69; chMain=109;
				break;
	
	}
	if (currentBox.checked && chStart>=0){ 
		displayAll(true, chStart, chEnd); 
		displayAll(true, chMain, chMain);  
	} else{ 
		displayAll(false, chStart, chEnd); 
		displayAll(false, chMain, chMain);
	}
}*/

/*function openSubDeptDialog(selValue){
	// This function opens the sub-department selction dialog. Before that it closes open dialogs if any. //

	for(i=0; i<=10; i++){
		closeSubDeptDialog(i);
	}	
	switch(selValue){
		case 0:
			$deptDialog0.dialog('open');			
			break;
		case 1:
			$deptDialog1.dialog('open');
			break;
		case 2:
			$deptDialog2.dialog('open');
			break;
		case 3:
			$deptDialog3.dialog('open');
			break;
		case 4:
			$deptDialog4.dialog('open');
			break;
		case 5:
			$deptDialog5.dialog('open');
			break;
		case 6:
			$deptDialog6.dialog('open');
			break;
		case 7:
			$deptDialog7.dialog('open');
			break;
		case 8:
			$deptDialog8.dialog('open');
			break;
		case 9:
			$deptDialog9.dialog('open');
			break;
	}
}*/

/*function closeSubDeptDialog(selValue){
// This function closes the specified sub-department selction dialog. Before that it closes open dialogs if any. //
	switch(selValue){
		case 0:
			$deptDialog0.dialog('close');
			break;
		case 1:
			$deptDialog1.dialog('close');
			break;
		case 2:
			$deptDialog2.dialog('close');
			break;
		case 3:
			$deptDialog3.dialog('close');
			break;
		case 4:
			$deptDialog4.dialog('close');
			break;
		case 5:
			$deptDialog5.dialog('close');
			break;
		case 6:
			$deptDialog6.dialog('close');
			break;
		case 7:
			$deptDialog7.dialog('close');
			break;
		case 8:
			$deptDialog8.dialog('close');
			break;
		case 9:
			$deptDialog9.dialog('close');
			break;
	}
}

//Later merge this 2 functions into one if the open functin doesnt do anything else - ROHIT*/
	
	
	
	
	
	
	
	
	