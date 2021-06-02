# super_leggera
# pip packages
$ pip install -r requirements.txt
# connection link for mongo-compass
mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass%20Community&ssl=false
# clear projects
localhost/clear_projects

# Super Leggera

## About Software

### Login Screen

#### Log-in Form

##### Logging in
User is prompted to Log In by either his registered **email** or **username**  
To finish log-in process, user must either **click** Log in button or **press enter**

##### Resetting password
If user has forgotten the login information, he can click the **reset password** link below the form inputs  

##### Signing up
If the user does not have an account, or wishes to create a new account he can do so by clicking on the **Sign up** button

![image](https://user-images.githubusercontent.com/10575726/120456793-3b293880-c396-11eb-80f1-f89dbfb32857.png)

#### Sign-up Form

##### Signing up
To Sign Up user must provide **First name**, **Last name**, a unique **username**, a unique **email**, and a **password**  
To complete a Sign Up process user must click **Sign Up** button or **press enter**  

![image](https://user-images.githubusercontent.com/10575726/120462420-37e47b80-c39b-11eb-8731-508809773c9a.png)



### Top Bar
Top Bar consists of three main areas:
* Terminal
* Interactive path
* Light/Dark Theme Switch

![image](https://user-images.githubusercontent.com/10575726/120463417-2fd90b80-c39c-11eb-89d4-9cf92666fef3.png)
![image](https://user-images.githubusercontent.com/10575726/120463547-4da67080-c39c-11eb-94bb-734416873177.png)

#### Terminal
Terminal is an interactive console-like input element which allows users to perform various actions from the Topbar  
* New folder
* Upload A File
* Tag Currently opened Folder/File/Project
* Search by Name
* Search by Tag
* Help

#### Interactive Path
![image](https://user-images.githubusercontent.com/10575726/120464634-6ebb9100-c39d-11eb-83c8-d5e8a9319967.png)

##### Purpose
Interactive path serves two purposes:
* To indicate user's *location* inside the project
* To navigate to previous folders or **The Projects List**  

User can click any folder in the Interactive path to instantly jump to that *location*  
Whenever the user enters a new folder, the interactive path is updated accordingly.  
The bolder font indicates that the part of the path is interactable, and the current location is normal font weigth as it is not interactable

##### When path is long
![image](https://user-images.githubusercontent.com/10575726/120464828-a4f91080-c39d-11eb-9b00-54a32aada6b7.png)

When the path becomes too long, interactive path will adapt so that it shows the first few and the last few Folders of the path, everything in between is hidden as **"..."**  
If the single location within the path is very long, the path will truncate the name and add ellipsis **"..."**  

