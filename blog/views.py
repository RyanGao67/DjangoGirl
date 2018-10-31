from django.shortcuts import render, redirect
from django.conf import settings
from django.core.files.storage import FileSystemStorage


import os
    
    
import re
import math
# within = re.compile(r'\"\")
def openfile(filename, data):
    if filename.startswith('.'):
        return "Hidden type of file, not supported!"
    if not (filename.endswith('.js') or filename.endswith('.cpp') or filename.endswith('.java') or filename.endswith('.c') or filename.endswith('.py')):
        return "Not a program file!"
    data = data.split('\n')
    data = [i.strip() for i in data]
    for i in data:
        print(i)
    if not filename.endswith('.py'):
        return checkC(data)
    else:
        return checkP(data)
        
        
        
def checkC(data):
    lines = len(data)
    marker = []

    comments_total = 0
    comments_multiple = 0
    comments_single = 0
    blocks = 0
    todos = 0    
    for i in range(len(data)):
        # The current line
        
        temp = data[i] 
        temp = re.sub(r"\".*?\"", " ", temp)

        if 'TODO' in temp:
            todos+=1

        c1 = re.finditer(r'\/\/', temp)
        c2 = re.finditer(r'\/\*', temp)
        c3 = re.finditer(r'\*\/', temp)
        
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

        
        if marker:
            if c3<math.inf:
                marker.pop()
                comments_total+=1
                comments_multiple+=1
                blocks+=1
            else:
                comments_total+=1
                comments_multiple+=1
        else:
            if c1<c2:

                comments_total+=1
                comments_single+=1
            elif c1 > c2 and not c3<math.inf:

                comments_multiple+=1
                comments_total+=1
                marker.append('/*')
            elif c1 >c2 and c3<math.inf:
                print(temp)
                print(c1,c2,c3)
                comments_total+=1
                comments_multiple+=1
                blocks+=1
                
    return  'Number of total lines: '+str(lines),\
    'Number of lines of all comments: '+str(comments_total),\
    "Number of lines of multiple-line comments: "+ str(comments_multiple),\
    "Number of lines of single-line comments: " + str(comments_single) ,\
    "Number of blocks of multiple-line comments: "+ str(blocks) ,\
    "Number of TODOs: " + str(todos)

def checkP(data):
    marker = 0
    markerm = []
    lines = len(data)
    comments_total = 0
    comments_multiple = 0
    comments_single = 0
    blocks = 0
    todos = 0  
    data = '\n'.join(data)
    data = re.sub(r"\"\"\"", "^^^", data)
    data = re.sub(r"\'\'\'", "$$$", data)
    data = re.sub(r"\".*?\"", " ", data)
    data = re.sub(r"\'.*?\'", ' ', data)
    data = re.sub(r"\^\^\^((.|\n)*?)\^\^\^", " ", data)
    data = re.sub(r"\$\$\$((.|\n)*?)\$\$\$", " ", data)
    print(data)
    data  = data.split('\n')
    for i in range(len(data)):
        # The current line
        
        temp = data[i] 

        if "TODO" in temp:
            todos+=1
        if temp.startswith('#'):
            comments_total+=1
            marker += 1
            
        elif  marker>1:
            blocks+=1
            comments_multiple+=marker
            marker=0
            
        elif  marker==1:
            comments_single += marker
            marker=0
            
        elif "#" in temp:
            comments_total+=1
            comments_single+=1
    
    if marker==1:
        comments_single+=1
    if marker>1:
        comments_multiple+=marker
        blocks +=1


    return  'Number of total lines: '+str(lines),\
    'Number of lines of all comments: '+str(comments_total),\
    "Number of lines of multiple-line comments: "+ str(comments_multiple),\
    "Number of lines of single-line comments: " + str(comments_single) ,\
    "Number of blocks of multiple-line comments: "+ str(blocks) ,\
    "Number of TODOs: " 


def simple_upload(request):
    if request.method == 'POST' and request.FILES['myfile']:
        myfile = request.FILES['myfile']
        result = (list(myfile.chunks())[0].decode("utf-8"))
        fs = FileSystemStorage()
        print(myfile.name)
        result = openfile(myfile.name, result)
        filename = fs.save(myfile.name, myfile)
        uploaded_file_url = fs.url(filename)

        return render(request, 'blog/result.html', {
            'uploaded_file_url': result
        })
    return render(request, 'blog/simple_upload.html')
    
