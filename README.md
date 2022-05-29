# Engage
- [Installation](#installation)
  * [Python](#python)
  * [Git](#git)
  * [Nodejs](#nodejs)
  * [Libraries and Modules](#libraries-and-modules)
    + [Dlib](#dlib)
    + [opencv and face_recognition](#opencv-and-face-recognition)
  * [Creating .env file and adding keys](#creating-env-file-and-adding-keys)
  * [Run the project](#run-the-project)


 

## Installation
### Python

 Download python3.9.13 
https://www.python.org/downloads/release/python-3913/

 Add python path to environment variables

### Git

 Download and install git
 Clone the repository with this link https://github.com/nimmi09/Engage.git

   ```git clone https://github.com/nimmi09/Engage.git```
  
 ### Nodejs

 Download and install nodejs https://nodejs.org/en/download/

 Add nodejs path to environment variables
 
 ### Libraries and Modules

 Open Command Prompt for windows and terminal for linux

 cd to the directory where the project is installed and install the dependencies with

   ```npm install```

#### Dlib
 Install dlib from https://github.com/datamagic2020/Install-dlib/blob/main/dlib-19.22.99-cp39-cp39-win_amd64.whl

 Install dlib using pip install 
    ```pip install path_to_downloaded_dlib/dlib-19.22.99-cp39-cp39-win_amd64.whl```
#### opencv and face_recognition

 Install opencv and face_recognition module with 

    ```pip install opencv-python face_recognition```

### Creating .env file and adding keys 
 Create .env file in the root directory of the project

 Add the following environment variables to it

    DB_USER="peknqpxqhorerd"
    DB_PASSWORD="4f518cf0e424d3604eab95128ebd8764d3e93a8f73177e9a108d04071eecb35c"
    DB_HOST="ec2-52-204-195-41.compute-1.amazonaws.com"
    DB_PORT=5432
    DB_DATABASE="dafbdqd6u8vcr3"
    SESSION_SECRET="secret"
    
### Run the project

 Now run the project with ```npm run devStart```

 Enter localhost:3000 in the url bar to use the app


    
