# Soccer Player Visualization 
This project is a web application that displays and visualizes a soccer player dataset. It includes a backend server to serve player information and a frontend displaying player information in an interactive table with linked visualizations showing the distributions of players' attributes. 

## How to run this app
1. Run Backend

    - Navigate to the `backend` directory, create a new virtual environment: `python3 -m venv venv`
    - Activate the virtual environment:
        - macOS/Linux: `source venv/bin/activate`
        - Windows: `.venv\Scripts\activate`
    - Install required pacakeges :  `pip install -r requirments.txt`
    - Run the server locally: ```python app.py```
2. Run Frontend
    -  Navigate to the `frontend` directory and open the `index.html` in your browser.

## Backend REST APIs
The backend server supports the following APIs:
* /players/ 
    - Method: GET
    - Description: returns all players and their attributes
    - Example Query: http://localhost:5000/players/ 
    - Sample Response:
    ```JSON5
    [
        {
            "Name":"Cristiano Ronaldo",
            "Nationality":"Portugal",
            "National_Position":"LS",
            "National_Kit":7,
            "Club":"Real Madrid",
            "Club_Position":"LW",
            //Other attributes ...
        },
        // Other players ...
    ]
    ```
* /players/{name} 
    - Method: GET
    - Description: returns a player and all the player attributes
    - Example Query: http://localhost:5000/players/Lionel%20Messi
    - Sample Response:
    ```JSON5
    {
        "Name":"Lionel Messi",
        "Nationality":"Argentina",
        "National_Position":"RW",
        "National_Kit":10,
        "Club":"FC Barcelona",
        "Club_Position":"RW",
         // Othere attributes ...
    }
    ```
* /clubs/ 
    - Method: GET
    - Description:  returns all clubs with a list of players playing for those clubs
    - Example Query: http://localhost:5000/clubs/
    - Sample Response:
    ```JSON5
    {
        "Real Madrid":["Cristiano Ronaldo","Gareth Bale","Luka Modri\u0107","Sergio Ramos","Toni Kroos","Pepe","James Rodr\u00edguez"],
        "FC Barcelona":["Lionel Messi","Neymar","Luis Su\u00e1rez","Iniesta","Ivan Rakiti\u0107","Piqu\u00e9","Sergio Busquets","Jordi Alba"],
        "FC Bayern":["Manuel Neuer","Robert Lewandowski","J\u00e9r\u00f4me Boateng","Mats Hummels","Philipp Lahm","Arturo Vidal","Arjen Robben","David Alaba","Thomas M\u00fcller","Thiago"]
        // Othere clubs ...
    }
    ```
* /attributes/
    - Method: GET
    - Description: returns a list of all attribute names
    - Example Query: http://localhost:5000/attributes/
    - Sample Response:
    ``` JSON5
    ["Name","Nationality","National_Position","National_Kit","Club","Club_Position","Club_Kit","Club_Joining","Contract_Expiry","Rating","Height","Weight","Preffered_Foot","Birth_Date","Age","Preffered_Position","Work_Rate","Weak_foot","Skill_Moves","Ball_Control","Dribbling","Marking","Sliding_Tackle","Standing_Tackle","Aggression","Reactions","Attacking_Position","Interceptions","Vision","Composure","Crossing","Short_Pass","Long_Pass","Acceleration","Speed","Stamina","Strength","Balance","Agility","Jumping","Heading","Shot_Power","Finishing","Long_Shots","Curve","Freekick_Accuracy","Penalties","Volleys","GK_Positioning","GK_Diving","GK_Kicking","GK_Handling","GK_Reflexes"]
    ```
    

## Front Interactions
The frontend consists of a table and a visualization panel. The table displays all the players with the selected attributes. The dropdown menu above the table allows adding/removing attributes from the table. 

The visualization panel consists of plots showing the distributions of the selected attributes. Categorical attributes are visualized using bar charts to show the frequency of each category, while numerical attributes are visualized using box plots with individual points representing each player. 

The table and the visualizations are linked: clicking on a row in the table will highlight the row and the player in all the plots (the corresponding bars in the bar charts and the corresponding points in the boxplots). Click the same row again to unselect it.
