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

#### Light/Dark Theme Switch
A button which the user can click to toggle between the Light and the Dark modes of the interface.

![image](https://user-images.githubusercontent.com/10575726/120473356-3a4cd280-c3a7-11eb-937e-e0f26f10a59a.png)

![image](https://user-images.githubusercontent.com/10575726/120473386-4173e080-c3a7-11eb-8897-a57851f639c9.png)

### Sidebar
Sidebar consists of elements which take the user to various sections of the application:
* User profile
* Projects
* Marketplace
* 3D Viewer
* Trash bin
* Logout

Clicking on each makes asynchronous request and displays a different section inside the **Dashboard**

![image](https://user-images.githubusercontent.com/10575726/120473783-ae877600-c3a7-11eb-9894-aec5aae22a26.png)

## Sections
The software consist of various sections that serve a different purpose each:
* User profile
* Projects
* Marketplace
* 3D Viewer
* Trash bin
* Logout

### User profile
User profile is an area in which the user can edit his profile details as well as credentials: 
* Profile picture
* First name [input]
* Last name [input]
* Username [input]
* Email [input]
* Password [input]
* Company Code [input]
* Company Name [input]
* Role Code [input]

![image](https://user-images.githubusercontent.com/10575726/120476588-096e9c80-c3ab-11eb-8fef-15aef6223c42.png)

By clicking on a profile picture, user can upload an existing photo  
By changing any of the forementioned input fields, user must click **Update** button to save changes  

#### Changing the email
In order to change e-mail user must confirm this request via:
1. The link received in old email mailbox
2. Confirming the security code received in old email mailbox

#### Changing the password
In order to change the password user must enter **old password** as well as the **new password** to complete this request  
