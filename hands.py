import cv2
import mediapipe
import os
import pyautogui


capture_hands = mediapipe.solutions.hands.Hands()
drawing_option = mediapipe.solutions.drawing_utils

screen_width, screen_height = pyautogui.size()

camera = cv2.VideoCapture(0)

while True:
    _, image = camera.read()
    image_height, image_width, _ = image.shape
    image = cv2.flip(image, 1)
    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    output_hands = capture_hands.process(rgb_image)
    all_hands = output_hands.multi_hand_landmarks
    
    if all_hands:
        for hand in all_hands:
            drawing_option.draw_landmarks(image, hand)

            hand_landmarks = hand.landmark
            x1, y1 = None, None
            x2, y2 = None, None
            x3, y3 = None, None

            for id, lm in enumerate(hand_landmarks):
                x = int(lm.x * image_width)
                y = int(lm.y * image_height)
                
                
                if id == 8:
                    mouse_x = int(screen_width / image_width * x)
                    mouse_y = int(screen_height / image_height * y)
                    cv2.circle(image, (x, y), 10, (0, 255, 255), -1)
                    pyautogui.moveTo(mouse_x, mouse_y) 

                    x1, y1 = x, y 
                if id == 4: 
                    x2, y2 = x, y
                    cv2.circle(image, (x, y), 10, (0, 255, 255), -1)
                if id == 12: 
                    x3, y3 = x, y
                    cv2.circle(image, (x, y), 10, (0, 255, 255), -1)
            if x1 is not None and x2 is not None:
                dist_thumb_index = ((x2 - x1) ** 2 + (y2 - y1) ** 2) ** 0.5

                if dist_thumb_index < 30: 
                    pyautogui.click()
            if x1 is not None and x3 is not None:
                dist_index_middle = ((x3 - x1) ** 2 + (y3 - y1) ** 2) ** 0.5

                if dist_index_middle < 30:
                    pyautogui.rightClick()
    cv2.imshow("Hands Movement", image)

    key = cv2.waitKey(1)
    if key == 27:
        break
camera.release()
cv2.destroyAllWindows()
import cv2
import mediapipe
import os
import pyautogui


capture_hands = mediapipe.solutions.hands.Hands()
drawing_option = mediapipe.solutions.drawing_utils
screen_width, screen_height = pyautogui.size()
camera = cv2.VideoCapture(0)

while True:
    
    _, image = camera.read()
    image_height, image_width, _ = image.shape
    
    image = cv2.flip(image, 1)
   
    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
   
    output_hands = capture_hands.process(rgb_image)
    all_hands = output_hands.multi_hand_landmarks
    
    if all_hands:
        for hand in all_hands:
            drawing_option.draw_landmarks(image, hand) 
            hand_landmarks = hand.landmark
            x1, y1 = None, None
            x2, y2 = None, None
            x3, y3 = None, None

            for id, lm in enumerate(hand_landmarks):
                x = int(lm.x * image_width)
                y = int(lm.y * image_height)
                
                if id == 8: 
                    mouse_x = int(screen_width / image_width * x)
                    mouse_y = int(screen_height / image_height * y)
                    cv2.circle(image, (x, y), 10, (0, 255, 255), -1)
                    pyautogui.moveTo(mouse_x, mouse_y)

                    x1, y1 = x, y
                if id == 4:
                    x2, y2 = x, y
                    cv2.circle(image, (x, y), 10, (0, 255, 255), -1)
                if id == 12:
                    x3, y3 = x, y
                    cv2.circle(image, (x, y), 10, (0, 255, 255), -1)

            if x1 is not None and x2 is not None:
                dist_thumb_index = ((x2 - x1) ** 2 + (y2 - y1) ** 2) ** 0.5

                if dist_thumb_index < 30:
                    pyautogui.click() 

            if x1 is not None and x3 is not None:
                dist_index_middle = ((x3 - x1) ** 2 + (y3 - y1) ** 2) ** 0.5

                if dist_index_middle < 30:  
                    pyautogui.rightClick() 

    cv2.imshow("Hands Movement", image)

    key = cv2.waitKey(1)
    if key == 27:
        break

camera.release()
cv2.destroyAllWindows()
