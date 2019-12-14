import numpy as np
import sys
import cv2
import matplotlib.mlab as mlab
import matplotlib.pyplot as plt
from PIL import Image
import glob


def getRandomContours(num_angles, start_frame):
    vid_frames = glob.glob('./frames/frame*')
    angles_out = []
    curr_frame = 0
    angles = []
    #for a in range(len(vid_frames)):
    while len(angles) < num_angles:
        im = cv2.imread(vid_frames[curr_frame])
        imgray = cv2.cvtColor(im,cv2.COLOR_BGR2GRAY)
        ret,thresh = cv2.threshold(imgray,127,255,0)
        contours, hierarchy = cv2.findContours(thresh,cv2.RETR_TREE,cv2.CHAIN_APPROX_SIMPLE)

        width, height = Image.open(vid_frames[curr_frame]).size

        img = np.zeros((height,width,3), np.uint8)
        #img = cv2.drawContours(img, contours, -1, (0,255,0), 3)

        #loop through all contours
        for i in range(len(contours)):
            #need contours with 5 or more reference points to fitEllipse which gets the angle orientation
            if(len(contours[i]) >= 5):
                img = cv2.drawContours(img, contours, -1, (0,255,0), 3)
                (x,y),(MA,ma),angle = cv2.fitEllipse(contours[i])
                if(angle == 0.0):
                    continue
                else:
                    if angle < 90:
                        angle = 0
                    else:
                        angle = 1
                    #print('Angle: %.2f' % angle)
                    angles.append(angle)
            else:
                pass
        if(len(angles) == num_angles):
            break
        elif(len(angles) > num_angles):
            angles = angles[:num_angles]
            break
        else:
            pass

    return angles, curr_frame

if __name__ == '__main__':
    angles, endFrame = getRandomContours(38, 0)

    print(angles)
