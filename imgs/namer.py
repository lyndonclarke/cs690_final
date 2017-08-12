import os
count = 1
base = "sbrst_layout_var_"
for subdir, dirs, files in os.walk('./'):
    for file in files:
    	if file.endswith(".png"):
	    	newname = base + str(count) + ".png"
	    	os.rename(file, newname)
	    	count +=1
	    	print newname
	    	