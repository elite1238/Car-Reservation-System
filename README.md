A simple Car Reservation System using MERN stack.

Here I have used MongoDB Atlas for Cloud Deployment.
Used leaflet for maps.
Used Heigit api for routing in maps.

The project is split into 4 react folders and 1 nodejs(backend) folder.
The 4 react applications interact with each other.
Also I have used specific ports such as 5173,5174,5175,5176 for the react apps so each react app should run on specific port or you have to change routing and backend cors orgin those with the port you used.
You have to do npm install in each folder.
Then you have to do npm run dev.
You can modify the package.json and scripts then start to set port.

The backend nodejs runs on port 5000.
Make the backend to run on this port explictly or change the axios.ts in api folder(inside src) in frontend to match with your backend port number.

Use your own MongoDB Atlas key,Heigit key.

Insert the Admin information for login directly into the database.
You can add Drivers in from Admin login.
You can create client with the register option.

The project is kinda of messy since it is my first MERN project and I might have done some incorrect pratices.
Also more features can be added to the project and it can be optimized too.
