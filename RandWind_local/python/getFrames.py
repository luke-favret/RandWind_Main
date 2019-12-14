import numpy as np
import sys
import cv2
import matplotlib.mlab as mlab
import matplotlib.pyplot as plt
from PIL import Image
import glob

def video():
    cap = cv2.VideoCapture('cfd.mp4')
    count = 0
    while cap.isOpened():
        ret,frame = cap.read()
        cv2.imshow('window-name',frame)
        cv2.imwrite("frame%d.jpg" % count, frame)
        count = count + 1
        if cv2.waitKey(10) & 0xFF == ord('q'):
            break
        # set to 100 frames or else it'll give you a million
        #if count == 100:
        #    return
    cap.release()
    cv2.destroyAllWindows()


if __name__ == '__main__':
    video()
