# LIBR 559C: Python Programming

## Comment Detection in Code Files
* This is the repo for a simple Django project.
* Key files of this project are: blog/templates/blog/result.html, blog/templates/blog/simple_upload.html, blog/urls.py, blog/views.py, and project_7/urls.py.
* You can check the logic and relevant comments in these files.
* The "testCode" file contains source files used for testing. These source codes include all file formats and all comment types in this project.

## User Instruction
* Please visit the website at [link to app website](http://ryangao67.pythonanywhere.com/).
* You can upload a source file (.c, .cpp, .java, .js or .py) to server, by clicking "Choose File" button.
* Then you can submit the file by clicking "Upload" button.
* The application will then calculate the total lines, the comment lines, the total single-line comments, the total multi-line comments, the total chunks of multi-line comments, TODOs, and comment coverage.

## Definition
* Single-line comment: the comment line that does not form a chunk (block) of comments with previous/next line.
* Multi-line comment: the comment line that forms a chunk (block) of comments with previous/next comment line. It is included in a comment block.
* Chunk/Block comment: it consists of a few consecutive comment lines.
* Comment coverage: the amount of all comment lines divided by the amount of total lines in code file.
