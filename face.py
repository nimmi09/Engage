import sys
import json
import cv2
import numpy as np
import face_recognition
import os

rows=json.loads(sys.argv[2])
if (len(rows) ==0):
    print("no images to search from")
else:
    images=[]
    offender_id=[]
    print(rows[0]['path'])
    for row in rows:
        curImg = cv2.imread(row['path'])
        images.append(curImg)
        offender_id.append(row['offender_id'])
    
    imgTest = face_recognition.load_image_file(sys.argv[1])
    imgTest = cv2.cvtColor(imgTest,cv2.COLOR_BGR2RGB)
    faceLocTest = face_recognition.face_locations(imgTest)[0]
    encodeTest = face_recognition.face_encodings(imgTest)[0]
    def findEncodings(images):
        encodeList = []
        for img in images:
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            encode = face_recognition.face_encodings(img)[0]
            encodeList.append(encode)
            return encodeList
    encodeListKnown = findEncodings(images)

    matches = face_recognition.compare_faces(encodeListKnown,encodeTest)
    faceDis = face_recognition.face_distance(encodeListKnown,encodeTest)
    print(matches,faceDis)

    matchIndex = np.argmin(faceDis)
    if matches[matchIndex]:
        print(offender_id[matchIndex])



 
