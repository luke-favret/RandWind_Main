import string
import sys
import json
import glob
import cv2
import numpy as np
from PIL import Image
import matplotlib.mlab as mlab
import matplotlib.pyplot as plt

def getRandomContours(num_angles, start_frame):
    vid_frames = glob.glob('./python/frames/frame*')
    angles_out = []
    curr_frame = 0
    angles = []
    #while loop to loop through as many frames needed to get as many contours as num_angles
    while len(angles) < num_angles:
        #im is the current frame or in a sense image being analyzed
        im = cv2.imread(vid_frames[curr_frame])
        #convert the image to grayscalle for image processing
        imgray = cv2.cvtColor(im,cv2.COLOR_BGR2GRAY)
        ret,thresh = cv2.threshold(imgray,127,255,0)
        #get the contours from the current frame
        contours, hierarchy = cv2.findContours(thresh,cv2.RETR_TREE,cv2.CHAIN_APPROX_SIMPLE)

        width, height = Image.open(vid_frames[curr_frame]).size
        img = np.zeros((height,width,3), np.uint8)

        #loop through all contours
        for i in range(len(contours)):
            #need contours with 5 or more reference points to fitEllipse which gets the angle orientation
            if(len(contours[i]) >= 5):
                img = cv2.drawContours(img, contours, -1, (0,255,0), 3)
                (x,y),(MA,ma),angle = cv2.fitEllipse(contours[i])
                #convert angle from 0 to 180 into a 0 or 1
                #if the angle is less than 90 degrees it becomes a 0
                #if the angle is greater than 90 degrees it becomes a 1
                if(angle == 0.0):
                    continue
                else:
                    if angle < 100:
                        angle = 0
                    else:
                        angle = 1
                    #append the 0 or 1
                    angles.append(angle)
            else:
                pass
        #checking for when to break the while loop
        #if number of angles = num_angles the function as gotten the correct number of angles
        if(len(angles) == num_angles):
            break
        #if the number of angles is greater than num_angles we want to trim angles down to the size of num_angles
        elif(len(angles) > num_angles):
            angles = angles[:num_angles]
            break
        #if we have not satisfied either of the two other options then the number of angles is not enough yet and the while loop should continue
        else:
            pass
        curr_frame = curr_frame + 1

    return angles, curr_frame


#this function is used to set up the number of 1  and 0 needed from contours
def driverFunc(numoptions,numreturns,frame):
    #list of ascii characters used for the 94 ascii character option
    ascii = string.printable
    ascii_list = list(ascii)
    myoutput = []
    #get the characters that will make up the random string
    #mynums - characters used for building random String
    #take - the number used for splitting the 1 and 0 that are used to determine each random characters
    #num01 = the number of 1 and 0 to be returned by the contours function
    if numoptions == 8:
        mynums = ["0","1","2","3","4","5","6","7"]
        take = 3
        num01 = 3*numreturns
    elif numoptions == 10:
        mynums = ["0","1","2","3","4","5","6","7","8","9"]
        num01 = 4*numreturns
        take = 3.5
    elif numoptions == 16:
        mynums = ["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"]
        take = 4
        num01 = 4*numreturns
    else:
        mynums = ascii_list
        take  = 7
        num01 = 7*numreturns
    #my1s is the array used to hold the 1 and 0 to make the random String
    #frame is the frame that contours stopped at
    my1s,frame = getRandomContours(num01,frame)

    #evertying below up to line 108 was used for testing through the server before the function getRandomContours was finished
    #must add './python/' before random10.txt to work with the server
    #my1s = []
    #with open('./python/random10.txt', "r") as myfile:
    #    filecont = myfile.read()
    #    i = 0
    #    while i <= num01:
    #        if i == len(filecont):
    #            break
    #        if filecont[i] == "0":
    #            my1s.append(0)
    #            i += 1
    #        elif filecont[i] == "1":
    #            my1s.append(1)
    #            i += 1
    #below is how the string of 1 and 0 is converted into the random string
    i = 0
    binary = []
    #this is for 8 characters
    if(take == 3):
        #take 3 1's and 0's(binary) and convert it to the assigned character
        for i in range(0,int(len(my1s)-1),3):
            binary.append(str(my1s[i])+str(my1s[i+1])+str(my1s[i+2]))
        for bin in binary:
            temp_num = int(bin,2)
            myoutput.append(mynums[temp_num])
    #this is for 10 characters
    elif(take == 3.5):
        #take 4 1's and 0's(binary) and convert it to the assigned character
        for i in range(0,int(len(my1s)-1),4):
            binary.append(str(my1s[i])+str(my1s[i+1])+str(my1s[i+2])+str(my1s[i+3]))
        for bin in binary:
            temp_num = int(bin,2)
            if(temp_num > 9):
                temp_num = int(bin[:-1],2)
                myoutput.append(mynums[temp_num])
            else:
                myoutput.append(mynums[temp_num])
    #this is for 16 characters
    elif(take == 4):
        #take 4 1's and 0's(binary) and convert it to the assigned character
        for i in range(0,int(len(my1s)-1),4):
            binary.append(str(my1s[i])+str(my1s[i+1])+str(my1s[i+2])+str(my1s[i+3]))
        for bin in binary:
            temp_num = int(bin,2)
            myoutput.append(str(mynums[temp_num]))
    #this is for 94 characters
    elif(take == 7):
        #take 7 1's and 0's(binary) and convert it to the assigned character
        for i in range(0,int(len(my1s)-1),7):
            binary.append(str(my1s[i])+str(my1s[i+1])+str(my1s[i+2])+str(my1s[i+3])+str(my1s[i+4])+str(my1s[i+5])+str(my1s[i+6]))
        for bin in binary:
            temp_num = int(bin,2)
            if(temp_num > 94):
                temp_num = int(bin[:-1],2)
                myoutput.append(mynums[temp_num])
            else:
                myoutput.append(mynums[temp_num])
    return myoutput,frame

if __name__ == '__main__':
    #print(int(sys.argv[1]))
    #print(int(sys.argv[2]))
    myoutput, frame = driverFunc(int(sys.argv[2]),int(sys.argv[1]), 0)
    #myoutput, frame = driverFunc(8,10, 0)
    myoutputSTR = ''.join(myoutput)
    print(myoutputSTR)
    #print(frame)
