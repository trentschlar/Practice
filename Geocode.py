#import necessary modules and set overwrite output to true
import arcpy
arcpy.env.overwriteOutput = True
import zipfile
import os

##set workspace
work_space = r'\\geoggrad.geog.tamu.edu\gradhomes\t_rentschalr\Desktop\MappingBooks_Final'
arcpy.env.workspace = work_space

data1 = work_space + '\Data\Data1.txt'
data2 = work_space + '\Data\Data3.txt'
new = work_space + '\Data\projectdata.txt'
text_file = open(new, 'wt')

# Can add other data pulls to this list to have added to the output
files = [data1,data2]

# Create Headers in Output Text File
text_file.write("Title"+"\t")
text_file.write("Continent"+'\t')
text_file.write("ConName" + '\t')
text_file.write("Country"+'\t')
text_file.write("NationName" + '\t')
text_file.write("State"+'\t')
text_file.write("StateName"+'\t')
text_file.write("Lat" + '\t')
text_file.write("Long" + '\t')
text_file.write("Subject"+"\t")
text_file.write("SubSubject"+"\t")
text_file.write("URL"+"\n")

for data in files:
	with open(data, "r") as f:
	# skip header line -- 1 line
		next(f)
		for line in f:
	# split the line into words based on spaces
			items = line.split('\t')
	#        a = str(items[0])
	#        b = str(items[1])
	#        c = str(items[2])
	#        d = str(items[3]) 
	#        print 'a =  ' + a + 'b =  ' + b + 'c =  ' + c  + 'd =  ' + d
	# Only work with lines that have the info you want
			if '-' in items[0]:
	# get the geo-codes from the first item
				try:
					cont = items[0][5:6]
				except:
					cont = ''
				try:
					country = items[0][7:9]
				except:
					country = ''
				try:
					state = items[0][10:12]
				except:
					state = ''               
	# get the subject and sub-subject code
				try:
					sub_code = items[1][1]
				except:
					sub_code = ''
				try:
					subsub_code = items[1][2]
				except:
					subsub_code = ''
				try:
					title = items[2]
				except:
					title = ''
				try:
					url = items[3]
				except:
					url = ''
	# Determine which continent the call number reffers too 
				if 'a' in cont:
					cont1= 'Asia'
					lat = 43.6728
					lon = 87.3253
					country1 = ''
					state1 = ''
					if 'af' in country:
						country1 = 'Afghanistan'
						lat = 33
						lon = 65
					elif 'ai' in country:
						country1 = 'Armenia'
						lat = 40
						lon = 45
					elif 'aj' in country:
						country1 = 'Azerbaijan'
						lat = 40.5
						lon = 47.5
					elif 'ba' in country:
						country1 = 'Bahrain'
						lat = 26
						lon = 50.5
					elif 'bg' in country:
						country1 = 'Bangladesh'
						lat = 24
						lon = 90
					elif 'bn' in country:
						country1 = 'Borneo'
						lat = 0
						lon = 0
					elif 'br' in country:
						country1 = 'Burma'
						lat = 22
						lon = 98
					elif 'bt' in country:
						country1 = 'Bhutan'
						lat = 27.5
						lon = 90.5
					elif 'bx' in country:
						country1 = 'Brunei'
						lat = 4.5
						lon = 114.666
					elif 'cb' in country:
						country1 = 'Cambodia'
						lat = 13
						lon = 105
					elif 'cc' in country:
						country1 = 'China'
						lat = 35
						lon = 105
						if 'an' in state:
							state1 = 'Anhui Sheng'
							lat = 31.8139 
							lon = 117.2316
						elif 'ch' in state:
							state1 = 'Zhejian Sheng'
							lat = 29.1772
							lon = 120.0802
						elif 'cq' in state:
							state1 = 'Chongqing'
							lat = 29.555
							lon = 106.5667
						elif 'fu' in state:
							state1 = 'Fujian Sheng'
							lat = 26.0731
							lon = 117.9804
						elif 'ha' in state:
							state1 = 'Hainan Sheng'
							lat = 18.9656
							lon = 109.8858
						elif 'he' in state:
							state1 = 'Heilongjiang Sheng'
							lat = 47.8959
							lon = 127.7852
						elif 'hh' in state:
							state1 = 'Hubei Sheng'
							lat = 30.9833
							lon = 112.2726
						elif 'hk' in state:
							state1 = 'Hong Kong'
							lat = 22.376
							lon = 114.1212
						elif 'ho' in state:
							state1 = 'Henan Sheng'
							lat = 33.8748
							lon = 113.615
						elif 'hp' in state:
							state1 = 'Hebei Sheng'
							lat = 39.5217
							lon = 116.1081
						elif 'hu' in state:
							state1 = 'Hunan Sheng'
							lat = 27.6049
							lon = 111.7157
						elif 'im' in state:
							state1 = 'Inner Mongolia'
							lat = 43.9062
							lon = 113.0497
						elif 'ka' in state:
							state1 = 'Gansu Sheng'
							lat = 37.7921
							lon = 101.1671
						elif 'kc' in state:
							state1 = 'Guangxi Zhuangzu Zizhiqu'
							lat = 23.8388
							lon = 108.7825
						elif 'ki' in state:
							state1 = 'Jiangxi Shen'
							lat = 27.6065
							lon = 115.7092
						elif 'kn' in state:
							state1 = 'Guangdong Sheng'
							lat = 23.357
							lon = 113.4055
						elif 'kr' in state:
							state1 = 'Jilin Sheng'
							lat = 43.6612
							lon = 126.2365
						elif 'ku' in state:
							state1 = 'Jiangsu Sheng'
							lat = 32.9724
							lon = 119.4573
						elif 'kw' in state:
							state1 = 'Guizhou Sheng'
							lat = 26.8165
							lon = 106.8715
						elif 'lp' in state:
							state1 = 'Liaoning Sheng'
							lat = 41.2887
							lon = 122.611
						elif 'mh' in state:
							state1 = 'Macau'
							lat = 22.2056
							lon = 113.5445
						elif 'nn' in state:
							state1 = 'Ningxia Huizu Zizhiqu'
							lat = 37.2592
							lon = 106.166
						elif 'pe' in state:
							state1 = 'Beijing'
							lat = 40.1872
							lon = 116.4075
						elif 'sh' in state:
							state1 = 'Shanxi Sheng'
							lat = 37.547
							lon = 112.2766
						elif 'sm' in state:
							state1 = 'Shanghai'
							lat = 31.1958
							lon = 121.4349
						elif 'sp' in state:
							state1 = 'Shandong Sheng'
							lat = 36.3343
							lon = 118.1287
						elif 'ss' in state:
							state1 = 'Shaanxi Sheng'
							lat = 35.1562
							lon = 108.8469
						elif 'su' in state:
							state1 = 'Xinjiang Uygur Zizhiqu'
							lat = 41.0432
							lon = 84.9959
						elif 'sz' in state:
							state1 = 'Sichuan Sheng'
							lat = 30.5437
							lon = 103.4664
						elif 'ti' in state:
							state1 = 'Tibet'
							lat = 31.5605
							lon = 88.5603
						elif 'tn' in state:
							state1 = 'Tianjin'
							lat = 39.3093
							lon = 117.336
						elif 'ts' in state:
							state1 = 'Qinghai Sheng'
							lat = 35.7527
							lon = 96.0043
						elif 'yu' in state:
							state1 = 'Yunnan Sheng'
							lat = 24.9721
							lon = 101.4957
						else:
							pass
					elif 'ce' in country:
						country1 = 'Sri Lanka'
						lat = 7
						lon = 81
					elif 'ch' in country:
						country1 = 'Taiwan'
						lat = 23.5
						lon = 121
					elif 'cy' in country:
						country1 = 'Cyprus'
						lat = 35
						lon = 33
					elif 'em' in country:
						country1 = 'Timor-Leste'
						lat = -8.8333
						lon = 125.9167
					elif 'gs' in country:
						country1 = 'Georgia'
						lat = 42
						lon = 43.5
					elif 'hk' in country:
						country1 = 'Hong Kong'
						lat = 22.25
						lon = 114.1666
					elif 'ii' in country:
						country1 = 'India'
						lat = 20
						lon = 77
					elif 'io' in country:
						country1 = 'Indonesia'
						lat = -5
						lon = 120
					elif 'iq' in country:
						country1 = 'Iraq'
						lat = 33
						lon = 44
					elif 'ir' in country:
						country1 = 'Iran'
						lat = 32
						lon = 53
					elif 'is' in country:
						country1 = 'Israel'
						lat = 31.5
						lon = 34.75
					elif 'ja' in country:
						country1 = 'Japan'
						lat = 36
						lon = 138
					elif 'jo' in country:
						country1 = 'Jordan'
						lat = 31
						lon = 36
					elif 'kg' in country:
						country1 = 'Kyrgyzstan'
						lat = 41
						lon = 75
					elif 'kn' in country:
						country1 = 'Korea (North)'
						lat = 40
						lon = 127
					elif 'ko' in country:
						country1 = 'Korea (South)'
						lat = 37
						lon = 127.5
					elif 'kr' in country:
						country1 = 'Korea'
						lat = 38.85
						lon = 127.25
					elif 'ku' in country:
						country1 = 'Kuwait'
						lat = 29.333
						lon = 47.6581
					elif 'kz' in country:
						country1 = 'Kazakhstan'
						lat = 48
						lon = 68
					elif 'le' in country:
						country1 = 'Lebanon'
						lat = 33.8333
						lon = 35.8333
					elif 'ls' in country:
						country1 = 'Laos'
						lat = 18
						lon = 105
					elif 'mk' in country:
						country1 = 'Oman'
						lat = 21
						lon = 57
					elif 'mp' in country:
						country1 = 'Mongolia'
						lat = 46
						lon = 105
					elif 'my' in country:
						country1 = 'Malaysia'
						lat = 2.5
						lon = 112.5
					elif 'np' in country:
						country1 = 'Nepal'
						lat = 28
						lon = 84
					elif 'pp' in country:
						country1 = 'Papua New Guinea'
						lat = -6
						lon = 147
					elif 'ph' in country:
						country1 = 'Philippines'
						lat = 13
						lon = 122
					elif 'pk' in country:
						country1 = 'Philippines'
						lat = 30
						lon = 70
					elif 'nw' in country:
						country1 = 'New Guinea'
						lat = 0
						lon = 0
					elif 'qa' in country:
						country1 = 'Qatar'
						lat = 25.5
						lon = 51.25
					elif 'si' in country:
						country1 = 'Singapore'
						lat = 1.3666
						lon = 103.8
					elif 'su' in country:
						country1 = 'Saudi Arabia'
						lat = 25
						lon = 45
					elif 'sy' in country:
						country1 = 'Syria'
						lat = 35
						lon = 38
					elif 'ta' in country:
						country1 = 'Tajikistan'
						lat = 39
						lon = 71
					elif 'th' in country:
						country1 = 'Thailand'
						lat = 15
						lon = 100
					elif 'tk' in country:
						country1 = 'Turkmenistan'
						lat = 40
						lon = 60
					elif 'ts' in country:
						country1 = 'United Arab Emirates'
						lat = 24
						lon = 54
					elif 'tu' in country:
						country1 = 'Turkey'
						lat = 39
						lon = 35
					elif 'uz' in country:
						country1 = 'Uzbekistan'
						lat = 41
						lon = 64
					elif 'vt' in country:
						country1 = 'Vietnam'
						lat = 16
						lon = 106
					elif 'ye' in country:
						country1 = 'Yemen (Republic)'
						lat = 15
						lon = 48
					else:
						pass
				elif 'e' in cont:
					cont1 = 'Europe'
					lat = 48.7333
					lon = 18.9333
					country1 = ''
					state1 = ''
					if 'aa' in country:
						country1 = 'Albania'
						lat = 41
						lon = 20
					elif 'an' in country:
						country1 = 'Andorra'
						lat = 42.5
						lon = 1.5
					elif 'au' in country:
						country1 = 'Austria'
						lat = 47.3333
						lon = 13.3333
					elif 'be' in country:
						country1 = 'Belgium'
						lat = 50.8333
						lon = 4
					elif 'be' in country:
						country1 = 'Belgium'
						lat = 50.8333
						lon = 4
					elif 'bn' in country:
						country1 = 'Bosnia and Hercegovina'
						lat = 44
						lon = 18
					elif 'bu' in country:
						country1 = 'Bulgaria'
						lat = 43
						lon = 25
					elif 'bw' in country:
						country1 = 'Belarus'
						lat = 53
						lon = 28
					elif 'ci' in country:
						country1 = 'Croatia'
						lat = 45.1666
						lon = 15.5
					elif 'cs' in country:
						country1 = 'Czechoslovakia'
						lat = 49.75
						lon = 15.5
					elif 'dk' in country:
						country1 = 'Denmark'
						lat = 56
						lon = 10
					elif 'er' in country:
						country1 = 'Estonia'
						lat = 59
						lon = 26
					elif 'fi' in country:
						country1 = 'Finland'
						lat = 64
						lon = 26
					elif 'fr' in country:
						country1 = 'France'
						lat = 46
						lon = 2
					elif 'ge' in country:
						country1 = 'Germany (East)'
						lat = 52.36
						lon = 13
					elif 'gi' in country:
						country1 = 'Gibraltar'
						lat = 36.1833
						lon = -5.3667
					elif 'gr' in country:
						country1 = 'Greece'
						lat = 39
						lon = 22
					elif 'gw' in country:
						country1 = 'Germany (West)'
						lat = 50.5833
						lon = 8.5
					elif 'gx' in country:
						country1 = 'Germany'
						lat = 51
						lon = 9
					elif 'hu' in country:
						country1 = 'Hungary'
						lat = 47
						lon = 20
					elif 'ic' in country:
						country1 = 'Iceland'
						lat = 65
						lon = -18
					elif 'ie' in country:
						country1 = 'Ireland'
						lat = 53
						lon = -8
					elif 'it' in country:
						country1 = 'Italy'
						lat = 42.8333
						lon = 12.8333
					elif 'kv' in country:
						country1 = 'Kosovo'
						lat = 42.5833
						lon = 21
					elif 'lh' in country:
						country1 = 'Liechtenstein'
						lat = 47.1667
						lon = 9.5333
					elif 'li' in country:
						country1 = 'Lithuania'
						lat = 56
						lon = 24
					elif 'lu' in country:
						country1 = 'Luxembourg'
						lat = 49.75
						lon = 6.1667
					elif 'lv' in country:
						country1 = 'Latvia'
						lat = 57
						lon = 25
					elif 'mc' in country:
						country1 = 'Monaco'
						lat = 43.7333
						lon = 7.4
					elif 'mm' in country:
						country1 = 'Malta'
						lat = 35.8333
						lon = 14.5833
					elif 'mo' in country:
						country1 = 'Montenegro'
						lat = 42.5
						lon = 19.3
					elif 'mv' in country:
						country1 = 'Moldova'
						lat = 47
						lon = 29
					elif 'ne' in country:
						country1 = 'Netherlands'
						lat = 52.5
						lon = 5.75
					elif 'no' in country:
						country1 = 'Norway'
						lat = 62
						lon = 10
					elif 'pl' in country:
						country1 = 'Poland'
						lat = 52
						lon = 20
					elif 'po' in country:
						country1 = 'Portugal'
						lat = 39.5
						lon = -8
					elif 'rb' in country:
						country1 = 'Serbia'
						lat = 44
						lon = 21
					elif 'rm' in country:
						country1 = 'Romania'
						lat = 46
						lon = 25
					elif 'ru' in country:
						country1 = 'Russia'
						lat = 60
						lon = 100
					elif 'sm' in country:
						country1 = 'San Marino'
						lat = 43.7667
						lon = 12.4167
					elif 'sp' in country:
						country1 = 'Spain'
						lat = 40
						lon = -4
					elif 'sw' in country:
						country1 = 'Sweden'
						lat = 62
						lon = 15
					elif 'sz' in country:
						country1 = 'Switzerland'
						lat = 47
						lon = 8
					elif 'uk' in country:
						country1 = 'Great Britain'
						lat = 54
						lon = -2
	# Could add England, Northern Ireland, Scotland, Dependencies, and Wales
					elif 'un' in country:
						country1 = 'Ukraine'
						lat = 49
						lon = 32
					elif 'ur' in country:
						country1 = 'Soviet Union'
						lat = 54.1833
						lon = 45.1833
					elif 'vc' in country:
						country1 = 'Vatican City'
						lat = 41.9
						lon = 12.45
					elif 'xn' in country:
						country1 = 'Macedonia'
						lat = 41.8333
						lon = 22
					elif 'xo' in country:
						country1 = 'Slovakia'
						lat = 48.6667
						lon = 19.5
					elif 'xr' in country:
						country1 = 'Czech Republic'
						lat = 49.75
						lon = 15.5
					elif 'xv' in country:
						country1 = 'Slovenia'
						lat = 46
						lon = 15
					elif 'yu' in country:
						country1 = 'Serbia and Montenegro'
						lat = 43.8833
						lon = 20.35
					else:
						pass
				elif 'f' in cont:
					cont1 = 'Africa'
					lat = 2.378
					lon = 16.063
					country1= ''
					state1 = ''
					if 'ae' in country:
						country1= 'Algeria'
						lat = 28
						lon = 3
					elif 'ao' in country:
						country1 = 'Angola'
						lat = -12.5
						lon = 18.5
					elif 'bd' in country:
						country1 = 'Burundi'
						lat = -3.5
						lon = 30
					elif 'bs' in country:
						country1 = 'Botswana'
						lat = -22
						lon = 24
					elif 'cd' in country:
						country1 = 'Chad'
						lat = 15
						lon = 19
					elif 'cf' in country:
						country1 = 'Congo'
						lat = -1
						lon = 15
					elif 'cg' in country:
						country1 = 'Democratic Republic of Congo'
						lat = 0
						lon = 25
					elif 'cm' in country:
						country1 = 'Cameroon'
						lat = 6
						lon = 12
					elif 'cx' in country:
						country1 = 'Central African Republic'
						lat = 7
						lon = 21
					elif 'dm' in country:
						country1 = 'Benin'
						lat = 9.5
						lon = 2.25
					elif 'ea' in country:
						country1 = 'Eritrea'
						lat = 15
						lon = 39
					elif 'eg' in country:
						country1 = 'Equatorial Guinea'
						lat = 2
						lon = 10
					elif 'et' in country:
						country1 = 'Ethiopia'
						lat = 8
						lon = 38
					elif 'ft' in country:
						country1 = 'Djibouti'
						lat = 11.5
						lon = 43
					elif 'gh' in country:
						country1 = 'Ghana'
						lat = 8
						lon = -2
					elif 'gm' in country:
						country1 = 'Gambia'
						lat = 13.4667
						lon = -16.5667
					elif 'go' in country:
						country1 = 'Gabon'
						lat = -1
						lon = 11.75
					elif 'gv' in country:
						country1 = 'Guinea'
						lat = 11
						lon = -10
					elif 'iv' in country:
						country1 = 'Côte dIvoire'
						lat = 8
						lon = -5
					elif 'ke' in country:
						country1 = 'Kenya'
						lat = 1
						lon = 38
					elif 'lb' in country:
						country1 = 'Liberia'
						lat = 6.5
						lon = -9.5
					elif 'lo' in country:
						country1 = 'Lesotho'
						lat = -29.5
						lon = 28.5
					elif 'ly' in country:
						country1 = 'Libya'
						lat = 25
						lon = 17
					elif 'mg' in country:
						country1 = 'Madagascar'
						lat = -20
						lon = 47
					elif 'ml' in country:
						country1 = 'Mali'
						lat = 17
						lon = -4
					elif 'mr' in country:
						country1 = 'Morocco'
						lat = 32
						lon = -5
					elif 'mu' in country:
						country1 = 'Mauritania'
						lat = 20
						lon = -12
					elif 'mw' in country:
						country1 = 'Malawi'
						lat = -13.5
						lon = 34
					elif 'mz' in country:
						country1 = 'Mozambique'
						lat = -18.25
						lon = 35
					elif 'ng' in country:
						country1 = 'Niger'
						lat = 16
						lon = 8
					elif 'nr' in country:
						country1 = 'Nigeria'
						lat = 10
						lon = 8
					elif 'pg' in country:
						country1 = 'Guinea-Bissau'
						lat = 12
						lon = -15
					elif 'rh' in country:
						country1 = 'Zimbabwe'
						lat = -20
						lon = 30
					elif 'sa' in country:
						country1 = 'South Africa'
						lat = -29
						lon = 24
					elif 'sd' in country:
						country1 = 'South Sudan'
						lat = 8
						lon = 30
					elif 'sf' in country:
						country1 = 'Sao Tome and Principe'
						lat = 1
						lon = 7
					elif 'sg' in country:
						country1 = 'Senegal'
						lat = 14
						lon = -14
					elif 'sh' in country:
						country1 = 'Spanish North Africa'
						lat = 0
						lon = 0
					elif 'sj' in country:
						country1 = 'Sudan'
						lat = 15
						lon = 30
					elif 'sl' in country:
						country1 = 'Sierra Leone'
						lat = 8.5
						lon = -11.5
					elif 'so' in country:
						country1 = 'Somalia'
						lat = 10
						lon = 49
					elif 'sq' in country:
						country1 = 'Swaziland'
						lat = -26.5
						lon = 31.5
					elif 'ss' in country:
						country1 = 'Western Sahara'
						lat = 24.5
						lon = -13
					elif 'sx' in country:
						country1 = 'Namibia'
						lat = -22
						lon = 17
					elif 'tg' in country:
						country1 = 'Togo'
						lat = 8
						lon = 1.1667
					elif 'ti' in country:
						country1 = 'Tunisia'
						lat = 34
						lon = 9
					elif 'tz' in country:
						country1 = 'Tanzania'
						lat = -6
						lon = 35
					elif 'ua' in country:
						country1 = 'Egypt'
						lat = 27
						lon = 30
					elif 'ug' in country:
						country1 = 'Uganda'
						lat = 1
						lon = 32
					elif 'uv' in country:
						country1 = 'Burkina Faso'
						lat = 13
						lon = -2
					elif 'za' in country:
						country1 = 'Zambia'
						lat = -15
						lon = 30
					else:
						pass
				elif 'n' in cont:
					cont1 = 'North America'
					lat = 48.1667
					lon = -100.1667
					country1=''
					state1 = ''
					if 'cn' in country:
						country1= 'Canada'
						lat = 60
						lon = -95
					elif 'gl' in country:
						country1 = 'Greenland'
						lat = 72
						lon = -40
					elif 'mx' in country:
						country1 = 'Mexico'
						lat = 23
						lon = -102
					elif 'us' in country:
						country1 = 'United States'
						lat = 38
						lon = -97
						if 'ak' in state:
							state1= 'Alaska'
							lat = 64.7317
							lon = -152.47
						elif 'al' in state:
							state1 = 'Alabama'
							lat = 32.8417
							lon = -86.6333
						elif 'ar' in state:
							state1 = 'Arkansas'
							lat = 34.815
							lon = -92.3017
						elif 'az' in state:
							state1 = 'Arizona'
							lat = 34.3083
							lon = -111.7933
						elif 'ca' in state:
							state1 = 'California'
							lat = 34.815
							lon = -92.3017
						elif 'co' in state:
							state1 = 'Colorado'
							lat = 38.9983
							lon = -105.6417 
						elif 'ct' in state:
							state1 = 'Connecticut'
							lat = 41.595
							lon = -72.7067
						elif 'dc' in state:
							state1 = 'Washington D.C.'
							lat = 39.1667
							lon = -76.85
						elif 'de' in state:
							state1 = 'Delaware'
							lat = 38.98
							lon = -75.5117
						elif 'fl' in state:
							state1 = 'Florida'
							lat = 28.1333
							lon = -81.6317
						elif 'ga' in state:
							state1 = 'Georgia'
							lat = 32.7133
							lon = -83.495
						elif 'hi' in state:
							state1 = 'Hawaii'
							lat = 20.9517
							lon = -157.2767
						elif 'ia' in state:
							state1 = 'Iowa'
							lat = 41.9617
							lon = -93.385
						elif 'id' in state:
							state1 = 'Idaho'
							lat = 44.2567
							lon = -114.9567
						elif 'il' in state:
							state1 = 'Illinois'
							lat = 40.0133
							lon = -89.3067
						elif 'in' in state:
							state1 = 'Indiana'
							lat = 39.895
							lon = -86.2667
						elif 'ks' in state:
							state1 = 'Kansas'
							lat = 38.4983
							lon = -98.6983
						elif 'ky' in state:
							state1 = 'Kentucky'
							lat = 37.3583
							lon = -85.5067
						elif 'la' in state:
							state1 = 'Louisiana'
							lat = 30.9683
							lon = -92.5367
						elif 'ma' in state:
							state1 = 'Massachusetts'
							lat = 42.34
							lon = -72.0317
						elif 'md' in state:
							state1 = 'Maryland'
							lat = 39.4417
							lon = -77.3717
						elif 'me' in state:
							state1 = 'Maine'
							lat = 45.2533
							lon = -69.2333
						elif 'mi' in state:
							state1 = 'Michigan'
							lat = 45.0617
							lon = -84.9383
						elif 'mn' in state:
							state1 = 'Minnesota'
							lat = 46.3548
							lon = -94.2005
						elif 'mo' in state:
							state1 = 'Missouri'
							lat = 38.495
							lon = -92.6317
						elif 'ms' in state:
							state1 = 'Mississippi'
							lat = 32.815
							lon = -89.7167
						elif 'mt' in state:
							state1 = 'Montana'
							lat = 47.0317
							lon = -109.6383
						elif 'nb' in state:
							state1 = 'Nebraska'
							lat = 35.6033
							lon = -79.455
						elif 'nc' in state:
							state1 = 'North Carolina'
							lat = 47.4117
							lon = -100.5683
						elif 'nd' in state:
							state1 = 'North Dakota'
							lat = 41.525
							lon = -99.8617
						elif 'nh' in state:
							state1 = 'New Hampshire'
							lat = 43.6417
							lon = -71.5717
						elif 'nj' in state:
							state1 = 'New Jersey'
							lat = 40.07
							lon = -74.5583
						elif 'nm' in state:
							state1 = 'New Mexico'
							lat = 34.5017
							lon = -106.1117
						elif 'nv' in state:
							state1 = 'Nevada'
							lat = 39.505
							lon = -116.9317
						elif 'ny' in state:
							state1 = 'New York'
							lat = 42.965
							lon = -76.0167
						elif 'oh' in state:
							state1 = 'Ohio'
							lat = 40.3617
							lon = -82.7417
						elif 'ok' in state:
							state1 = 'Oklahoma'
							lat = 35.5367
							lon = -97.66
						elif 'or' in state:
							state1 = 'Oregon'
							lat = 43.8683
							lon = -120.9783
						elif 'pa' in state:
							state1 = 'Pennsylvania'
							lat = 40.8967
							lon = -77.7467
						elif 'ri' in state:
							state1 = 'Rhode Island'
							lat = 41.6717
							lon = -71.5767
						elif 'sc' in state:
							state1 = 'South Carolina'
							lat = 33.83
							lon = -80.8733
						elif 'sd' in state:
							state1 = 'South Dakota'
							lat = 44.4017
							lon = -100.4783
						elif 'tn' in state:
							state1 = 'Tennessee'
							lat = 35.795
							lon = -86.6217
						elif 'tx' in state:
							state1 = 'Texas'
							lat = 31.2433
							lon = -99.4583
						elif 'ut' in state:
							state1 = 'Utah'
							lat = 39.3867
							lon = -111.685
						elif 'va' in state:
							state1 = 'Virginia'
							lat = 37.4883
							lon = -78.5633
						elif 'vt' in state:
							state1 = 'Vermont'
							lat = 43.9267
							lon = -72.6717
						elif 'wa' in state:
							state1 = 'Washington State'
							lat = 47.3333
							lon = -120.2683
						elif 'wi' in state:
							state1 = 'Wisconsin'
							lat = 44.4333
							lon = -89.7633
						elif 'wv' in state:
							state1 = 'West Virginia'
							lat = 38.5983
							lon = -80.7033
						elif 'wy' in state:
							state1 = 'Wyoming'
							lat = 42.9717
							lon = -107.6717
						else:
							pass
					else:
						pass
				elif 's' in cont:
					cont1 = 'South America'
					lat = -15.5908
					lon = -56.0915
					country1=''
					state1 = ' '
					if 'ag' in country:
						country1= 'Argentina'
						lat = -34
						lon = -64
					elif 'bl' in country:
						country1 = 'Brazil'
						lat = -10
						lon = -55
					elif 'bo' in country:
						country1 = 'Bolivia'
						lat = -17
						lon = -65
					elif 'cl' in country:
						country1 = 'Chile'
						lat = -30
						lon = -71
					elif 'ck' in country:
						country1 = 'Colombia'
						lat = 4
						lon = -72
					elif 'ec' in country:
						country1 = 'Ecuador'
						lat = -2
						lon = -77.5
					elif 'fg' in country:
						country1 = 'French Guiana'
						lat = 4
						lon = -53
					elif 'gy' in country:
						country1 = 'Guyana'
						lat = 5
						lon = -59
					elif 'pe' in country:
						country1 = 'Peru'
						lat = -10
						lon = -76
					elif 'py' in country:
						country1 = 'Paraguay'
						lat = -23
						lon = -58
					elif 'sr' in country:
						country1 = 'Suriname'
						lat = 4
						lon = -56
					elif 'uy' in country:
						country1 = 'Uruguay'
						lat = -33
						lon = -56
					elif 've' in country:
						country1 = 'Venezuela'
						lat = 8
						lon = -66 
					else:
						pass
				elif 'u' in cont:
					cont1 = 'Australasia'
					lat = -27
					lon = 133
					country1= ''
					state1 = ''
					if 'at' in country:
						country1= 'Australia'
						lat = -27
						lon = 133
					elif 'cs' in country:
						country1 = 'Coral Sea Islands'
						lat = -17.811
						lon = 178.031
					elif 'nz' in country:
						country1 = 'New Zealand'
						lat = -42
						lon = 173
					else:
						pass
				elif 't' in cont:
					cont1 = 'Antarctica'
					lat = -90
					lon = 0
					country1 = ''
					state1 = ''
				else:
					pass

	#            print cont, country, state, sub_code, subsub_code, title
				text_file.write(title+ '\t')
				text_file.write(cont+'\t')
				text_file.write(cont1 + '\t')
				text_file.write(country+'\t')
				text_file.write(country1 + '\t')
				text_file.write(state+'\t')
				text_file.write(state1+'\t')
				text_file.write(str(lat) + '\t')
				text_file.write(str(lon) + '\t')
				text_file.write(sub_code+'\t')
				text_file.write(subsub_code+'\t')
				text_file.write(url+'\n')
			else:
	# work with all the other lines down here
				pass

text_file.close()

#create new feature classes, point & polygon
smallestgeog_Layers = 'smallestgeog_Layers'
arcpy.MakeXYEventLayer_management(new, "long", "lat", smallestgeog_Layers, "GEOGCS['GCS_WGS_1984',DATUM['D_WGS_1984',SPHEROID['WGS_1984',6378137.0,298.257223563]],PRIMEM['Greenwich',0.0],UNIT['Degree',0.0174532925199433]];-400 -400 1000000000;-100000 10000;-100000 10000;8.98315284119522E-09;0.001;0.001;IsHighPrecision", "")

# Convert the shapefile to a KMZ
mapping_kmz = work_space + '\mapping.kmz'
arcpy.LayerToKML_conversion(smallestgeog_Layers, mapping_kmz, "0", "false", "DEFAULT", "1024", "96", "ABSOLUTE")


# Unzip the KMZ to a KML
kml = work_space + '\kms'
kmz = zipfile.ZipFile(mapping_kmz)
kmz.extractall(kml)
kmz.close()

# delete the kmz file
os.remove(mapping_kmz)
os.rename(kml + '\doc.kml', kml + '\geog_smallest.kml')

print 'done'
