from django.shortcuts import render, redirect
from django.conf import settings
from django.core.files.storage import FileSystemStorage

import os
import re
import math
# within = re.compile(r'\"\")

# Read the uploaded file
def openfile(filename, data):
    # Handle files in invalid formats
    if filename.startswith('.'):
        return "Hidden type of file, not supported!"
    if not (filename.endswith('.js') or filename.endswith('.cpp') or filename.endswith('.java') or filename.endswith('.c') or filename.endswith('.py')):
        return "Not a program file!"

    # Split the contents into lines, and store them in a list
    data = data.split('\n')
    data = [i.strip() for i in data]

    # Call "checkP" for Python file, or call "checkC" for other files
    if not filename.endswith('.py'):
        return checkC(data)
    else:
        return checkP(data)


# Check comments for files in C/C++, Java or JavaScript
def checkC(data):
    lines = len(data)
    marker = [] # Use a list to store the unmatched block-comment syntax "/*"
    comments_total = 0
    comments_multiple = 0
    comments_single = 0
    blocks = 0
    todos = 0

    # Process each line in the list
    for i in range(len(data)):
        temp = data[i]

        # Substitue all contents in double quote into space
        temp = re.sub(r"\".*?\"", " ", temp)

        if 'TODO' in temp:
            todos += 1

        # Get the indices (positions) of “//”, “/*” and “*/” in each line
        # c1 stores the position for "//", c2 for "/*" and c3 for "*/"
        c1 = re.finditer(r'\/\/', temp)
        c2 = re.finditer(r'\/\*', temp)
        c3 = re.finditer(r'\*\/', temp)

        # Assign infinity to c1, c2 or c3,
        # if the corresponding syntax can't be found.
        try:
            c1 = next(c1).start()
        except StopIteration:
            c1 = math.inf

        try:
            c2 = next(c2).start()
        except StopIteration:
            c2 = math.inf

        try:
            c3 = next(c3).start()
        except StopIteration:
            c3 = math.inf

        # If there is unmatched "/*" in the marker list
        if marker:
            # If "*/" is found, block comment finishes.
            if c3 < math.inf:
                marker.pop() # Pop the matched "/*"
                comments_total += 1
                comments_multiple += 1
                blocks += 1
            # If "*/" is not found, block comment doesn't finish.
            else:
                comments_total += 1
                comments_multiple += 1
        # If there is no unmatched "/*"
        else:
            # If "//" appears earlier than "/*", single-line comment appears.
            if c1<c2:
                comments_total += 1
                comments_single += 1
            # If "/*" appears earlier than "//", and "*/" doesn't appear,
            # block comment just starts
            elif c1 > c2 and not c3 < math.inf:
                comments_multiple += 1
                comments_total += 1
                marker.append('/*')
            # If "/*" appears earlier than "//", and "*/" appears,
            # block comment finishes in this line.
            elif c1 >c2 and c3<math.inf:
                print(temp)
                print(c1,c2,c3)
                comments_total += 1
                comments_multiple += 1
                blocks += 1

    return  'Number of total lines: ' + str(lines),\
    'Number of lines of all comments: ' + str(comments_total),\
    "Number of lines of multiple-line comments: "+ str(comments_multiple),\
    "Number of lines of single-line comments: " + str(comments_single),\
    "Number of blocks of multiple-line comments: " + str(blocks),\
    "Number of TODOs: " + str(todos),\
    "Comment coverage: " + str(comments_total/lines)


# Check comments for files in Python
def checkP(data):
    marker = 0
    lines = len(data)
    comments_total = 0
    comments_multiple = 0
    comments_single = 0
    blocks = 0
    todos = 0
    data = '\n'.join(data)

    # Substitue all double quotes and triple quotes into a space
    data = re.sub(r"\"\"\"", "^^^", data)
    data = re.sub(r"\'\'\'", "$$$", data)
    data = re.sub(r"\".*?\"", " ", data)
    data = re.sub(r"\'.*?\'", ' ', data)
    data = re.sub(r"\^\^\^((.|\n)*?)\^\^\^", " ", data)
    data = re.sub(r"\$\$\$((.|\n)*?)\$\$\$", " ", data)
    print(data)

    # Split the data into lines, and check each line
    data  = data.split('\n')
    for i in range(len(data)):
        temp = data[i]

        if "TODO" in temp:
            todos += 1

        # If the line starts with "#"
        if temp.startswith('#'):
            comments_total += 1
            marker += 1 # Mark the current line
        else:
            # If there is block comment in previous lines
            if marker > 1:
                blocks += 1
                comments_multiple += marker
                marker = 0
            # If there is single-line comment in the previous line
            if marker == 1:
                comments_single += marker
                marker = 0
            # If there is "#" in the middle or end of the current line
            if "#" in temp:
                comments_total += 1
                comments_single +=1

    # Process the last line which starts from "#"
    if marker == 1:
        comments_single += 1
    if marker > 1:
        comments_multiple += marker
        blocks += 1

    return  'Number of total lines: ' + str(lines),\
    'Number of lines of all comments: ' + str(comments_total),\
    "Number of lines of multiple-line comments: " + str(comments_multiple),\
    "Number of lines of single-line comments: " + str(comments_single),\
    "Number of blocks of multiple-line comments: " + str(blocks),\
    "Number of TODOs: " + str(todos),\
    "Comment coverage: " + str(comments_total/lines)


# File upload with Django
def simple_upload(request):
    # If the request method 'POST' performed by users
    if request.method == 'POST' and request.FILES['myfile']:
        myfile = request.FILES['myfile']
        result = (list(myfile.chunks())[0].decode("utf-8"))
        fs = FileSystemStorage()
        print(myfile.name)
        result = openfile(myfile.name, result) # Call "openfile" function
        filename = fs.save(myfile.name, myfile)
        uploaded_file_url = fs.url(filename)
        # Render to result.html to display results
        return render(request, 'blog/result.html', {
            'uploaded_file_url': result
        })
    # Otherwise, display the upload page to users
    return render(request, 'blog/simple_upload.html')
